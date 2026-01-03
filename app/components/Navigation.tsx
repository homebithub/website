import { Link, useNavigate, useLocation } from "react-router";
import React, { useEffect, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import { Bars3Icon, UserIcon, CogIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/20/solid";
import { useAuth } from "~/contexts/useAuth";
import { Waitlist } from "~/components/features/Waitlist";
import ThemeToggle from "~/components/ui/ThemeToggle";
import { FEATURE_FLAGS } from "~/config/features";
import { API_BASE_URL, NOTIFICATIONS_API_BASE_URL } from "~/config/api";

const navigation = [
    { name: "Services", href: "/services" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Pricing", href: "/pricing" },
];

export function Navigation() {
    const { user, logout, loading } = useAuth();
    const [profileType, setProfileType] = useState<string | null>(null);
    const [userName, setUserName] = useState<string | null>(null);
    const [shortlistCount, setShortlistCount] = useState<number>(0);
    const [inboxCount, setInboxCount] = useState<number>(0);
    const [hireRequestCount, setHireRequestCount] = useState<number>(0);
    const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
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

            const res = await fetch(`${NOTIFICATIONS_API_BASE_URL}/notifications/api/v1/inbox/conversations?limit=100`, {
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

    // Fetch hire request count (pending requests for househelps, or all for households)
    const fetchHireRequestCount = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const status = profileType === 'househelp' ? 'pending' : '';
            const params = status ? `?status=${status}&limit=100` : '?limit=100';

            const res = await fetch(`${API_BASE_URL}/api/v1/hire-requests${params}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                const data = await res.json();
                const count = profileType === 'househelp'
                    ? (data.total || 0) // Pending requests for househelps
                    : (data.data?.filter((req: any) => req.status === 'pending' || req.status === 'accepted').length || 0); // Active requests for households
                setHireRequestCount(count);
            }
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
                    if (profileType === "household") {
                        console.log('[Navigation] Fetching shortlist count for household user');
                        fetchShortlistCount();
                    } else {
                        console.log('[Navigation] Not fetching shortlist count - profile type is:', profileType);
                    }
                    fetchInboxCount();
                    fetchHireRequestCount();
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

        window.addEventListener('shortlist-updated', handleShortlistUpdate);
        window.addEventListener('inbox-updated', handleInboxUpdate);
        return () => {
            window.removeEventListener('shortlist-updated', handleShortlistUpdate);
            window.removeEventListener('inbox-updated', handleInboxUpdate);
        };
    }, []);

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

    return (
        <nav className="sticky top-0 z-40 shadow-xl shadow-purple-200/50 bg-gradient-to-br from-primary-100 via-white to-purple-200 dark:from-[#0a0a0f]/95 dark:via-[#13131a]/95 dark:to-[#0a0a0f]/95 fade-in-scroll overflow-visible backdrop-blur-xl border-b border-primary-200/60 dark:border-purple-500/20 transition-all duration-300 dark:shadow-glow-sm">
  {/* Animated Blobs & Icons */}
  <svg className="absolute top-0 right-0 w-24 h-24 opacity-30 dark:opacity-20 animate-float z-0" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#f472b6" /></svg>
  <svg className="absolute bottom-0 left-0 w-20 h-20 opacity-20 dark:opacity-10 blur-sm animate-float delay-500 z-0" viewBox="0 0 100 100"><path d="M10,80 Q50,10 90,80" stroke="#2dd4bf" strokeWidth="8" fill="none" /></svg>
            <div className="flex justify-between items-center px-8 sm:px-16 lg:px-32 min-h-[64px] sm:min-h-[72px]">
                {/* Logo */}
                <div className="relative flex items-center">
  {/* Floating purple blob */}
  <svg className="absolute -top-8 -left-8 w-16 h-16 opacity-30 animate-float" viewBox="0 0 100 100"><ellipse cx="50" cy="50" rx="50" ry="40" fill="#a855f7" /></svg>
  <Link to="/" prefetch="intent" className="relative gradient-text font-extrabold text-3xl sm:text-4xl px-3 py-2 rounded-2xl transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-purple-300/50 hover:bg-primary-50 dark:hover:bg-[#13131a] dark:hover:shadow-glow-md drop-shadow-lg">
    HomeBit
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
                                className="link text-lg sm:text-xl font-bold transition-all duration-300 px-5 py-2 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 text-primary-600 dark:text-purple-400 hover:text-white dark:hover:text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:shadow-xl hover:scale-110"
                            >
                                {item.name}
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
                                className="link text-lg font-bold transition-all duration-300 px-5 py-2 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 text-primary-600 dark:text-purple-400 hover:text-white dark:hover:text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:shadow-xl hover:scale-110 relative"
                                id={item.name === 'Shortlist' ? 'shortlist-link' : undefined}
                            >
                                {item.name}
                                {item.name === 'Shortlist' && (
                                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg shadow-purple-500/50" style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
                                        {shortlistCount}
                                    </span>
                                )}
                                {item.name === 'Inbox' && inboxCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg shadow-purple-500/50" style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
                                        {inboxCount}
                                    </span>
                                )}
                                {item.name === 'Hiring' && hireRequestCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg shadow-green-500/50" style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
                                        {hireRequestCount}
                                    </span>
                                )}
                            </Link>
                        ))}
                    </div>
                )}

                {/* Right section */}
                <div className="flex items-center space-x-4 ml-6 relative">
  {/* Floating sparkle icon */}
  <svg className="absolute -top-6 right-0 w-8 h-8 opacity-40 animate-float delay-1000 z-0" viewBox="0 0 32 32"><path d="M16 2 L20 12 L30 16 L20 20 L16 30 L12 20 L2 16 L12 12 Z" fill="#a855f7" /></svg>

                    {/* Theme Toggle - Always visible on desktop */}
                    <div className="hidden lg:block">
                        <ThemeToggle size="md" />
                    </div>

                    {showAuthButtons && (
                        <div className="flex items-center space-x-3">
                            <button
  onClick={() => setIsWaitlistOpen(true)}
  className="hidden lg:block glow-button bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg sm:text-xl font-bold rounded-xl shadow-lg px-6 py-3 transition-all duration-200 hover:from-purple-700 hover:to-pink-700 hover:shadow-xl hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
>
  Join Waitlist
</button>
                            {FEATURE_FLAGS.showAuthButtons && (
                                <>
                                    <Link
                                        to="/login"
                                        className="link hidden lg:block text-lg font-bold rounded-xl transition-all duration-200 px-5 py-3 text-primary-600 dark:text-purple-400 border-2 border-primary-600 dark:border-purple-500 hover:bg-primary-100 dark:hover:bg-purple-900/30 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 dark:focus-visible:ring-purple-500"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        to="/signup"
                                        className="hidden lg:block px-6 py-3 text-lg rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-bold shadow-lg hover:shadow-xl hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-purple-500"
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
                            <Menu.Button className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-all">
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
                                                    className={`${active ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'text-gray-700 dark:text-gray-300'} flex items-center px-4 py-3 text-sm font-semibold rounded-lg mx-2 transition-all`}
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
                                                    className={`${active ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'text-gray-700 dark:text-gray-300'} flex items-center px-4 py-3 text-sm font-semibold rounded-lg mx-2 transition-all`}
                                                >
                                                    <CogIcon className="mr-3 h-5 w-5" />
                                                    Settings
                                                </Link>
                                            )}
                                        </Menu.Item>
                                        <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                    onClick={handleLogout}
                                                    className={`${active ? 'bg-gradient-to-r from-red-600 to-red-700 text-white' : 'text-gray-700 dark:text-gray-300'} flex items-center w-full px-4 py-3 text-sm font-semibold rounded-lg mx-2 transition-all`}
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
                        <Menu.Button className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 dark:from-purple-600 dark:to-pink-600 p-2 text-white shadow-md shadow-purple-400/40 dark:shadow-glow-sm hover:from-purple-700 hover:to-pink-700 hover:shadow-lg hover:shadow-purple-500/50 dark:hover:shadow-glow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-purple-500 transition-all duration-200">
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
                            <Menu.Items className="absolute right-0 z-50 mt-2 w-64 origin-top-right rounded-xl bg-white/90 dark:bg-[#13131a]/95 border-2 border-primary-200 dark:border-purple-500/30 shadow-xl shadow-purple-200/50 dark:shadow-glow-sm focus:outline-none backdrop-blur-xl">
                                <div className="py-2">
                                    {/* Navigation links in mobile menu (non-app host) */}
                                    {!isAppHost && (user ? authLinks : navigation).map((item) => (
                                        <Menu.Item key={item.name}>
                                            {({ active }) => (
                                                <Link
                                                    to={item.href}
                                                    className={`font-bold ${active ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white scale-105' : 'text-primary-700 dark:text-purple-400'} block px-5 py-2 text-lg rounded-xl transition-all duration-200 mx-2 hover:scale-105`}
                                                >
                                                    {item.name}
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
      className={`lg:hidden w-full text-left bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold block px-5 py-2 text-lg rounded-xl shadow-lg transition-all duration-200 hover:from-purple-700 hover:to-pink-700 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500`}
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
                                                                className={`font-bold ${active ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-2 border-transparent scale-105' : 'text-primary-700 dark:text-purple-400 border-2 border-primary-600 dark:border-purple-500'} block px-5 py-2 text-lg rounded-xl transition-all duration-200 mx-2 my-1 hover:scale-105`}
                                                            >
                                                                Log in
                                                            </Link>
                                                        )}
                                                    </Menu.Item>
                                                    <Menu.Item>
                                                        {({ active }) => (
                                                            <Link
                                                                to="/signup"
                                                                className={`font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white block px-5 py-2 text-lg rounded-xl shadow-lg transition-all duration-200 hover:from-purple-700 hover:to-pink-700 hover:shadow-xl mx-2 my-1`}
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
                                            <div className="border-t border-gray-200 my-1"></div>
                                            {/* User Greeting in Mobile Menu */}
                                            <div className="px-5 py-2 text-lg font-bold rounded-xl text-primary-700 dark:text-purple-400 border-b border-primary-100 dark:border-gray-700">
  <div className="font-semibold text-base">Hello, {userName}</div>
</div>



                                            {/* App links for mobile on app host */}
                                            {isAppHost && (
                                                <>
                                                    {authLinks.map((item) => (
                                                        <Menu.Item key={item.name}>{({ active }) => (
                                                            <Link to={item.href} className={`${active ? 'bg-purple-100 text-purple-600' : 'text-gray-700 dark:text-gray-300'} flex items-center justify-between px-4 py-2 text-sm relative`}>
                                                                <span>{item.name}</span>
                                                                {item.name === 'Shortlist' && (
                                                                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-md shadow-purple-500/40" style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
                                                                        {shortlistCount}
                                                                    </span>
                                                                )}
                                                                {item.name === 'Inbox' && inboxCount > 0 && (
                                                                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-md shadow-purple-500/40" style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
                                                                        {inboxCount}
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
                                                            active ? 'bg-purple-100 text-purple-600' : 'text-gray-700'
                                                        } flex items-center px-4 py-2 text-sm`}
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
                                                            active ? 'bg-purple-100 text-purple-600' : 'text-gray-700'
                                                        } flex items-center px-4 py-2 text-sm`}
                                                    >
                                                        <CogIcon className="mr-3 h-5 w-5" />
                                                        Settings
                                                    </Link>
                                                )}
                                            </Menu.Item>
                                            <Menu.Item>
                                                {({ active }) => (
                                                    <button
                                                        onClick={handleLogout}
                                                        className={`${
                                                            active ? 'bg-red-100 text-red-700' : 'text-gray-700'
                                                        } flex items-center w-full px-4 py-2 text-sm`}
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
