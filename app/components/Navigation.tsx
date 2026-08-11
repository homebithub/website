import { Link, useNavigate, useLocation } from "react-router";
import React, { useEffect, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import { Bars3Icon, UserIcon, CogIcon, ArrowRightOnRectangleIcon, CreditCardIcon, BellIcon } from "@heroicons/react/20/solid";
import { useAuth } from "~/contexts/useAuth";
import ThemeToggle from "~/components/ui/ThemeToggle";
import { API_BASE_URL } from "~/config/api";
import { useAccountChoiceStatus } from "~/hooks/useAccountChoiceStatus";
import { useNotifications } from "~/hooks/useNotifications";
import { useSSESubscriptionSafe } from "~/hooks/useSSESubscription";
import { useWebSocketContextSafe } from "~/contexts/WebSocketContext";
import NotificationsModal from "~/components/notifications/NotificationsModal";
import { getAccessTokenFromCookies } from '~/utils/cookie';
import { hireRequestService, listingApplicationService } from '~/services/grpc/authServices';
import notificationsService from '~/services/grpc/notifications.service';
import { shortlistService } from '~/services/grpc/authServices';
import authService from '~/services/grpc/auth.service';
import { getStoredUser, getStoredUserId, getStoredUserProfileId } from '~/utils/authStorage';
import { shouldSilenceGatewayError } from '~/services/grpc/client';

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
    if (normalized === 'SVC_PVD' || normalized === 'SVD_PDD' || normalized === 'SERVICE_PROVIDER' || normalized === 'HOUSEHELP') return 'service-provider';
    if (normalized === 'BUREAU') return 'bureau';
    return null;
}

export function Navigation() {
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
    const [inboxCount, setInboxCount] = useState<number>(0);
    const [hireRequestCount, setHireRequestCount] = useState<number>(0);
    const [savedCount, setSavedCount] = useState<number>(0);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const { unreadCount } = useNotifications({ pollingMs: 30000, pageSize: 20, enabled: allowAuxiliaryAccountCalls });
    const navigate = useNavigate();


    // Detect if running on app subdomain
    const isAppHost = React.useMemo(() => {
        if (typeof window === 'undefined') return false;
        const host = window.location.host || '';
        // Only check for production app subdomain
        return host.startsWith('app.') || host === 'app.homebit.co.ke';
    }, []);

    // Memoized dashboard path based on profile type
    const dashboardPath = React.useMemo(() => {
        const role = normalizeProfileRole(profileType);
        if (!role) return null;
        if (role === "client") return "/household";
        if (role === "service-provider") return "/househelp";
        // Bureau users should not access regular navigation
        return null;
    }, [profileType]);

    const authLinks = React.useMemo(() => {
        const role = normalizeProfileRole(profileType);
        const isClient = role === 'client';
        const shortlistHref = isClient ? '/household/shortlist' : '/shortlist';
        const hiringHistoryHref = isClient ? '/household/hiring' : '/househelp/hiring';
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
            ? '/househelp/profile'
            : '/profile';
    const accountProfileLabel = profileRole === 'client'
        ? 'My Household'
        : profileRole === 'service-provider'
            ? 'My Profile'
            : 'Profile';

    // Fetch hiring badge count: pending items the user has NOT acted upon
    // A badge is a claim that something is waiting on *you*. Each side is waiting
    // on something different, and counting the same thing for both got it wrong
    // for households: a hire request they sent is waiting on the househelp, not
    // on them, so it was a number they could not act on and could not clear.
    //
    //   household  → applicants to review ('initiated'), plus candidates who
    //                accepted and now need their approval ('accepted')
    //   househelp  → hire requests received and unanswered
    const fetchHireRequestCount = React.useCallback(async (overrideProfileType?: string | null) => {
        try {
            if (!getAccessTokenFromCookies()) return;
            const pt = overrideProfileType ?? profileType;
            const role = normalizeProfileRole(pt);
            let total = 0;

            if (role === 'client') {
                const ownerProfileId = getStoredUserProfileId() || '';
                if (ownerProfileId) {
                    const raw = await listingApplicationService.listApplications({
                        ownerProfileId,
                        statuses: ['initiated', 'accepted'],
                        limit: 200,
                    });
                    const rows = Array.isArray(raw?.data) ? raw.data : (Array.isArray(raw) ? raw : []);
                    total = raw?.total ?? rows.length;
                }
            } else if (role === 'service-provider') {
                const data = await hireRequestService.listHireRequests('', '', 'pending');
                total = data?.total || (Array.isArray(data?.data) ? data.data.length : 0);
            }

            setHireRequestCount(total);
        } catch (error) {
            setHireRequestCount(0);
            if (!shouldSilenceGatewayError(error)) {
                console.error("Failed to fetch hire request count:", error);
            }
        }
    }, [profileType]);

    // Unread messages. inboxCount existed and was never once populated, so the
    // badge could not appear however many messages were waiting.
    const fetchInboxCount = React.useCallback(async () => {
        try {
            if (!getAccessTokenFromCookies()) return;
            const userId = getStoredUserId() || '';
            if (!userId) return;
            const raw = await notificationsService.listConversations(userId, 0, 100);
            const rows = Array.isArray(raw?.data) ? raw.data : (Array.isArray(raw) ? raw : []);
            const unread = rows.reduce(
                (sum: number, conversation: any) => sum + Number(conversation?.unread_count || 0),
                0,
            );
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
    const fetchSavedCount = React.useCallback(async () => {
        try {
            if (!getAccessTokenFromCookies()) return;
            const raw: any = await shortlistService.getShortlistCount('');
            const count = Number(raw?.count ?? raw?.data?.count ?? 0);
            setSavedCount(Number.isFinite(count) && count > 0 ? count : 0);
        } catch (error) {
            setSavedCount(0);
            if (!shouldSilenceGatewayError(error)) {
                console.error("Failed to fetch saved count:", error);
            }
        }
    }, []);

    // One place that refreshes both badges, called by everything below.
    //
    // The counts used to move only on a 60-second timer, so a badge could be a
    // minute behind what the person was looking at — which reads as "the number
    // is wrong" and is why refreshing the page appeared to be the only way to
    // update it.
    //
    // Bursts are collapsed: a conversation delivering six messages should cost
    // one refresh, not six. The floor keeps a busy stretch from turning into a
    // stream of requests, and the trailing edge is what makes the badge settle
    // on the right number rather than the number as of the first event.
    const refreshDebounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastRefreshRef = React.useRef<number>(0);
    const minRefreshGapMs = 4000;

    const refreshCounts = React.useCallback(() => {
        if (!getAccessTokenFromCookies()) return;

        if (refreshDebounceRef.current) clearTimeout(refreshDebounceRef.current);

        const sinceLast = Date.now() - lastRefreshRef.current;
        const wait = Math.max(400, minRefreshGapMs - sinceLast);

        refreshDebounceRef.current = setTimeout(() => {
            refreshDebounceRef.current = null;
            lastRefreshRef.current = Date.now();
            fetchHireRequestCount();
            fetchInboxCount();
            fetchSavedCount();
        }, wait);
    }, [fetchHireRequestCount, fetchInboxCount]);

    useEffect(() => () => {
        if (refreshDebounceRef.current) clearTimeout(refreshDebounceRef.current);
    }, []);

    // Parse user profile type and name from localStorage
    useEffect(() => {
        if (user) {
            try {
                if (!currentUser) {
                    setProfileType(null);
                    setUserName(null);
                    return;
                }

                const resolvedProfileType = currentUser.profile_type || null;

                // Check admin status using the canonical current user email
                const email = currentUser.email || '';
                if (email && allowAuxiliaryAccountCalls) {
                    authService.checkIsAdmin(email).then((admin) => setIsAdmin(admin)).catch(() => setIsAdmin(false));
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

                // Fetch counts only for authenticated users who finished onboarding
                if (!isInSetupMode && allowAuxiliaryAccountCalls) {
                    fetchHireRequestCount(resolvedProfileType);
                    fetchInboxCount();
                    fetchSavedCount();
                }
            } catch {
                setProfileType(null);
                setUserName(null);
            }
        } else {
            setProfileType(null);
            setUserName(null);
            setInboxCount(0);
            setSavedCount(0);
        }
    }, [user, currentUser, isInSetupMode, allowAuxiliaryAccountCalls]);

    // Listen for hiring updates (only when not in setup mode)
    useEffect(() => {
        if (isInSetupMode || !allowAuxiliaryAccountCalls) return;

        const handleHiringUpdate = () => {
            if (getAccessTokenFromCookies()) fetchHireRequestCount();
        };
        // The inbox page has dispatched this on every read since it was written;
        // nothing was listening, so the badge stayed put until the next poll.
        const handleInboxUpdate = () => {
            if (getAccessTokenFromCookies()) fetchInboxCount();
        };

        // Every place that saves or unsaves already dispatches this — the two
        // home pages, the jobs board and the Saved page itself. Nothing was
        // listening, which is the same gap the inbox badge had: the number was
        // correct on load and then stood still while the heart was clicked.
        const handleShortlistUpdate = () => {
            if (getAccessTokenFromCookies()) fetchSavedCount();
        };

        window.addEventListener('hiring-updated', handleHiringUpdate);
        window.addEventListener('inbox-updated', handleInboxUpdate);
        window.addEventListener('shortlist-updated', handleShortlistUpdate);
        return () => {
            window.removeEventListener('hiring-updated', handleHiringUpdate);
            window.removeEventListener('inbox-updated', handleInboxUpdate);
            window.removeEventListener('shortlist-updated', handleShortlistUpdate);
        };
    }, [isInSetupMode, allowAuxiliaryAccountCalls, fetchHireRequestCount, fetchInboxCount, fetchSavedCount]);

    const badgesAreLive = Boolean(user) && !isInSetupMode && allowAuxiliaryAccountCalls;

    // Live updates.
    //
    // Anything that changes a badge also produces a notification for the same
    // person — an application to review, a hire request answered, a message
    // arriving — and that notification is already pushed over SSE, which is how
    // the bell updates the moment something happens. Listening to the same
    // signal puts Inbox and Hiring on equal footing with it.
    //
    // The snapshot arrives on connect, including after a reconnect, so a badge
    // that went stale while the laptop was asleep corrects itself as soon as
    // the stream is back rather than at the next poll.
    useSSESubscriptionSafe('notifications.created', refreshCounts, badgesAreLive);
    useSSESubscriptionSafe('notifications.snapshot', refreshCounts, badgesAreLive);

    // The hiring events themselves, which arrive a moment before the
    // notification written from them. Both paths end in the same debounced
    // refresh, so listening to both costs one request and means the badge does
    // not depend on the notification having been written yet.
    useSSESubscriptionSafe('hiring.application.submitted', refreshCounts, badgesAreLive);
    useSSESubscriptionSafe('hiring.application.accepted', refreshCounts, badgesAreLive);
    useSSESubscriptionSafe('hiring.application.declined', refreshCounts, badgesAreLive);
    useSSESubscriptionSafe('hiring.application.approved', refreshCounts, badgesAreLive);

    // Messages come over the WebSocket rather than SSE, so the inbox badge
    // needs its own subscription: 'new_message' for one arriving, 'message_read'
    // for one read on another device or in another tab.
    const webSocket = useWebSocketContextSafe();
    useEffect(() => {
        if (!badgesAreLive || !webSocket) return;

        const unsubscribers = ['new_message', 'message_read'].map((type) =>
            webSocket.addEventListener(type, () => refreshCounts()),
        );
        return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
    }, [badgesAreLive, webSocket, refreshCounts]);

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
            if (document.visibilityState === 'visible') refreshCounts();
        };

        document.addEventListener('visibilitychange', onVisible);
        window.addEventListener('focus', refreshCounts);
        return () => {
            document.removeEventListener('visibilitychange', onVisible);
            window.removeEventListener('focus', refreshCounts);
        };
    }, [badgesAreLive, refreshCounts]);

    useEffect(() => {
        if (!badgesAreLive || !profileType) return;
        refreshCounts();
    }, [location.pathname, badgesAreLive, profileType, refreshCounts]);

    // A slow backstop, for a session that loses its stream without noticing.
    useEffect(() => {
        if (!user || !profileType || isInSetupMode || !allowAuxiliaryAccountCalls) return;

        const pollCounts = () => {
            fetchHireRequestCount();
            fetchInboxCount();
        };

        const intervalId = setInterval(pollCounts, 60_000);
        return () => clearInterval(intervalId);
    }, [user, profileType, isInSetupMode, allowAuxiliaryAccountCalls, fetchHireRequestCount, fetchInboxCount]);

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
        <nav className="sticky top-0 z-40 shadow-xl shadow-purple-200/50 bg-gradient-to-br from-primary-100 via-white to-purple-200 dark:from-[#0a0a0f] dark:via-[#13131a] dark:to-[#0a0a0f]  overflow-visible border-b border-primary-200/60 dark:border-purple-500/20 transition-all duration-300 dark:shadow-glow-sm">
            <div className="flex justify-between items-center px-8 sm:px-16 lg:px-32 min-h-[64px] sm:min-h-[72px]">
                {/* Logo */}
                <div className="relative flex items-center">
  <Link to="/" prefetch="intent" className="relative font-extrabold text-xl sm:text-2xl px-3 py-1 rounded-2xl transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-purple-300/50 hover:bg-primary-50 dark:hover:bg-[#13131a] dark:hover:shadow-glow-md drop-shadow-lg">
    <span className="logo-shimmer">
      <span className="text-gray-900 dark:text-white">Home</span>
      <span className="gradient-text">Bit</span>
    </span>
  </Link>
</div>

                {/* Public Navigation Links - Show on non-app hosts for all users */}
                {!isAppHost && (
                    <div className="hidden lg:flex items-center space-x-4 ml-auto">
                        {(user ? authLinks : navigation).map((item) => {
                            const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
                            return (
                            <Link
                                key={item.name}
                                to={item.href}
                                prefetch="intent"
                                className={`link text-xs sm:text-sm font-medium transition-all duration-300 px-5 py-1 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 relative ${isActive ? 'text-white bg-gradient-to-r from-purple-600 to-pink-600 shadow-xl scale-105' : 'text-primary-600 dark:text-purple-400 hover:text-white dark:hover:text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:shadow-xl hover:scale-110'}`}
                            >
                                {item.name}
                                {'count' in item && item.name === 'Inbox' && renderBadge((item as any).count)}
                                {'count' in item && (item.href === '/household/hiring' || item.href === '/househelp/hiring') && renderBadge((item as any).count)}
                            </Link>
                            );
                        })}
                    </div>
                )}

                {/* App navigation for authenticated users on app subdomain */}
                {isAppHost && user && (
                    <div className="hidden lg:flex items-center space-x-3 ml-auto">
                        {authLinks.map((item) => {
                            const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
                            return (
                            <Link
                                key={item.name}
                                to={item.href}
                                prefetch="intent"
                                className={`link text-xs sm:text-sm font-medium transition-all duration-300 px-5 py-1 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 relative ${isActive ? 'text-white bg-gradient-to-r from-purple-600 to-pink-600 shadow-xl scale-105' : 'text-primary-600 dark:text-purple-400 hover:text-white dark:hover:text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:shadow-xl hover:scale-110'}`}
                                id={item.name === 'Saved' ? 'shortlist-link' : undefined}
                            >
                                {item.name}
                                {item.name === 'Inbox' && renderBadge(inboxCount)}
                                {(item.href === '/household/hiring' || item.href === '/househelp/hiring') && renderBadge(hireRequestCount)}
                            </Link>
                            );
                        })}
                    </div>
                )}

                {/* Right section */}
                <div className="flex items-center space-x-4 ml-6 relative">

                    {/* Notifications (logged-in only) */}
                    {user && (
                        <button
                            type="button"
                            onClick={() => setIsNotificationsOpen(true)}
                            className="relative hidden lg:inline-flex items-center justify-center rounded-xl p-2 bg-white dark:bg-white/10 border-2 border-purple-200 dark:border-purple-500/30 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-all shadow-sm dark:shadow-glow-sm"
                            aria-label="Notifications"
                        >
                            <BellIcon className="h-6 w-6 text-purple-700 dark:text-purple-200" />
                            {renderBadge(unreadCount)}
                        </button>
                    )}

                    {/* Admin Dashboard - visible on desktop for admins only */}
                    {user && isAdmin && (
                        <a
                            href="https://hba.homebit.co.ke"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hidden lg:inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md hover:from-purple-700 hover:to-pink-700 hover:shadow-lg hover:scale-105 transition-all duration-200"
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
                        <div className="flex items-center space-x-3">
                            <Link
                                to="/waitlist"
                                className="link hidden lg:block text-xs font-medium rounded-xl transition-all duration-200 px-4 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md hover:from-purple-700 hover:to-pink-700 hover:shadow-lg hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-purple-500"
                            >
                                Join Waitlist
                            </Link>
                        </div>
                    )}

                    {/* Authenticated User Greeting */}
                    {user && userName && (
                        <Menu as="div" className="relative hidden lg:inline-block text-left">
                            <Menu.Button className="flex items-center space-x-2 px-4 py-1 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-all">
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
                                        <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
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
                    <Menu as="div" className="relative inline-block text-left lg:hidden">
                        <Menu.Button
                            className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 dark:from-purple-600 dark:to-pink-600 p-2 text-white shadow-md shadow-purple-400/40 dark:shadow-glow-sm hover:from-purple-700 hover:to-pink-700 hover:shadow-lg hover:shadow-purple-500/50 dark:hover:shadow-glow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-purple-500 transition-all duration-200"
                            aria-label="Open navigation menu"
                        >
                            <Bars3Icon className="h-7 w-7" />
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
                                        <Menu.Item>
                                            {({ active }) => (
                                                <Link
                                                    to="/waitlist"
                                                    className={`font-medium bg-gradient-to-r from-purple-600 to-pink-600 text-white block px-4 py-1 text-xs rounded-xl shadow-lg transition-all duration-200 hover:from-purple-700 hover:to-pink-700 hover:shadow-xl mx-2 my-1`}
                                                >
                                                    Join Waitlist
                                                </Link>
                                            )}
                                        </Menu.Item>
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
                                    <div className="px-5 py-3 flex items-center justify-between">
                                        <span className="text-xs font-medium text-gray-700 dark:text-gray-200">Theme</span>
                                        <ThemeToggle size="sm" />
                                    </div>

                                    {/* User Menu Items */}
                                    {user && (
                                        <>
                                            <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                                            {/* User Greeting in Mobile Menu */}
                                            <div className="px-5 py-1 text-base font-bold rounded-xl text-primary-700 dark:text-purple-400 border-b border-primary-100 dark:border-gray-700">
  <div className="font-semibold text-sm">Hello, {userName}</div>
</div>



                                            {/* App links for mobile on app host */}
                                            {isAppHost && (
                                                <>
                                                    {authLinks.map((item) => (
                                                        <Menu.Item key={item.name}>{({ active }) => (
                                                            <Link to={item.href} className={`${active ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300' : 'text-gray-700 dark:text-gray-300'} flex items-center justify-between px-4 py-1 text-xs relative`}>
                                                                <span>{item.name}</span>
                                                                {item.name === 'Inbox' && inboxCount > 0 && (
                                                                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center shadow-md shadow-purple-500/40 px-1">
                                                                        {inboxCount > 9 ? '9+' : inboxCount}
                                                                    </span>
                                                                )}
                                                                {(item.href === '/household/hiring' || item.href === '/househelp/hiring') && hireRequestCount > 0 && (
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
                                            {isAdmin && (
                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <a
                                                            href="https://hba.homebit.co.ke"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
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
            <NotificationsModal isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />

        </nav>
    );
}
