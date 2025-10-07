import { Link, useNavigate, useLocation } from "react-router";
import React, { useEffect, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import { Bars3Icon, UserIcon, CogIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/20/solid";
import { useAuth } from "~/contexts/AuthContext";
import { Waitlist } from "~/components/features/Waitlist";

const navigation = [
    { name: "Services", href: "/services" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Pricing", href: "/pricing" },
];

export function Navigation() {
    const { user, logout } = useAuth();
    const [profileType, setProfileType] = useState<string | null>(null);
    const [userName, setUserName] = useState<string | null>(null);
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
        return host.startsWith('app.') || host === 'app.homexpert.co.ke';
    }, []);

    // Memoized dashboard path based on profile type
    const dashboardPath = React.useMemo(() => {
        if (!profileType) return null;
        if (profileType === "employer" || profileType === "household") return "/household";
        if (profileType === "househelp") return "/househelp";
        // Bureau users should not access regular navigation
        return null;
    }, [profileType]);

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
        }
    }, [user]);

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
    const showAuthButtons = !user && !isAppHost;



    // On app subdomain without an authenticated user, hide navbar completely
    if (isAppHost && !user) {
        return null;
    }

    return (
        <nav className="sticky top-0 z-40 shadow-md bg-gradient-to-br from-primary-100 via-white to-purple-200 fade-in-scroll overflow-visible backdrop-blur-lg bg-white/70 border-b border-primary-100">
  {/* Animated Blobs & Icons */}
  <svg className="absolute top-0 right-0 w-24 h-24 opacity-30 animate-float z-0" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#f472b6" /></svg>
  <svg className="absolute bottom-0 left-0 w-20 h-20 opacity-20 blur-sm animate-float delay-500 z-0" viewBox="0 0 100 100"><path d="M10,80 Q50,10 90,80" stroke="#2dd4bf" strokeWidth="8" fill="none" /></svg>
            <div className="flex justify-between items-center px-8 sm:px-16 lg:px-32 min-h-[64px] sm:min-h-[72px]">
                {/* Logo */}
                <div className="relative flex items-center">
  {/* Floating purple blob */}
  <svg className="absolute -top-8 -left-8 w-16 h-16 opacity-30 animate-float" viewBox="0 0 100 100"><ellipse cx="50" cy="50" rx="50" ry="40" fill="#a855f7" /></svg>
  <Link to="/" prefetch="intent" className="relative text-primary-700 font-extrabold text-3xl sm:text-4xl px-3 py-2 rounded-2xl transition-all duration-300 hover:scale-110 hover:shadow-lg hover:bg-primary-50 drop-shadow-lg">
    HomeXpert
  </Link>
</div>

                {/* Public Navigation Links - Only show for non-authenticated users on larger screens (non-app host) */}
                {showAuthButtons && (
                    <div className="hidden lg:flex items-center space-x-4 ml-auto">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                prefetch="intent"
                                className="link text-lg sm:text-xl font-bold transition-all duration-300 px-5 py-2 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 text-primary-700 hover:text-white hover:bg-primary-500 hover:scale-110 hover:shadow-lg"
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>
                )}

                {/* Right section */}
                <div className="flex items-center space-x-4 ml-6 relative">
  {/* Floating sparkle icon */}
  <svg className="absolute -top-6 right-0 w-8 h-8 opacity-40 animate-float delay-1000 z-0" viewBox="0 0 32 32"><path d="M16 2 L20 12 L30 16 L20 20 L16 30 L12 20 L2 16 L12 12 Z" fill="#a855f7" /></svg>
                    {showAuthButtons && (
                        <div className="flex items-center space-x-3">
                            <button
  onClick={() => setIsWaitlistOpen(true)}
  className="hidden lg:block bg-primary-600 text-white text-lg sm:text-xl font-bold rounded-xl shadow-lg px-6 py-3 transition-all duration-200 hover:bg-primary-700 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 border-2 border-primary-700"
>
  Join Waitlist
</button>
                            {/*<Link*/}
                            {/*    to="/login"*/}
                            {/*    className="link hidden lg:block text-lg font-bold rounded-lg transition-colors duration-200 px-4 py-2 text-purple-600 border-2 border-purple-600 hover:bg-purple-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-purple-500"*/}
                            {/*>*/}
                            {/*    Log in*/}
                            {/*</Link>*/}
                            {/*<button*/}
                            {/*    onClick={() => navigate('/signup')}*/}
                            {/*    className="px-6 py-3 text-lg rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition-colors duration-200 font-bold shadow-md hover:shadow-lg"*/}
                            {/*>*/}
                            {/*    Sign up*/}
                            {/*</button>*/}
                        </div>
                    )}

                    {/* Authenticated User Greeting */}
                    {user && userName && (
                        <div className="hidden lg:flex items-center space-x-3">
                            <div className="text-sm text-gray-600">
                                <span className="font-semibold text-base">Hello, {userName}</span>
                            </div>
                        </div>
                    )}

                    {/* App navigation for authenticated users on app subdomain */}
                    {isAppHost && user && (
                        <div className="hidden lg:flex items-center space-x-3 ml-4">
                            {profileType === 'employer' || profileType === 'household' ? (
                                <>
                                    <Link to="/household/profile" prefetch="intent" className="text-primary-700 font-semibold hover:text-primary-900">Profile</Link>
                                    <Link to="/household/employment" prefetch="intent" className="text-primary-700 font-semibold hover:text-primary-900">Find Househelps</Link>
                                    <Link to="/household/employment?tab=shortlist" prefetch="intent" className="text-primary-700 font-semibold hover:text-primary-900">Shortlist</Link>
                                </>
                            ) : profileType === 'househelp' ? (
                                <>
                                    <Link to="/househelp" prefetch="intent" className="text-primary-700 font-semibold hover:text-primary-900">Profile</Link>
                                    <Link to="/househelp/find-households" prefetch="intent" className="text-primary-700 font-semibold hover:text-primary-900">Find Households</Link>
                                </>
                            ) : null}
                        </div>
                    )}

                    {/* Menu Dropdown - Only show on mobile */}
                    <Menu as="div" className="relative inline-block text-left lg:hidden">
                        <Menu.Button className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-purple-600 p-2 text-white shadow-md hover:bg-purple-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-purple-500 transition-all duration-200">
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
                            <Menu.Items className="absolute right-0 z-50 mt-2 w-64 origin-top-right rounded-xl bg-white/90 border-2 border-primary-200 shadow-lg focus:outline-none backdrop-blur-md">
                                <div className="py-2">
                                    {/* Public navigation links in mobile menu (non-app host only) */}
                                    {!isAppHost && navigation.map((item) => (
                                        <Menu.Item key={item.name}>
                                            {({ active }) => (
                                                <Link
                                                    to={item.href}
                                                    className={`font-bold ${active ? 'bg-primary-100 text-primary-700' : 'text-primary-700'} block px-5 py-2 text-lg rounded-xl transition-all duration-200`}
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
      className={`lg:hidden w-full text-left bg-primary-600 text-white font-bold block px-5 py-2 text-lg rounded-xl shadow-md transition-all duration-200 hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500`}
    >
      Join Waitlist
    </button>
  )}
</Menu.Item>
                                                                                    </>
                                    )}

                                    {/* User Menu Items */}
                                    {user && (
                                        <>
                                            <div className="border-t border-gray-200 my-1"></div>
                                            {/* User Greeting in Mobile Menu */}
                                            <div className="px-5 py-2 text-lg font-bold rounded-xl text-primary-700 border-b border-primary-100">
  <div className="font-semibold text-base">Hello, {userName}</div>
</div>



                                            {/* App links for mobile on app host */}
                                            {isAppHost ? (
                                                <>
                                                    {profileType === 'employer' || profileType === 'household' ? (
                                                        <>
                                                            <Menu.Item>{({ active }) => (
                                                                <Link to="/household/profile" className={`${active ? 'bg-purple-100 text-purple-600' : 'text-gray-700'} flex items-center px-4 py-2 text-sm`}>
                                                                    <UserIcon className="mr-3 h-5 w-5" /> Profile
                                                                </Link>
                                                            )}</Menu.Item>
                                                            <Menu.Item>{({ active }) => (
                                                                <Link to="/household/employment" className={`${active ? 'bg-purple-100 text-purple-600' : 'text-gray-700'} flex items-center px-4 py-2 text-sm`}>
                                                                    Find Househelps
                                                                </Link>
                                                            )}</Menu.Item>
                                                            <Menu.Item>{({ active }) => (
                                                                <Link to="/household/employment?tab=shortlist" className={`${active ? 'bg-purple-100 text-purple-600' : 'text-gray-700'} flex items-center px-4 py-2 text-sm`}>
                                                                    Shortlist
                                                                </Link>
                                                            )}</Menu.Item>
                                                        </>
                                                    ) : profileType === 'househelp' ? (
                                                        <>
                                                            <Menu.Item>{({ active }) => (
                                                                <Link to="/househelp" className={`${active ? 'bg-purple-100 text-purple-600' : 'text-gray-700'} flex items-center px-4 py-2 text-sm`}>
                                                                    <UserIcon className="mr-3 h-5 w-5" /> Profile
                                                                </Link>
                                                            )}</Menu.Item>
                                                            <Menu.Item>{({ active }) => (
                                                                <Link to="/househelp/find-households" className={`${active ? 'bg-purple-100 text-purple-600' : 'text-gray-700'} flex items-center px-4 py-2 text-sm`}>
                                                                    Find Households
                                                                </Link>
                                                            )}</Menu.Item>
                                                        </>
                                                    ) : null}
                                                </>
                                            ) : (
                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <Link
                                                            to="/profile"
                                                            className={`${
                                                                active ? 'bg-purple-100 text-purple-600' : 'text-gray-700'
                                                            } flex items-center px-4 py-2 text-sm`}
                                                        >
                                                            <UserIcon className="mr-3 h-5 w-5" />
                                                            Profile
                                                        </Link>
                                                    )}
                                                </Menu.Item>
                                            )}
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
