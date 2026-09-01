import { Link, useNavigate, useLocation } from "react-router";
import React, { Suspense, lazy, useEffect, useRef, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import { Bars3Icon, UserIcon, CogIcon, ArrowRightOnRectangleIcon, CreditCardIcon, BellIcon, ChatBubbleLeftRightIcon } from "@heroicons/react/20/solid";
import { useAuth } from "~/contexts/useAuth";
import ThemeToggle from "~/components/ui/ThemeToggle";
import { API_BASE_URL } from "~/config/api";
import { useAccountChoiceStatus } from "~/hooks/useAccountChoiceStatus";
import { useNotifications } from "~/hooks/useNotifications";
import { useSSESubscriptionSafe } from "~/hooks/useSSESubscription";
import { useWebSocketContextSafe } from "~/contexts/WebSocketContext";
import { getAccessTokenFromCookies } from '~/utils/cookie';
import notificationsService from '~/services/grpc/notifications.service';
import { getStoredCanonicalProfileType, getStoredUser, getStoredUserId, getStoredUserProfileId } from '~/utils/authStorage';
import { shouldSilenceGatewayError } from '~/services/grpc/client';
import { cachedRequest } from '~/utils/requestCache';
import { countUnattendedHiringRecords, hiringAttentionScope, hydrateHiringAttention } from '~/utils/hiringAttention';
import { collapseApplicationContracts } from '~/utils/hiringIdentifiers';
import { PWAInstallMenuButton } from '~/components/PWAInstallPrompt';
import { MobileBottomNavigation } from '~/components/MobileBottomNavigation';
import { PROFILE_AVATAR_UPDATED_EVENT, firstProfileAvatar, getStoredProfileAvatar } from '~/utils/profileAvatar';
import { openAdminDashboard } from '~/utils/adminDashboard';

const NAV_COUNT_STALE_MS = 2 * 60_000;
const NAV_ADMIN_STALE_MS = 10 * 60_000;

const NotificationsModal = lazy(() => import('~/components/notifications/NotificationsModal'));

function useCoalescedRefresh(callback: () => void, delayMs = 250) {
    const timerRef = useRef<number | null>(null);
    const latestRef = useRef(callback);
    latestRef.current = callback;

    useEffect(() => () => {
        if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    }, []);

    return React.useCallback(() => {
        if (timerRef.current !== null) return;
        timerRef.current = window.setTimeout(() => {
            timerRef.current = null;
            latestRef.current();
        }, delayMs);
    }, [delayMs]);
}

const navigation = [
    { name: "Services", href: "/services" },
    { name: "Blog", href: "/blog" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Pricing", href: "/pricing" },
];

function normalizeProfileRole(profileType?: string | null): 'client' | 'service-provider' | 'bureau' | null {
    const normalized = String(profileType || '').trim().toUpperCase();
    if (!normalized) return null;
    if (normalized === 'CLT' || normalized === 'CLIENT' || normalized === 'HOUSEHOLD') return 'client';
    if (normalized === 'SVC_PVD' || normalized === 'SVD_PDD' || normalized === 'SERVICE_PROVIDER' || normalized === 'SERVICE PROVIDER') return 'service-provider';
    if (normalized === 'BUREAU') return 'bureau';
    return null;
}

function NavigationContent() {
    const { user, logout, loading } = useAuth();
    const { isInSetupMode } = useAccountChoiceStatus();
    const location = useLocation();
    const isAccountProfileRoute = location.pathname === '/profile';
    const allowAuxiliaryAccountCalls = !isAccountProfileRoute;
    const authUser = (user as any)?.user ?? null;
    const storedUser = getStoredUser();
    const currentUser = authUser ?? storedUser ?? null;
    const [profileType, setProfileType] = useState<string | null>(null);
    const [userName, setUserName] = useState<string | null>(null);
    const [profileAvatar, setProfileAvatar] = useState<string>('');
    const [inboxCount, setInboxCount] = useState<number>(0);
    const [hireRequestCount, setHireRequestCount] = useState<number>(0);
    const [savedCount, setSavedCount] = useState<number>(0);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const { unreadCount } = useNotifications({ pollingMs: 5 * 60_000, pageSize: 20, enabled: allowAuxiliaryAccountCalls });
    const navigate = useNavigate();

    useEffect(() => {
        const handleAvatarUpdate = (event: Event) => {
            const detail = (event as CustomEvent<{ userId?: string; url?: string }>).detail || {};
            const currentUserId = getStoredUserId() || String((currentUser as any)?.user_id || (currentUser as any)?.id || '');
            if (!detail.userId || !currentUserId || detail.userId === currentUserId) {
                setProfileAvatar(detail.url || '');
            }
        };
        window.addEventListener(PROFILE_AVATAR_UPDATED_EVENT, handleAvatarUpdate);
        return () => window.removeEventListener(PROFILE_AVATAR_UPDATED_EVENT, handleAvatarUpdate);
    }, [currentUser]);


    // Detect if running on app subdomain
    const isAppHost = React.useMemo(() => {
        if (typeof window === 'undefined') return false;
        const host = window.location.host || '';
        // Only check for production app subdomain
        return host.startsWith('app.') || host === 'app.homebit.co.ke';
    }, []);

    const adminDashboardUrl = React.useMemo(() => {
        if (typeof window === 'undefined') return 'https://hba.homebit.co.ke';
        const hostname = window.location.hostname.toLowerCase();
        return hostname === 'preprod.homebit.co.ke' || hostname.startsWith('preprod.') || hostname === 'localhost'
            ? 'https://preprod-hba.homebit.co.ke'
            : 'https://hba.homebit.co.ke';
    }, []);

    // The root route is the real dashboard for both profiles: it resolves the
    // signed-in role and renders HouseholdJobsHome or ServiceProviderJobsHome. The
    // /household and /househelp paths are layout namespaces, not home pages;
    // linking the mobile Home tab to them produced a 404 on direct navigation.
    const dashboardPath = React.useMemo(() => {
        const role = normalizeProfileRole(profileType);
        if (!role) return null;
        if (role === "client" || role === "service-provider") return "/";
        // Bureau users should not access regular navigation
        return null;
    }, [profileType]);

    // The admin button is for someone who is both an admin and a person on the
    // website — a household or a househelp. Being an admin alone is not enough:
    // an account with no profile yet, or a bureau account, has no business on
    // the site's own navigation, and dashboardPath is already exactly the
    // "household or househelp" test.
    const canSeeAdminDashboard = Boolean(user && isAdmin && dashboardPath);
    const handleAdminDashboard = React.useCallback((event?: React.MouseEvent<HTMLAnchorElement>) => {
        event?.preventDefault();
        void openAdminDashboard(adminDashboardUrl);
    }, [adminDashboardUrl]);

    const authLinks = React.useMemo(() => {
        const role = normalizeProfileRole(profileType);
        const isClient = role === 'client';
        const shortlistHref = isClient ? '/household/shortlist' : '/shortlist';
        const hiringHistoryHref = isClient ? '/household/hiring' : '/service-provider/hiring';
        // One word for both sides. The page is where a person manages their own
        // hiring over time — requests, contracts, work history — and that is the
        // same activity whether you are filling a job or taking one. Browsing
        // what is on offer happens on the home page.
        const hiringLabel = 'Hiring';
        return [
            // "Saved" rather than "Shortlist": this holds what someone bookmarked
            // while browsing. A household shortlisting a candidate who applied to
            // its job is a different act, and lives on the hiring page.
            // Saved now carries a count, by request.
            //
            // It was deliberately left without one: the other badges mean "this
            // is waiting on you" and go back to zero when dealt with, while a
            // saved-items count is a total that mostly grows. Recorded because
            // it is the thing to watch — if people start ignoring the Inbox and
            // Hiring numbers, this is the first place to look.
            { name: 'Saved', href: shortlistHref, count: savedCount },
            { name: 'Inbox', href: '/inbox', count: inboxCount },
            { name: hiringLabel, href: hiringHistoryHref, count: hireRequestCount },
            { name: 'Blog', href: '/blog', count: 0 },
        ];
    }, [profileType, inboxCount, hireRequestCount, savedCount]);

    const profileRole = normalizeProfileRole(profileType);
    const accountProfileHref = profileRole === 'client'
        ? '/household/profile'
        : profileRole === 'service-provider'
            ? '/service-provider/profile'
            : '/profile';
    const accountProfileLabel = profileRole === 'client'
        ? 'My Household'
        : profileRole === 'service-provider'
            ? 'My Profile'
            : 'Profile';

    // Total unattended cards across every Hiring tab. The same versioned ledger
    // drives the tab badges and card highlights, so opening the page alone never
    // clears this number; a card interaction does.
    const fetchHireRequestCount = React.useCallback(async (overrideProfileType?: string | null, force = false) => {
        try {
            if (!getAccessTokenFromCookies()) return;
            const pt = overrideProfileType ?? profileType;
            const role = normalizeProfileRole(pt);
            const userId = getStoredUserId() || '';
            const profileId = getStoredUserProfileId() || '';
            if (!role || !userId || !profileId) return;
            const total = await cachedRequest(`nav:hiring:${userId}:${role}`, async () => {
                const {
                    marketplaceHireRequestService: hireRequestService,
                    marketplaceListingApplicationService: listingApplicationService,
                } = await import('~/services/grpc/marketplace.service');
                if (role === 'client') {
                    const raw = await listingApplicationService.listApplications({
                        ownerProfileId: profileId,
                        limit: 200,
                    });
                    const rows = Array.isArray(raw?.data) ? raw.data : (Array.isArray(raw) ? raw : []);
                    return countUnattendedHiringRecords(hiringAttentionScope(profileId, 'household'), [
                        { kind: 'application', records: rows },
                    ]);
                }
                const {
                    hireContractService,
                    employmentContractService,
                    employmentService,
                } = await import('~/services/grpc/authServices');
                const applicantPromise = listingApplicationService.listApplications({ applicantProfileId: profileId, limit: 200 });
                const [requestsRaw, applicationsRaw, employmentContractsRaw, legacyContractsRaw, workRaw] = await Promise.all([
                    hireRequestService.listHireRequests('', 'service_provider'),
                    applicantPromise,
                    employmentContractService.listEmploymentContracts('', undefined, 200, 0),
                    hireContractService.listHireContracts('', 'service_provider'),
                    employmentService.listByServiceProvider(userId, 200, 0),
                ]);
                const rows = (raw: any) => {
                    const value = raw?.data?.data ?? raw?.data ?? raw ?? [];
                    return Array.isArray(value) ? value : [];
                };
                const visibleEmploymentContracts = collapseApplicationContracts(rows(employmentContractsRaw));
                return countUnattendedHiringRecords(hiringAttentionScope(profileId, 'service_provider'), [
                    { kind: 'request', records: rows(requestsRaw) },
                    { kind: 'application', records: rows(applicationsRaw) },
                    { kind: 'employment-contract', records: visibleEmploymentContracts },
                    { kind: 'work', records: [...rows(legacyContractsRaw), ...rows(workRaw)] },
                ]);
            }, { maxAgeMs: NAV_COUNT_STALE_MS, force });

            setHireRequestCount(total);
        } catch (error) {
            setHireRequestCount(0);
            if (!shouldSilenceGatewayError(error)) {
                console.error("Failed to fetch hire request count:", error);
            }
        }
    }, [profileType]);

    // Unread conversations, not unread messages. The navbar badge is a prompt
    // to visit a thread, so five messages in one conversation should still be
    // one item of attention.
    const fetchInboxCount = React.useCallback(async (force = false) => {
        try {
            if (!getAccessTokenFromCookies()) return;
            const userId = getStoredUserId() || '';
            if (!userId) return;
            const unread = await cachedRequest(`nav:inbox:${userId}`, async () => {
                const raw = await notificationsService.listConversations(userId, 0, 100);
                const rows = Array.isArray(raw?.data) ? raw.data : (Array.isArray(raw) ? raw : []);
                return rows.filter((conversation: any) => Number(conversation?.unread_count || 0) > 0).length;
            }, { maxAgeMs: NAV_COUNT_STALE_MS, force });
            setInboxCount(unread);
        } catch (error) {
            setInboxCount(0);
            if (!shouldSilenceGatewayError(error)) {
                console.error("Failed to fetch inbox count:", error);
            }
        }
    }, []);

    // How many things are saved.
    //
    // GetShortlistCount runs the same query over saved_items that the Saved page
    // lists from, so the badge and the page cannot disagree — counting client
    // side from a fetched list would have been a second definition of the same
    // number, and those drift.
    const fetchSavedCount = React.useCallback(async (force = false) => {
        try {
            if (!getAccessTokenFromCookies()) return;
            const role = normalizeProfileRole(profileType);
            const savedProfileType = role === 'client' ? 'household' : role === 'service-provider' ? 'service_provider' : undefined;
            if (!savedProfileType) {
                setSavedCount(0);
                return;
            }
            const userId = getStoredUserId() || '';
            if (!userId) return;
            const count = await cachedRequest(`nav:saved:${userId}:${savedProfileType}`, async () => {
                const { marketplaceShortlistService: shortlistService } = await import('~/services/grpc/marketplace.service');
                const raw: any = await shortlistService.getShortlistCount('', savedProfileType);
                return Number(raw?.count ?? raw?.data?.count ?? 0);
            }, { maxAgeMs: NAV_COUNT_STALE_MS, force });
            setSavedCount(Number.isFinite(count) && count > 0 ? count : 0);
        } catch (error) {
            setSavedCount(0);
            if (!shouldSilenceGatewayError(error)) {
                console.error("Failed to fetch saved count:", error);
            }
        }
    }, [profileType]);

    // One user action can be echoed by a local event, SSE notification and a
    // WebSocket event. Coalesce that burst into one forced read per badge.
    const refreshHiring = useCoalescedRefresh(() => void fetchHireRequestCount(undefined, true));
    const refreshInbox = useCoalescedRefresh(() => void fetchInboxCount(true));
    const refreshSaved = useCoalescedRefresh(() => void fetchSavedCount(true));

    // Parse user profile type and name from localStorage
    useEffect(() => {
        if (user) {
            try {
                if (!currentUser) {
                    setProfileType(null);
                    setUserName(null);
                    setIsAdmin(false);
                    return;
                }

                const resolvedProfileType = currentUser.profile_type || null;

                // Check admin status using the canonical current user email.
                // Every branch has to land on a value. This only ever set the
                // flag on a successful answer, so when the check was skipped
                // the previous person's answer kept showing: an admin signing
                // out and someone else signing in without a full page load left
                // the button on screen for them.
                //
                // The check no longer sits behind allowAuxiliaryAccountCalls.
                // That flag quiets the authenticated count fetches on /profile;
                // this is a public call that already swallows its own errors,
                // and skipping it there only meant the button disappeared for
                // an admin who opened their own profile.
                const email = currentUser.email || '';
                if (email) {
                    cachedRequest(`nav:admin:${email.toLowerCase()}`, async () => {
                        const { default: authService } = await import('~/services/grpc/auth.service');
                        return authService.checkIsAdmin(email);
                    }, {
                        maxAgeMs: NAV_ADMIN_STALE_MS,
                    }).then((admin) => setIsAdmin(admin)).catch(() => setIsAdmin(false));
                } else {
                    setIsAdmin(false);
                }

                // Bureau users should not access regular navigation
                if (normalizeProfileRole(resolvedProfileType) === "bureau") {
                    setProfileType(null);
                    setUserName(null);
                    return;
                }

                setProfileType(resolvedProfileType);
                // Get user name for greeting
                const firstName = currentUser.first_name || currentUser.firstName || "";
                setUserName(firstName);
                const currentUserId = getStoredUserId() || String(currentUser.user_id || currentUser.id || '');
                setProfileAvatar(firstProfileAvatar(
                    currentUser.avatar_url,
                    currentUser.avatarUrl,
                    currentUser.profile_image,
                    currentUser.profileImage,
                    getStoredProfileAvatar(currentUserId),
                ));

                // The auth session does not always include the profile's
                // avatar URL. Hydrate it once from the active profile so the
                // navbar is correct on a fresh device as well as after an
                // in-page avatar change.
                void (async () => {
                    try {
                        const role = normalizeProfileRole(resolvedProfileType);
                        if (!role || !currentUserId) return;
                        const { profileService } = await import('~/services/grpc/authServices');
                        const profileData = role === 'client'
                            ? await profileService.getCurrentHouseholdProfile('')
                            : await profileService.getCurrentServiceProviderProfile('');
                        const avatar = firstProfileAvatar(
                            profileData?.avatar_url,
                            profileData?.avatarUrl,
                            profileData?.user?.avatar_url,
                            profileData?.user?.profile_image,
                        );
                        if (avatar) {
                            setProfileAvatar(avatar);
                        }
                    } catch {
                        // Avatar hydration is cosmetic; the initials fallback remains available.
                    }
                })();

                // Fetch counts only for authenticated users who finished onboarding
                if (!isInSetupMode && allowAuxiliaryAccountCalls) {
                    fetchHireRequestCount(resolvedProfileType);
                    fetchInboxCount();
                    fetchSavedCount();
                }
            } catch {
                setProfileType(null);
                setUserName(null);
                setIsAdmin(false);
            }
        } else {
            setProfileType(null);
            setUserName(null);
            setProfileAvatar('');
            setInboxCount(0);
            setSavedCount(0);
            setIsAdmin(false);
        }
    }, [user, currentUser, isInSetupMode, allowAuxiliaryAccountCalls]);

    // Listen for hiring updates (only when not in setup mode)
    useEffect(() => {
        if (isInSetupMode || !allowAuxiliaryAccountCalls) return;

        const storedProfileId = getStoredUserProfileId();
        const attentionRole = getStoredCanonicalProfileType();
        if (storedProfileId && attentionRole) void hydrateHiringAttention(hiringAttentionScope(storedProfileId, attentionRole));

        const handleHiringUpdate = () => {
            if (getAccessTokenFromCookies()) refreshHiring();
        };
        // The inbox page has dispatched this on every read since it was written;
        // nothing was listening, so the badge stayed put until the next poll.
        const handleInboxUpdate = () => {
            if (getAccessTokenFromCookies()) refreshInbox();
        };

        // Every place that saves or unsaves already dispatches this — the two
        // home pages, the jobs board and the Saved page itself. Nothing was
        // listening, which is the same gap the inbox badge had: the number was
        // correct on load and then stood still while the heart was clicked.
        const handleShortlistUpdate = () => {
            if (getAccessTokenFromCookies()) refreshSaved();
        };

        window.addEventListener('hiring-updated', handleHiringUpdate);
        window.addEventListener('hiring-attention-updated', handleHiringUpdate);
        window.addEventListener('storage', handleHiringUpdate);
        window.addEventListener('inbox-updated', handleInboxUpdate);
        window.addEventListener('shortlist-updated', handleShortlistUpdate);
        return () => {
            window.removeEventListener('hiring-updated', handleHiringUpdate);
            window.removeEventListener('hiring-attention-updated', handleHiringUpdate);
            window.removeEventListener('storage', handleHiringUpdate);
            window.removeEventListener('inbox-updated', handleInboxUpdate);
            window.removeEventListener('shortlist-updated', handleShortlistUpdate);
        };
    }, [isInSetupMode, allowAuxiliaryAccountCalls, profileType, refreshHiring, refreshInbox, refreshSaved]);

    const badgesAreLive = Boolean(user) && !isInSetupMode && allowAuxiliaryAccountCalls;

    // Realtime updates invalidate only the count they can change. A hiring
    // event previously reloaded hiring, inbox and saved data, then the related
    // notification caused the same three reads again.
    useSSESubscriptionSafe('hiring.application.submitted', refreshHiring, badgesAreLive);
    useSSESubscriptionSafe('hiring.application.accepted', refreshHiring, badgesAreLive);
    useSSESubscriptionSafe('hiring.application.declined', refreshHiring, badgesAreLive);
    useSSESubscriptionSafe('hiring.application.approved', refreshHiring, badgesAreLive);
    useSSESubscriptionSafe('hiring.application.shortlisted', refreshHiring, badgesAreLive);
    useSSESubscriptionSafe('hiring.application.closed', refreshHiring, badgesAreLive);
    useSSESubscriptionSafe('hiring.request.received', refreshHiring, badgesAreLive);
    useSSESubscriptionSafe('hiring.request.accepted', refreshHiring, badgesAreLive);
    useSSESubscriptionSafe('hiring.request.rejected', refreshHiring, badgesAreLive);
    useSSESubscriptionSafe('hiring.contract.signed', refreshHiring, badgesAreLive);
    useSSESubscriptionSafe('hiring.contract.terminated', refreshHiring, badgesAreLive);
    useSSESubscriptionSafe('hiring.employment_contract.offered', refreshHiring, badgesAreLive);
    useSSESubscriptionSafe('hiring.employment_contract.sent_to_househelp', refreshHiring, badgesAreLive);
    useSSESubscriptionSafe('hiring.employment_contract.fully_signed', refreshHiring, badgesAreLive);

    // The inbox screen has always used the durable SSE stream, but the global
    // navigation only listened to the best-effort WebSocket. Subscribe here as
    // well so the badge refreshes even while somebody is reading a different
    // conversation (or is elsewhere in the app).
    useSSESubscriptionSafe('messaging.message.received', refreshInbox, badgesAreLive);
    useSSESubscriptionSafe('messaging.message.read', refreshInbox, badgesAreLive);
    useSSESubscriptionSafe('messaging.message.deleted', refreshInbox, badgesAreLive);
    useSSESubscriptionSafe('messaging.conversation.started', refreshInbox, badgesAreLive);
    useSSESubscriptionSafe('messaging.conversation.archived', refreshInbox, badgesAreLive);

    // Keep WebSocket subscriptions too: they update the badge before the SSE
    // replay arrives, while SSE remains the reliable path after a reconnect.
    const webSocket = useWebSocketContextSafe();
    useEffect(() => {
        if (!badgesAreLive || !webSocket) return;

        const unsubscribers = ['new_message', 'message_read', 'conversation_started', 'conversation_archived'].map((type) =>
            webSocket.addEventListener(type, refreshInbox),
        );
        return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
    }, [badgesAreLive, webSocket, refreshInbox]);

    // Coming back to the tab, and moving between pages.
    //
    // A background tab is where staleness is most obvious: the timer is
    // throttled by the browser and the SSE connection may have been dropped
    // entirely, so what is on screen when someone returns can be minutes old.
    // Route changes cover acting on something and navigating away — the badge
    // should have dropped by the time the next page renders.
    useEffect(() => {
        if (!badgesAreLive) return;

        const onVisible = () => {
            if (document.visibilityState === 'visible') {
                void fetchHireRequestCount();
                void fetchInboxCount();
                void fetchSavedCount();
            }
        };

        const onFocus = () => {
            void fetchHireRequestCount();
            void fetchInboxCount();
            void fetchSavedCount();
        };

        document.addEventListener('visibilitychange', onVisible);
        window.addEventListener('focus', onFocus);
        return () => {
            document.removeEventListener('visibilitychange', onVisible);
            window.removeEventListener('focus', onFocus);
        };
    }, [badgesAreLive, fetchHireRequestCount, fetchInboxCount, fetchSavedCount]);

    // A slow backstop, for a session that loses its stream without noticing.
    useEffect(() => {
        if (!user || !profileType || isInSetupMode || !allowAuxiliaryAccountCalls) return;

        const pollCounts = () => {
            fetchHireRequestCount();
            fetchInboxCount();
            fetchSavedCount();
        };

        const intervalId = setInterval(pollCounts, 5 * 60_000);
        return () => clearInterval(intervalId);
    }, [user, profileType, isInSetupMode, allowAuxiliaryAccountCalls, fetchHireRequestCount, fetchInboxCount, fetchSavedCount]);

    // Badge helper: 0 = null (hidden), 1-9 = number, >9 = "9+"
    const renderBadge = (count: number, gradient = 'from-purple-600 to-pink-600', shadow = 'shadow-purple-500/50') => {
        if (count <= 0) return null;
        const label = count > 9 ? '9+' : String(count);
        return (
            <span
                className={`absolute -top-1.5 -right-2 bg-gradient-to-r ${gradient} text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center shadow-lg ${shadow} px-1`}
            >
                {label}
            </span>
        );
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    // Show auth buttons only if user is not logged in and not on app host
    const showAuthButtons = !user && !isAppHost && !loading;



    // On app subdomain without an authenticated user, hide navbar completely
    if (isAppHost && !user) {
        return null;
    }

    // Hide account navigation while a household is choosing or joining a household.
    if (isInSetupMode) {
        return null;
    }

    return (
        <>
        <nav className="hb-safe-nav fixed inset-x-0 top-0 z-40 overflow-visible border-b border-primary-200/60 bg-gradient-to-br from-primary-100 via-white to-purple-200 shadow-lg shadow-purple-200/40 transition-all duration-300 dark:border-purple-500/20 dark:from-[#0a0a0f] dark:via-[#13131a] dark:to-[#0a0a0f] dark:shadow-glow-sm">
            <div className="hb-content-rail relative flex min-h-[56px] items-center justify-between sm:min-h-[60px]">
                {/* Logo */}
                <div className="relative flex items-center">
  <Link to="/" prefetch="intent" className="relative rounded-xl px-2 py-1 text-lg font-extrabold drop-shadow-md transition-all duration-300 hover:bg-primary-50 hover:shadow-lg hover:shadow-purple-300/50 dark:hover:bg-[#13131a] dark:hover:shadow-glow-md sm:text-xl">
    <span className="logo-shimmer">
      <span className="text-gray-900 dark:text-white">Home</span>
      <span className="gradient-text">Bit</span>
    </span>
  </Link>
</div>

                {/* Public Navigation Links - Show on non-app hosts for all users */}
                {!isAppHost && (
                    <div className="absolute left-[41%] hidden -translate-x-1/2 items-center gap-2 xl:left-[43%] lg:flex">
                        {(user ? authLinks : navigation).map((item) => {
                            const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
                            return (
                            <Link
                                key={item.name}
                                data-tour={item.name === 'Hiring' ? 'nav-hiring' : item.name === 'Inbox' ? 'nav-inbox' : undefined}
                                to={item.href}
                                prefetch="intent"
                                className={`link relative rounded-xl px-3.5 py-2 text-sm font-semibold tracking-[0.01em] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${isActive ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25 ring-1 ring-white/10' : 'text-gray-900 hover:bg-purple-100 hover:text-purple-800 dark:text-white dark:hover:bg-white/10 dark:hover:text-white'}`}
                            >
                                {item.name}
                                {'count' in item && item.name === 'Saved' && renderBadge((item as any).count)}
                                {'count' in item && item.name === 'Inbox' && renderBadge((item as any).count)}
                                {'count' in item && (item.href === '/household/hiring' || item.href === '/service-provider/hiring') && renderBadge((item as any).count)}
                            </Link>
                            );
                        })}
                    </div>
                )}

                {/* App navigation for authenticated users on app subdomain */}
                {isAppHost && user && (
                    <div className="absolute left-[41%] hidden -translate-x-1/2 items-center gap-2 xl:left-[43%] lg:flex">
                        {authLinks.map((item) => {
                            const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
                            return (
                            <Link
                                key={item.name}
                                data-tour={item.name === 'Hiring' ? 'nav-hiring' : item.name === 'Inbox' ? 'nav-inbox' : undefined}
                                to={item.href}
                                prefetch="intent"
                                className={`link relative rounded-xl px-3.5 py-2 text-sm font-semibold tracking-[0.01em] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${isActive ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25 ring-1 ring-white/10' : 'text-gray-900 hover:bg-purple-100 hover:text-purple-800 dark:text-white dark:hover:bg-white/10 dark:hover:text-white'}`}
                                id={item.name === 'Saved' ? 'shortlist-link' : undefined}
                            >
                                {item.name}
                                {item.name === 'Saved' && renderBadge(savedCount)}
                                {item.name === 'Inbox' && renderBadge(inboxCount)}
                                {(item.href === '/household/hiring' || item.href === '/service-provider/hiring') && renderBadge(hireRequestCount)}
                            </Link>
                            );
                        })}
                    </div>
                )}

                {/* Right section */}
                <div className="relative ml-auto flex items-center gap-2">

                    {/* Notifications (logged-in only) */}
                    {user && (
                        <button
                            type="button"
                            onClick={() => setIsNotificationsOpen(true)}
                            className="relative hidden items-center justify-center rounded-lg border border-purple-200 bg-white p-1.5 shadow-sm transition-all hover:bg-purple-50 dark:border-purple-500/30 dark:bg-white/10 dark:hover:bg-purple-900/30 lg:ml-3 lg:inline-flex"
                            aria-label="Notifications"
                        >
                            <BellIcon className="h-5 w-5 text-purple-700 dark:text-purple-200" />
                            {renderBadge(unreadCount)}
                        </button>
                    )}

                    {/* Admin Dashboard - desktop, for admins who are also on the site */}
                    {canSeeAdminDashboard && (
                        <a
                            href={adminDashboardUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hidden"
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Admin Dashboard
                        </a>
                    )}

                    {/* Theme Toggle - Always visible on desktop */}
                    <div className="hidden lg:block">
                        <ThemeToggle size="md" />
                    </div>

                    {showAuthButtons && (
                        <div className="hidden items-center gap-2 lg:flex">
                            <Link
                                to="/login"
                                className="link rounded-xl border border-purple-300 px-4 py-1.5 text-xs font-semibold text-purple-700 transition-all duration-200 hover:bg-purple-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 dark:border-purple-500/40 dark:text-purple-300 dark:hover:bg-purple-900/30"
                            >
                                Log in
                            </Link>
                            <Link
                                to="/signup"
                                className="link rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-1.5 text-xs font-semibold text-white shadow-md transition-all duration-200 hover:scale-105 hover:from-purple-700 hover:to-pink-700 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
                            >
                                Sign up
                            </Link>
                        </div>
                    )}

                    {/* Authenticated User Greeting */}
                    {user && userName && (
                        <Menu as="div" className="relative hidden lg:inline-block text-left">
                            <Menu.Button className="flex items-center space-x-2 px-4 py-1 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-all">
                                {profileAvatar ? (
                                    <img src={profileAvatar} alt="" className="h-7 w-7 rounded-full object-cover ring-1 ring-purple-300/70 dark:ring-purple-500/50" />
                                ) : (
                                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-pink-600 text-[10px] font-bold text-white">
                                        {(userName || 'HB').slice(0, 2).toUpperCase()}
                                    </span>
                                )}
                                <div className="text-xs text-gray-600 dark:text-gray-300">
                                    <span className="font-semibold text-sm">Hello, {userName}</span>
                                </div>
                                <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </Menu.Button>

                            <Transition
                                as={React.Fragment}
                                enter="transition ease-out duration-200"
                                enterFrom="transform opacity-0 scale-95"
                                enterTo="transform opacity-100 scale-100"
                                leave="transition ease-in duration-150"
                                leaveFrom="transform opacity-100 scale-100"
                                leaveTo="transform opacity-0 scale-95"
                            >
                                <Menu.Items className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-xl bg-white dark:bg-[#13131a] border-2 border-purple-200 dark:border-purple-500/30 shadow-lg dark:shadow-glow-md focus:outline-none">
                                    <div className="py-2">
                                        <Menu.Item>
                                            {({ active }) => (
                                                <Link
                                                    to={accountProfileHref}
                                                    className={`${active ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'text-gray-700 dark:text-gray-300'} flex items-center px-4 py-1.5 text-xs font-semibold rounded-xl mx-2 transition-all`}
                                                >
                                                    <UserIcon className="mr-3 h-5 w-5" />
                                                    {accountProfileLabel}
                                                </Link>
                                            )}
                                        </Menu.Item>
                                        <Menu.Item>
                                            {({ active }) => (
                                                <Link
                                                    to="/settings"
                                                    className={`${active ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'text-gray-700 dark:text-gray-300'} flex items-center px-4 py-1.5 text-xs font-semibold rounded-xl mx-2 transition-all`}
                                                >
                                                    <CogIcon className="mr-3 h-5 w-5" />
                                                    Settings
                                                </Link>
                                            )}
                                        </Menu.Item>
                                        <Menu.Item>
                                            {({ active }) => (
                                                <Link
                                                    to="/subscriptions"
                                                    className={`${active ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'text-gray-700 dark:text-gray-300'} flex items-center px-4 py-1.5 text-xs font-semibold rounded-xl mx-2 transition-all`}
                                                >
                                                    <CreditCardIcon className="mr-3 h-5 w-5" />
                                                    Subscriptions
                                                </Link>
                                            )}
                                        </Menu.Item>
                                        {canSeeAdminDashboard && (
                                            <>
                                                <div className="my-2 border-t border-gray-200 dark:border-gray-700" />
                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <a
                                                            href={adminDashboardUrl}
                                                            onClick={handleAdminDashboard}
                                                            className={`${active ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'text-purple-600 dark:text-purple-400'} flex items-center px-4 py-1.5 text-xs font-semibold rounded-xl mx-2 transition-all`}
                                                        >
                                                            <CogIcon className="mr-3 h-5 w-5" />
                                                            Admin Dashboard
                                                        </a>
                                                    )}
                                                </Menu.Item>
                                                <div className="my-2 border-t border-gray-200 dark:border-gray-700" />
                                            </>
                                        )}
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                    onClick={handleLogout}
                                                    className={`${active ? 'bg-gradient-to-r from-red-600 to-red-700 text-white' : 'text-gray-700 dark:text-gray-300'} flex items-center w-full px-4 py-1.5 text-xs font-semibold rounded-xl mx-2 transition-all`}
                                                >
                                                    <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
                                                    Logout
                                                </button>
                                            )}
                                        </Menu.Item>
                                    </div>
                                </Menu.Items>
                            </Transition>
                        </Menu>
                    )}

                    {/* Menu Dropdown - Only show on mobile */}
                    <Menu as="div" className="hidden text-left">
                        <Menu.Button
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 p-2 text-white shadow-md shadow-purple-400/40 transition-all duration-200 hover:from-purple-700 hover:to-pink-700 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 dark:from-purple-600 dark:to-pink-600 dark:shadow-glow-sm"
                            aria-label="Open navigation menu"
                        >
                            <Bars3Icon className="h-6 w-6" />
                        </Menu.Button>

                        <Transition
                            as={React.Fragment}
                            enter="transition ease-out duration-200"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-150"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                        >
                            <Menu.Items className="absolute right-0 z-50 mt-2 w-64 origin-top-right rounded-xl bg-white dark:bg-[#13131a] border-2 border-purple-200 dark:border-purple-500/30 shadow-2xl shadow-purple-300/60 dark:shadow-glow-md focus:outline-none">
                                <div className="py-2">
                                    {/* Navigation links in mobile menu (non-app host) */}
                                    {!isAppHost && (user ? authLinks : navigation).map((item) => (
                                        <Menu.Item key={item.name}>
                                            {({ active }) => {
                                                const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
                                                return (
                                                <Link
                                                    to={item.href}
                                                    className={`font-medium ${active || isActive ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white scale-105' : 'text-primary-700 dark:text-purple-400'} flex items-center justify-between px-5 py-1 text-base rounded-xl transition-all duration-200 mx-2 hover:scale-105`}
                                                >
                                                    <span>{item.name}</span>
                                                    {'count' in item && (item as any).count > 0 && (
                                                        <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                                                            {(item as any).count > 9 ? '9+' : (item as any).count}
                                                        </span>
                                                    )}
                                                </Link>
                                                );
                                            }}
                                        </Menu.Item>
                                    ))}

                                    {/* Mobile Auth Options */}
                                    {showAuthButtons && (
                                        <div className="mx-2 mt-2 grid grid-cols-2 gap-2 border-t border-purple-100 px-2 pt-3 dark:border-purple-500/20">
                                            <Menu.Item>
                                                <Link
                                                    to="/login"
                                                    className="rounded-xl border border-purple-300 px-4 py-2 text-center text-xs font-semibold text-purple-700 transition-colors hover:bg-purple-50 dark:border-purple-500/40 dark:text-purple-300 dark:hover:bg-purple-900/30"
                                                >
                                                    Log in
                                                </Link>
                                            </Menu.Item>
                                            <Menu.Item>
                                                <Link
                                                    to="/signup"
                                                    className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-center text-xs font-semibold text-white shadow-md transition-all hover:from-purple-700 hover:to-pink-700 hover:shadow-lg"
                                                >
                                                    Sign up
                                                </Link>
                                            </Menu.Item>
                                        </div>
                                    )}

                                    {/* Notifications in Mobile Menu */}
                                    {user && (
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                    type="button"
                                                    onClick={() => setIsNotificationsOpen(true)}
                                                    className={`font-medium ${active ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white scale-105' : 'text-primary-700 dark:text-purple-400'} flex items-center justify-between px-5 py-1 text-base rounded-xl transition-all duration-200 mx-2 hover:scale-105 w-[calc(100%-16px)]`}
                                                >
                                                    <span className="flex items-center gap-2">
                                                        <BellIcon className="h-5 w-5" />
                                                        Notifications
                                                    </span>
                                                    <span className="flex items-center gap-2">
                                                        {unreadCount > 0 && (
                                                            <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                                                                {unreadCount > 9 ? '9+' : unreadCount}
                                                            </span>
                                                        )}
                                                    </span>
                                                </button>
                                            )}
                                        </Menu.Item>
                                    )}

                                    {/* Theme Toggle in Mobile Menu */}
                                    <Menu.Item>
                                      {({ active }) => (
                                        <button type="button" onClick={() => window.dispatchEvent(new Event('open-support-chat'))} className={`font-medium ${active ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'text-primary-700 dark:text-purple-400'} flex w-[calc(100%-16px)] items-center gap-2 rounded-xl px-5 py-2 text-base mx-2`}>
                                          <ChatBubbleLeftRightIcon className="h-5 w-5" /> Help & support
                                        </button>
                                      )}
                                    </Menu.Item>

                                    <PWAInstallMenuButton />

                                    {/* Theme Toggle in Mobile Menu */}
                                    <div className="px-5 py-3 flex items-center justify-between">
                                        <span className="text-xs font-medium text-gray-700 dark:text-gray-200">Theme</span>
                                        <ThemeToggle size="sm" />
                                    </div>

                                    {/* User Menu Items */}
                                    {user && (
                                        <>
                                            <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                                            {/* User Greeting in Mobile Menu */}
                                            <div className="flex items-center gap-2 px-5 py-2 text-base font-bold rounded-xl text-primary-700 dark:text-purple-400 border-b border-primary-100 dark:border-gray-700">
                                                {profileAvatar ? (
                                                    <img src={profileAvatar} alt="" className="h-8 w-8 rounded-full object-cover ring-1 ring-purple-300/70 dark:ring-purple-500/50" />
                                                ) : (
                                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-pink-600 text-[10px] font-bold text-white">
                                                        {(userName || 'HB').slice(0, 2).toUpperCase()}
                                                    </span>
                                                )}
                                                <div className="font-semibold text-sm">Hello, {userName}</div>
                                            </div>



                                            {/* App links for mobile on app host */}
                                            {isAppHost && (
                                                <>
                                                    {authLinks.map((item) => (
                                                        <Menu.Item key={item.name}>{({ active }) => (
                                                            <Link to={item.href} className={`${active ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300' : 'text-gray-700 dark:text-gray-300'} flex items-center justify-between px-4 py-1 text-xs relative`}>
                                                                <span>{item.name}</span>
                                                                {item.name === 'Saved' && savedCount > 0 && (
                                                                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center shadow-md shadow-purple-500/40 px-1">
                                                                        {savedCount > 9 ? '9+' : savedCount}
                                                                    </span>
                                                                )}
                                                                {item.name === 'Inbox' && inboxCount > 0 && (
                                                                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center shadow-md shadow-purple-500/40 px-1">
                                                                        {inboxCount > 9 ? '9+' : inboxCount}
                                                                    </span>
                                                                )}
                                                                {(item.href === '/household/hiring' || item.href === '/service-provider/hiring') && hireRequestCount > 0 && (
                                                                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center shadow-md shadow-purple-500/40 px-1">
                                                                        {hireRequestCount > 9 ? '9+' : hireRequestCount}
                                                                    </span>
                                                                )}
                                                            </Link>
                                                        )}</Menu.Item>
                                                    ))}
                                                </>
                                            )}

                                            {/* Profile link based on profile type */}
                                            <Menu.Item>
                                                {({ active }) => (
                                                    <Link
                                                        to={accountProfileHref}
                                                        className={`${
                                                            active ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300' : 'text-gray-700 dark:text-gray-300'
                                                        } flex items-center px-4 py-1 text-xs`}
                                                    >
                                                        <UserIcon className="mr-3 h-5 w-5" />
                                                        {accountProfileLabel}
                                                    </Link>
                                                )}
                                            </Menu.Item>
                                            <Menu.Item>
                                                {({ active }) => (
                                                    <Link
                                                        to="/settings"
                                                        className={`${
                                                            active ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300' : 'text-gray-700 dark:text-gray-300'
                                                        } flex items-center px-4 py-1 text-xs`}
                                                    >
                                                        <CogIcon className="mr-3 h-5 w-5" />
                                                        Settings
                                                    </Link>
                                                )}
                                            </Menu.Item>
                                            <Menu.Item>
                                                {({ active }) => (
                                                    <Link
                                                        to="/subscriptions"
                                                        className={`${
                                                            active ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300' : 'text-gray-700 dark:text-gray-300'
                                                        } flex items-center px-4 py-1 text-xs`}
                                                    >
                                                        <CreditCardIcon className="mr-3 h-5 w-5" />
                                                        Subscriptions
                                                    </Link>
                                                )}
                                            </Menu.Item>
                                            {canSeeAdminDashboard && (
                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <a
                                                            href={adminDashboardUrl}
                                                            onClick={(event) => handleAdminDashboard(event)}
                                                            className={`${
                                                                active ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' : 'text-purple-600 dark:text-purple-400'
                                                            } flex items-center px-4 py-1 text-xs font-semibold`}
                                                        >
                                                            <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            </svg>
                                                            Admin Dashboard
                                                        </a>
                                                    )}
                                                </Menu.Item>
                                            )}
                                            <Menu.Item>
                                                {({ active }) => (
                                                    <button
                                                        onClick={handleLogout}
                                                        className={`${
                                                            active ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'
                                                        } flex items-center w-full px-4 py-1 text-xs`}
                                                    >
                                                        <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
                                                        Logout
                                                    </button>
                                                )}
                                            </Menu.Item>
                                        </>
                                    )}
                                </div>
                            </Menu.Items>
                        </Transition>
                    </Menu>
                </div>
            </div>

            {/* Notifications Modal */}
            {isNotificationsOpen && (
                <Suspense fallback={null}>
                    <NotificationsModal isOpen onClose={() => setIsNotificationsOpen(false)} />
                </Suspense>
            )}

        </nav>
        <MobileBottomNavigation
            user={Boolean(user)}
            homeHref={dashboardPath || '/'}
            authenticatedItems={authLinks}
            profileHref={accountProfileHref}
            profileLabel={accountProfileLabel}
            unreadNotifications={unreadCount}
            canSeeAdmin={canSeeAdminDashboard}
            onOpenAdminDashboard={() => openAdminDashboard(adminDashboardUrl)}
            onOpenNotifications={() => setIsNotificationsOpen(true)}
            onLogout={() => void handleLogout()}
        />
        {/* A fixed header leaves normal document flow. Keep every route's first
            control visible without making individual pages know the navbar's
            responsive height. */}
        <div className="hb-safe-nav-spacer shrink-0" aria-hidden="true" />
        </>
    );
}

/**
 * The root route owns the real navigation instance so it survives child route
 * transitions. Existing pages still render <Navigation /> while they are
 * migrated away from the old page-owned layout; keeping this compatibility
 * component empty prevents 69 duplicate mounts without a risky all-routes
 * rewrite.
 */
export function Navigation() {
    return null;
}

export function PersistentNavigation() {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    if (params.get('embed') === '1' || params.get('embed') === 'true') return null;
    return <NavigationContent />;
}
