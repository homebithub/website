import { Link, useNavigate, useLocation } from "react-router";
import React, { useEffect, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import { Bars3Icon, UserIcon, CogIcon, ArrowRightOnRectangleIcon, CreditCardIcon, BellIcon } from "@heroicons/react/20/solid";
import { useAuth } from "~/contexts/useAuth";
import { Waitlist } from "~/components/features/Waitlist";
import ThemeToggle from "~/components/ui/ThemeToggle";
import { FEATURE_FLAGS } from "~/config/features";
import { API_BASE_URL, NOTIFICATIONS_API_BASE_URL } from "~/config/api";
import { useProfileSetupStatus } from "~/hooks/useProfileSetupStatus";
import { useNotifications } from "~/hooks/useNotifications";
import NotificationsModal from "~/components/notifications/NotificationsModal";

const navigation = [
    { name: "Services", href: "/services" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Pricing", href: "/pricing" },
];

export function Navigation() {
    const { user, logout, loading } = useAuth();
    const { isInSetupMode } = useProfileSetupStatus();
    const [profileType, setProfileType] = useState<string | null>(null);
    const [userName, setUserName] = useState<string | null>(null);
    const [shortlistCount, setShortlistCount] = useState<number>(0);
    const [inboxCount, setInboxCount] = useState<number>(0);
    const [hireRequestCount, setHireRequestCount] = useState<number>(0);
    const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const { unreadCount } = useNotifications({ pollingMs: 30000, pageSize: 20 });
    const [prefillEmail, setPrefillEmail] = useState<string | undefined>(undefined);
    const [prefillFirstName, setPrefillFirstName] = useState<string | undefined>(undefined);
    const [prefillError, setPrefillError] = useState<string | undefined>(undefined);
    const navigate = useNavigate();
    const location = useLocation();

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
        ];
    }, [profileType, shortlistCount, inboxCount, hireRequestCount]);

    // Fetch shortlist count
    const fetchShortlistCount = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                console.log('[Shortlist Count] No token found');
                return;
            }

            console.log('[Shortlist Count] Fetching from:', `${API_BASE_URL}/api/v1/shortlists/count`);
            const res = await fetch(`${API_BASE_URL}/api/v1/shortlists/count`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            console.log('[Shortlist Count] Response status:', res.status);

            if (res.ok) {
                const data = await res.json();
                console.log('[Shortlist Count] Data received:', data);
                const count = data.count || 0;
                console.log('[Shortlist Count] Setting count to:', count);
                setShortlistCount(count);
            } else {
                const errorText = await res.text();
                console.error('[Shortlist Count] Error response:', res.status, errorText);
            }
        } catch (error) {
            console.error("[Shortlist Count] Failed to fetch:", error);
        }
    };

    // Fetch inbox unread count
    const fetchInboxCount = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            // Route inbox calls through gateway
            const res = await fetch(`${API_BASE_URL}/api/v1/inbox/conversations?limit=100`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                const data = await res.json();
                const conversations = data.conversations || [];
                const totalUnread = conversations.reduce((sum: number, conv: any) => sum + (conv.unread_count || 0), 0);
                setInboxCount(totalUnread);
            }
        } catch (error) {
            console.error("Failed to fetch inbox count:", error);
        }
    };

    // Fetch hiring badge count: pending items the user has NOT acted upon
    // Household: pending interests from househelps + pending hire requests received
    // Househelp: pending hire requests received from households
    const fetchHireRequestCount = async (overrideProfileType?: string | null) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const pt = overrideProfileType ?? profileType;
            let total = 0;

            if (pt === 'household') {
                // 1. Count pending/viewed interests from househelps (not yet accepted/declined)
                const interestsRes = await fetch(`${API_BASE_URL}/api/v1/interests/household`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (interestsRes.ok) {
                    const iData = await interestsRes.json();
                    const interests = iData.data?.data || iData.data || [];
                    if (Array.isArray(interests)) {
                        total += interests.filter((i: any) => i.status === 'pending' || i.status === 'viewed').length;
                    }
                }

                // 2. Count pending hire requests (ones where househelp hasn't responded yet)
                const hireRes = await fetch(`${API_BASE_URL}/api/v1/hire-requests?status=pending&limit=100`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (hireRes.ok) {
                    const hData = await hireRes.json();
                    total += hData.total || (Array.isArray(hData.data) ? hData.data.length : 0);
                }
            } else if (pt === 'househelp') {
                // Count pending hire requests received from households
                const res = await fetch(`${API_BASE_URL}/api/v1/hire-requests?status=pending&limit=100`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    total = data.total || (Array.isArray(data.data) ? data.data.length : 0);
                }
            }

            setHireRequestCount(total);
        } catch (error) {
            console.error("Failed to fetch hire request count:", error);
        }
    };

    // Parse user profile type and name from localStorage
    useEffect(() => {
        if (user) {
            try {
                const obj = localStorage.getItem("user_object");
                if (obj) {
                    const parsed = JSON.parse(obj);
                    const profileType = parsed.profile_type || null;

                    // Bureau users should not access regular navigation
                    if (profileType === "bureau") {
                        setProfileType(null);
                        setUserName(null);
                        return;
                    }

                    setProfileType(profileType);
                    // Get user name for greeting
                    const firstName = parsed.first_name || parsed.firstName || "";
                    setUserName(firstName);

                    console.log('[Navigation] Profile type:', profileType);
                    console.log('[Navigation] Is household?', profileType === "household");

                    // Fetch counts for authenticated users
                    fetchShortlistCount();
                    fetchInboxCount();
                    fetchHireRequestCount(profileType);
                } else {
                    setProfileType(null);
                    setUserName(null);
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
    }, [user]);

    // Listen for shortlist and inbox updates
    useEffect(() => {
        const handleShortlistUpdate = () => {
            fetchShortlistCount();
        };

        const handleInboxUpdate = () => {
            fetchInboxCount();
        };

        const handleHiringUpdate = () => {
            fetchHireRequestCount();
        };

        window.addEventListener('shortlist-updated', handleShortlistUpdate);
        window.addEventListener('inbox-updated', handleInboxUpdate);
        window.addEventListener('hiring-updated', handleHiringUpdate);
        return () => {
            window.removeEventListener('shortlist-updated', handleShortlistUpdate);
            window.removeEventListener('inbox-updated', handleInboxUpdate);
            window.removeEventListener('hiring-updated', handleHiringUpdate);
        };
    }, []);

    // Poll all counts every 60 seconds
    useEffect(() => {
        if (!user || !profileType) return;

        const pollCounts = () => {
            fetchShortlistCount();
            fetchInboxCount();
            fetchHireRequestCount();
        };

        const intervalId = setInterval(pollCounts, 60_000);
        return () => clearInterval(intervalId);
    }, [user, profileType]);

    // Badge helper: 0 = null (hidden), 1-9 = number, >9 = "9+"
    const renderBadge = (count: number, gradient = 'from-purple-600 to-pink-600', shadow = 'shadow-purple-500/50') => {
        if (count <= 0) return null;
        const label = count > 9 ? '9+' : String(count);
        return (
            <span
                className={`absolute -top-2 -right-3 bg-gradient-to-r ${gradient} text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center shadow-lg ${shadow} px-1`}
            >
                {label}
            </span>
        );
    };

    // Open waitlist modal automatically if URL contains waitlist params (used by OAuth callback)
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const shouldOpen = params.get("waitlist");
        if (shouldOpen === "1" || shouldOpen === "true") {
            setIsWaitlistOpen(true);
            const email = params.get("email") || undefined;
            const first = params.get("first_name") || undefined;
            const err = params.get("error") || undefined;
            setPrefillEmail(email || undefined);
            setPrefillFirstName(first || undefined);
            setPrefillError(err || undefined);
        }
    }, [location.search]);

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
            <div className="flex justify-between items-center px-8 sm:px-16 lg:px-32 min-h-[64px] sm:min-h-[72px]">
                {/* Logo */}
                <div className="relative flex items-center">
  <Link to="/" prefetch="intent" className="relative font-extrabold text-2xl sm:text-3xl px-3 py-1 rounded-2xl transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-purple-300/50 hover:bg-primary-50 dark:hover:bg-[#13131a] dark:hover:shadow-glow-md drop-shadow-lg">
    <span className="logo-shimmer gradient-text">HomeBit</span>
  </Link>
</div>

                {/* Public Navigation Links - Show on non-app hosts for all users */}
                {!isAppHost && (
                    <div className="hidden lg:flex items-center space-x-4 ml-auto">
                        {(user ? authLinks : navigation).map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                prefetch="intent"
                                className="link text-lg sm:text-xl font-medium transition-all duration-300 px-5 py-1 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 text-primary-600 dark:text-purple-400 hover:text-white dark:hover:text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:shadow-xl hover:scale-110 relative"
                            >
                                {item.name}
                                {'count' in item && item.name === 'Shortlist' && renderBadge((item as any).count)}
                                {'count' in item && item.name === 'Inbox' && renderBadge((item as any).count)}
                                {'count' in item && item.name === 'Hiring' && renderBadge((item as any).count, 'from-green-600 to-emerald-600', 'shadow-green-500/50')}
                            </Link>
                        ))}
                    </div>
                )}

                {/* App navigation for authenticated users on app subdomain */}
                {isAppHost && user && (
                    <div className="hidden lg:flex items-center space-x-3 ml-auto">
                        {authLinks.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                prefetch="intent"
                                className="link text-lg font-medium transition-all duration-300 px-5 py-1 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 text-primary-600 dark:text-purple-400 hover:text-white dark:hover:text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:shadow-xl hover:scale-110 relative"
                                id={item.name === 'Shortlist' ? 'shortlist-link' : undefined}
                            >
                                {item.name}
                                {item.name === 'Shortlist' && renderBadge(shortlistCount)}
                                {item.name === 'Inbox' && renderBadge(inboxCount)}
                                {item.name === 'Hiring' && renderBadge(hireRequestCount, 'from-green-600 to-emerald-600', 'shadow-green-500/50')}
                            </Link>
                        ))}
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

                    {/* Theme Toggle - Always visible on desktop */}
                    <div className="hidden lg:block">
                        <ThemeToggle size="md" />
                    </div>

                    {showAuthButtons && (
                        <div className="flex items-center space-x-3">
                            <button
  onClick={() => setIsWaitlistOpen(true)}
  className="hidden lg:block glow-button bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium rounded-xl shadow-lg px-4 py-1 transition-all duration-200 hover:from-purple-700 hover:to-pink-700 hover:shadow-xl hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
>
  Join Waitlist
</button>
                            {FEATURE_FLAGS.showAuthButtons && (
                                <>
                                    <Link
                                        to="/login"
                                        className="link hidden lg:block text-sm font-medium rounded-xl transition-all duration-200 px-4 py-1 text-primary-600 dark:text-purple-400 border-2 border-primary-600 dark:border-purple-500 hover:bg-primary-100 dark:hover:bg-purple-900/30 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 dark:focus-visible:ring-purple-500"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        to="/signup"
                                        className="hidden lg:block px-4 py-1 text-sm rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-purple-500"
                                    >
                                        Sign up
                                    </Link>
                                </>
                            )}
                        </div>
                    )}

                    {/* Authenticated User Greeting */}
                    {user && userName && (
                        <Menu as="div" className="relative hidden lg:inline-block text-left">
                            <Menu.Button className="flex items-center space-x-2 px-4 py-1 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-all">
                                <div className="text-sm text-gray-600 dark:text-gray-300">
                                    <span className="font-semibold text-base">Hello, {userName}</span>
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
                                                    className={`${active ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'text-gray-700 dark:text-gray-300'} flex items-center px-4 py-1.5 text-sm font-semibold rounded-xl mx-2 transition-all`}
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
                                                    className={`${active ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'text-gray-700 dark:text-gray-300'} flex items-center px-4 py-1.5 text-sm font-semibold rounded-xl mx-2 transition-all`}
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
                                                    className={`${active ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'text-gray-700 dark:text-gray-300'} flex items-center px-4 py-1.5 text-sm font-semibold rounded-xl mx-2 transition-all`}
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
                                                    className={`${active ? 'bg-gradient-to-r from-red-600 to-red-700 text-white' : 'text-gray-700 dark:text-gray-300'} flex items-center w-full px-4 py-1.5 text-sm font-semibold rounded-xl mx-2 transition-all`}
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
                        <Menu.Button className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 dark:from-purple-600 dark:to-pink-600 p-2 text-white shadow-md shadow-purple-400/40 dark:shadow-glow-sm hover:from-purple-700 hover:to-pink-700 hover:shadow-lg hover:shadow-purple-500/50 dark:hover:shadow-glow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-purple-500 transition-all duration-200">
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
                                            {({ active }) => (
                                                <Link
                                                    to={item.href}
                                                    className={`font-medium ${active ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white scale-105' : 'text-primary-700 dark:text-purple-400'} flex items-center justify-between px-5 py-1 text-lg rounded-xl transition-all duration-200 mx-2 hover:scale-105`}
                                                >
                                                    <span>{item.name}</span>
                                                    {'count' in item && (item as any).count > 0 && (
                                                        <span className={`bg-gradient-to-r ${item.name === 'Hiring' ? 'from-green-600 to-emerald-600' : 'from-purple-600 to-pink-600'} text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1`}>
                                                            {(item as any).count > 9 ? '9+' : (item as any).count}
                                                        </span>
                                                    )}
                                                </Link>
                                            )}
                                        </Menu.Item>
                                    ))}

                                    {/* Mobile Auth Options */}
                                    {showAuthButtons && (
                                        <>
                                            <Menu.Item>
  {({ active }) => (
    <button
      onClick={() => setIsWaitlistOpen(true)}
      className={`lg:hidden w-full text-left bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium block px-4 py-1 text-sm rounded-xl shadow-lg transition-all duration-200 hover:from-purple-700 hover:to-pink-700 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500`}
    >
      Join Waitlist
    </button>
  )}
</Menu.Item>
                                            {FEATURE_FLAGS.showAuthButtons && (
                                                <>
                                                    <Menu.Item>
                                                        {({ active }) => (
                                                            <Link
                                                                to="/login"
                                                                className={`font-medium ${active ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-2 border-transparent scale-105' : 'text-primary-700 dark:text-purple-400 border-2 border-primary-600 dark:border-purple-500'} block px-4 py-1 text-sm rounded-xl transition-all duration-200 mx-2 my-1 hover:scale-105`}
                                                            >
                                                                Log in
                                                            </Link>
                                                        )}
                                                    </Menu.Item>
                                                    <Menu.Item>
                                                        {({ active }) => (
                                                            <Link
                                                                to="/signup"
                                                                className={`font-medium bg-gradient-to-r from-purple-600 to-pink-600 text-white block px-4 py-1 text-sm rounded-xl shadow-lg transition-all duration-200 hover:from-purple-700 hover:to-pink-700 hover:shadow-xl mx-2 my-1`}
                                                            >
                                                                Sign up
                                                            </Link>
                                                        )}
                                                    </Menu.Item>
                                                </>
                                            )}
                                        </>
                                    )}

                                    {/* Theme Toggle in Mobile Menu */}
                                    <Menu.Item>
                                        <div className="px-5 py-3 flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Theme</span>
                                            <ThemeToggle size="sm" />
                                        </div>
                                    </Menu.Item>

                                    {/* User Menu Items */}
                                    {user && (
                                        <>
                                            <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                                            {/* User Greeting in Mobile Menu */}
                                            <div className="px-5 py-1 text-lg font-bold rounded-xl text-primary-700 dark:text-purple-400 border-b border-primary-100 dark:border-gray-700">
  <div className="font-semibold text-base">Hello, {userName}</div>
</div>



                                            {/* App links for mobile on app host */}
                                            {isAppHost && (
                                                <>
                                                    {authLinks.map((item) => (
                                                        <Menu.Item key={item.name}>{({ active }) => (
                                                            <Link to={item.href} className={`${active ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300' : 'text-gray-700 dark:text-gray-300'} flex items-center justify-between px-4 py-1 text-sm relative`}>
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
                                                                    <span className="bg-gradient-to-r from-green-600 to-emerald-600 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center shadow-md shadow-green-500/40 px-1">
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
                                                        } flex items-center px-4 py-1 text-sm`}
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
                                                        } flex items-center px-4 py-1 text-sm`}
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
                                                        } flex items-center px-4 py-1 text-sm`}
                                                    >
                                                        <CreditCardIcon className="mr-3 h-5 w-5" />
                                                        Subscriptions
                                                    </Link>
                                                )}
                                            </Menu.Item>
                                            <Menu.Item>
                                                {({ active }) => (
                                                    <button
                                                        onClick={handleLogout}
                                                        className={`${
                                                            active ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'
                                                        } flex items-center w-full px-4 py-1 text-sm`}
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

            {/* Waitlist Modal */}
            <Waitlist
                isOpen={isWaitlistOpen}
                onClose={() => {
                    setIsWaitlistOpen(false);
                    // Clean query params after closing if they were used to open the modal
                    if (new URLSearchParams(location.search).has("waitlist")) {
                        navigate(location.pathname, { replace: true });
                    }
                }}
                prefillEmail={prefillEmail}
                prefillFirstName={prefillFirstName}
                prefillError={prefillError}
            />
        </nav>
    );
}
