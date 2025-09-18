import { Link, useNavigate } from "@remix-run/react";
import React, { useEffect, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import { Bars3Icon, UserIcon, CogIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/20/solid";
import { useAuth } from "~/contexts/AuthContext";
import { Waitlist } from "~/components/Waitlist";

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
    const navigate = useNavigate();

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

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    // Show auth buttons only if user is not logged in
    const showAuthButtons = !user;



    return (
        <nav className="bg-white py-4 shadow-sm">
            <div className="flex justify-between items-center px-8 sm:px-12 lg:px-24">
                {/* Logo */}
                <Link to="/" className="text-purple-600 font-bold text-2xl hover:text-purple-600 transition-colors duration-200">
                    HomeXpert
                </Link>

                {/* Navigation Links - Only show for non-authenticated users on larger screens */}
                {showAuthButtons && (
                    <div className="hidden lg:flex items-center space-x-4 ml-auto">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                className="link text-base font-bold transition-colors duration-200 px-4 py-2 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 text-slate-700 hover:text-purple-600"
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>
                )}

                {/* Right section */}
                <div className="flex items-center space-x-4 ml-6">
                    {showAuthButtons && (
                        <div className="flex items-center space-x-3">
                            {/*<button*/}
                            {/*    onClick={() => setIsWaitlistOpen(true)}*/}
                            {/*    className="link hidden lg:block text-lg font-bold rounded-lg transition-colors duration-200 px-4 py-2 text-gray-600 border-2 border-gray-300 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500"*/}
                            {/*>*/}
                            {/*    Join waitlist*/}
                            {/*</button>*/}
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
                            <Menu.Items className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                <div className="py-2">
                                    {/* Navigation Links - Show for all users in mobile menu */}
                                    {navigation.map((item) => (
                                        <Menu.Item key={item.name}>
                                            {({ active }) => (
                                                <Link
                                                    to={item.href}
                                                    className={`${
                                                        active ? 'bg-purple-100 text-purple-600' : 'text-gray-700'
                                                    } block px-4 py-2 text-sm`}
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
                                                        className={`lg:hidden w-full text-left ${
                                                            active ? 'bg-gray-100 text-gray-700' : 'text-gray-700'
                                                        } block px-4 py-2 text-sm`}
                                                    >
                                                        Join waitlist
                                                    </button>
                                                )}
                                            </Menu.Item>
                                            <Menu.Item>
                                                {({ active }) => (
                                                    <Link
                                                        to="/login"
                                                        className={`lg:hidden ${
                                                            active ? 'bg-purple-100 text-purple-600' : 'text-gray-700'
                                                        } block px-4 py-2 text-sm`}
                                                    >
                                                        Log in
                                                    </Link>
                                                )}
                                            </Menu.Item>
                                        </>
                                    )}

                                    {/* User Menu Items */}
                                    {user && (
                                        <>
                                            <div className="border-t border-gray-200 my-1"></div>
                                            {/* User Greeting in Mobile Menu */}
                                            <div className="px-4 py-2 text-sm text-gray-600 border-b border-gray-100">
                                                <div className="font-semibold text-base">Hello, {userName}</div>
                                            </div>



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
                onClose={() => setIsWaitlistOpen(false)}
            />
        </nav>
    );
}
