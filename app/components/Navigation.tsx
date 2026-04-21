import { Link, useNavigate, useLocation } from "react-router";
import React, { useEffect, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import { Bars3Icon, UserIcon, CogIcon, ArrowRightOnRectangleIcon, CreditCardIcon, BellIcon } from "@heroicons/react/20/solid";
import { useAuth } from "~/contexts/useAuth";
import ThemeToggle from "~/components/ui/ThemeToggle";
import { API_BASE_URL } from "~/config/api";
import DeviceApprovalBanner from '~/components/notifications/DeviceApprovalBanner';
import { useDeviceAuthPendingApprovals } from '~/hooks/useDeviceAuthPendingApprovals';
import { useProfileSetupStatus } from "~/hooks/useProfileSetupStatus";
import { useNotifications } from "~/hooks/useNotifications";
import NotificationsModal from "~/components/notifications/NotificationsModal";
import { getAccessTokenFromCookies } from '~/utils/cookie';
import { shortlistService, interestService, hireRequestService } from '~/services/grpc/authServices';
import { notificationsService } from '~/services/grpc/notifications.service';
import authService from '~/services/grpc/auth.service';
import { getStoredUser } from '~/utils/authStorage';
import { shouldSilenceGatewayError } from '~/services/grpc/client';

const navigation = [
    { name: "Services", href: "/services" },
    { name: "Blog", href: "/blog" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Pricing", href: "/pricing" },
];

export function Navigation() {
    const { user, logout, loading } = useAuth();
    const { isInSetupMode } = useProfileSetupStatus();
    const authUser = (user as any)?.user ?? null;
    const storedUser = getStoredUser();
    const currentUser = authUser ?? storedUser ?? null;
    const [profileType, setProfileType] = useState<string | null>(null);
    const [userName, setUserName] = useState<string | null>(null);
    const [shortlistCount, setShortlistCount] = useState<number>(0);
    const [inboxCount, setInboxCount] = useState<number>(0);
    const [hireRequestCount, setHireRequestCount] = useState<number>(0);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const { unreadCount } = useNotifications({ pollingMs: 30000, pageSize: 20 });
    const { approvals, newestApproval, dismiss, clearAll } = useDeviceAuthPendingApprovals(!isInSetupMode && !!user);
    const navigate = useNavigate();
    const location = useLocation();
    const pendingDeviceApprovals = approvals.length;


    // Detect if running on app subdomain
    const isAppHost = React.useMemo(() => {
        if (typeof window === 'undefined') return false;
        const host = window.location.host || '';
        // Only check for production app subdomain
        return host.startsWith('app.') || host === 'app.homebit.co.ke';
    }, []);

    // Memoized dashboard path based on profile type
    const dashboardPath = React.useMemo(() => {
        if (!profileType) return null;
        if (profileType === "household" || profileType === "household") return "/household";
        if (profileType === "househelp") return "/househelp";
        // Bureau users should not access regular navigation
        return null;
    }, [profileType]);

    const authLinks = React.useMemo(() => {
        const shortlistHref = profileType === 'household' ? '/household/shortlist' : '/shortlist';
        const hiringHistoryHref = profileType === 'household' ? '/household/hiring' : '/househelp/hiring';
        return [
            { name: 'Shortlist', href: shortlistHref, count: shortlistCount },
            { name: 'Inbox', href: '/inbox', count: inboxCount },
            { name: 'Hiring', href: hiringHistoryHref, count: hireRequestCount },
            { name: 'Blog', href: '/blog', count: 0 },
        ];
    }, [profileType, shortlistCount, inboxCount, hireRequestCount]);

    // Fetch shortlist count
    const fetchShortlistCount = async () => {
        try {
            if (!getAccessTokenFromCookies()) return;
            const data = await shortlistService.getShortlistCount('', '');
            const count = Number(data?.count) || 0;
            setShortlistCount(count);
        } catch (error) {
            if (!shouldSilenceGatewayError(error)) {
                console.error("[Shortlist Count] Failed to fetch:", error);
            }
        }
    };

    // Fetch inbox unread count
    const fetchInboxCount = async () => {
        try {
            if (!getAccessTokenFromCookies()) return;
            const data = await notificationsService.listConversations('', 0, 100);
            const conversations: any[] = data?.conversations || [];
            
            const totalUnread = conversations.reduce((sum: number, c: any) => {
                return sum + (c.unread_count || 0);
            }, 0);
            
            setInboxCount(totalUnread);
        } catch (error) {
            setInboxCount(0);
            if (!shouldSilenceGatewayError(error)) {
                console.error("Failed to fetch inbox count:", error);
            }
        }
    };

    // Fetch hiring badge count: pending items the user has NOT acted upon
    const fetchHireRequestCount = async (overrideProfileType?: string | null) => {
        try {
            if (!getAccessTokenFromCookies()) return;
            const pt = overrideProfileType ?? profileType;
            let total = 0;

            if (pt === 'household') {
                // 1. Count pending/viewed interests from househelps
                const iData = await interestService.listByHousehold('', '');
                const interests: any[] = iData?.data || [];
                total += interests.filter((i: any) => {
                    const status = i.status || "";
                    return status === 'pending' || status === 'viewed';
                }).length;

                // 2. Count pending hire requests
                const hData = await hireRequestService.listHireRequests('', '', 'pending');
                total += hData?.total || (Array.isArray(hData?.data) ? hData.data.length : 0);
            } else if (pt === 'househelp') {
                // Count pending hire requests received from households
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
    };

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
                if (email) {
                    authService.checkIsAdmin(email).then((admin) => setIsAdmin(admin)).catch(() => setIsAdmin(false));
                }

                // Bureau users should not access regular navigation
                if (resolvedProfileType === "bureau") {
                    setProfileType(null);
                    setUserName(null);
                    return;
                }

                setProfileType(resolvedProfileType);
                // Get user name for greeting
                const firstName = currentUser.first_name || currentUser.firstName || "";
                setUserName(firstName);

                // Fetch counts only for authenticated users who finished onboarding
                if (!isInSetupMode) {
                    fetchShortlistCount();
                    fetchInboxCount();
                    fetchHireRequestCount(resolvedProfileType);
                }
            } catch {
                setProfileType(null);
                setUserName(null);
            }
        } else {
            setProfileType(null);
            setUserName(null);
            setShortlistCount(0);
            setInboxCount(0);
        }
    }, [user, currentUser, isInSetupMode]);

    // Listen for shortlist and inbox updates (only when not in setup mode)
    useEffect(() => {
        if (isInSetupMode) return;

        const handleShortlistUpdate = () => {
            if (getAccessTokenFromCookies()) fetchShortlistCount();
        };

        const handleInboxUpdate = () => {
            if (getAccessTokenFromCookies()) fetchInboxCount();
        };

        const handleHiringUpdate = () => {
            if (getAccessTokenFromCookies()) fetchHireRequestCount();
        };

        window.addEventListener('shortlist-updated', handleShortlistUpdate);
        window.addEventListener('inbox-updated', handleInboxUpdate);
        window.addEventListener('hiring-updated', handleHiringUpdate);
        return () => {
            window.removeEventListener('shortlist-updated', handleShortlistUpdate);
            window.removeEventListener('inbox-updated', handleInboxUpdate);
            window.removeEventListener('hiring-updated', handleHiringUpdate);
        };
    }, [isInSetupMode]);

    // Poll all counts every 60 seconds (skip during onboarding)
    useEffect(() => {
        if (!user || !profileType || isInSetupMode) return;

        const pollCounts = () => {
            fetchShortlistCount();
            fetchInboxCount();
            fetchHireRequestCount();
        };

        const intervalId = setInterval(pollCounts, 60_000);
        return () => clearInterval(intervalId);
    }, [user, profileType, isInSetupMode]);

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

    // Hide navbar during profile setup flow
    if (isInSetupMode) {
        return null;
    }

    return (
        <nav className="sticky top-0 z-40 shadow-xl shadow-purple-200/50 bg-gradient-to-br from-primary-100 via-white to-purple-200 dark:from-[#0a0a0f] dark:via-[#13131a] dark:to-[#0a0a0f]  overflow-visible border-b border-primary-200/60 dark:border-purple-500/20 transition-all duration-300 dark:shadow-glow-sm">
            <DeviceApprovalBanner approval={newestApproval} onDismiss={dismiss} onClearAll={clearAll} />
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
                                className={`link text-base sm:text-lg font-medium transition-all duration-300 px-5 py-1 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 relative ${isActive ? 'text-white bg-gradient-to-r from-purple-600 to-pink-600 shadow-xl scale-105' : 'text-primary-600 dark:text-purple-400 hover:text-white dark:hover:text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:shadow-xl hover:scale-110'}`}
                            >
                                {item.name}
                                {'count' in item && item.name === 'Shortlist' && renderBadge((item as any).count)}
                                {'count' in item && item.name === 'Inbox' && renderBadge((item as any).count)}
                                {'count' in item && item.name === 'Hiring' && renderBadge((item as any).count)}
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
                                className={`link text-base font-medium transition-all duration-300 px-5 py-1 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 relative ${isActive ? 'text-white bg-gradient-to-r from-purple-600 to-pink-600 shadow-xl scale-105' : 'text-primary-600 dark:text-purple-400 hover:text-white dark:hover:text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:shadow-xl hover:scale-110'}`}
                                id={item.name === 'Shortlist' ? 'shortlist-link' : undefined}
                            >
                                {item.name}
                                {item.name === 'Shortlist' && renderBadge(shortlistCount)}
                                {item.name === 'Inbox' && renderBadge(inboxCount)}
                                {item.name === 'Hiring' && renderBadge(hireRequestCount)}
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
                            {pendingDeviceApprovals > 0 && (
                                <span
                                    className="absolute -bottom-1.5 -right-1.5 min-w-[22px] px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-semibold shadow-lg shadow-amber-400/60"
                                    data-testid="device-approval-count"
                                >
                                    {pendingDeviceApprovals > 9 ? '9+' : pendingDeviceApprovals}
                                </span>
                            )}
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
                                                    to={profileType === 'household' ? '/household/profile' : profileType === 'househelp' ? '/househelp/profile' : '/profile'}
                                                    className={`${active ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'text-gray-700 dark:text-gray-300'} flex items-center px-4 py-1.5 text-xs font-semibold rounded-xl mx-2 transition-all`}
                                                >
                                                    <UserIcon className="mr-3 h-5 w-5" />
                                                    {profileType === 'household' ? 'My Household' : profileType === 'househelp' ? 'My Profile' : 'Profile'}
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
                                                        {pendingDeviceApprovals > 0 && (
                                                            <span className="bg-amber-500/90 text-white text-[10px] font-bold rounded-full min-w-[20px] h-[18px] flex items-center justify-center px-1" data-testid="device-approval-count-mobile">
                                                                {pendingDeviceApprovals > 9 ? '9+' : pendingDeviceApprovals}
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
                                                                {item.name === 'Shortlist' && shortlistCount > 0 && (
                                                                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center shadow-md shadow-purple-500/40 px-1">
                                                                        {shortlistCount > 9 ? '9+' : shortlistCount}
                                                                    </span>
                                                                )}
                                                                {item.name === 'Inbox' && inboxCount > 0 && (
                                                                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center shadow-md shadow-purple-500/40 px-1">
                                                                        {inboxCount > 9 ? '9+' : inboxCount}
                                                                    </span>
                                                                )}
                                                                {item.name === 'Hiring' && hireRequestCount > 0 && (
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
                                                        to={profileType === 'household' ? '/household/profile' : profileType === 'househelp' ? '/househelp/profile' : '/profile'}
                                                        className={`${
                                                            active ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300' : 'text-gray-700 dark:text-gray-300'
                                                        } flex items-center px-4 py-1 text-xs`}
                                                    >
                                                        <UserIcon className="mr-3 h-5 w-5" />
                                                        {profileType === 'household' ? 'My Household' : profileType === 'househelp' ? 'My Profile' : 'Profile'}
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
