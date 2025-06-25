import { Link, useLocation } from "@remix-run/react";
import React, { useEffect, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import { Bars3Icon, XMarkIcon, UserIcon, CogIcon, ArrowRightOnRectangleIcon, SunIcon, MoonIcon } from "@heroicons/react/20/solid";
import { useAuth } from "~/contexts/AuthContext";

const navigation = [
  { name: "Services", href: "/services" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

// Routes where login/signup buttons should be hidden when authenticated
const authenticatedRoutes = ['/dashboard', '/profile', '/settings', '/change-password'];

export function Navigation() {
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const [profileType, setProfileType] = useState<string | null>(null);

  // Memoized dashboard path based on profile type
  const dashboardPath = React.useMemo(() => {
    if (!profileType) return null;
    if (profileType === "household") return "/household";
    if (profileType === "househelp") return "/househelp";
    if (profileType === "bureau") return "/bureau";
    return null;
  }, [profileType]);

  // On mount and when user changes, parse localStorage.user_object
  useEffect(() => {
    if (user) {
      try {
        const obj = localStorage.getItem("user_object");
        if (obj) {
          const parsed = JSON.parse(obj);
          setProfileType(parsed.profile_type || null);
        } else {
          setProfileType(null);
        }
      } catch {
        setProfileType(null);
      }
    } else {
      setProfileType(null);
    }
  }, [user]);

  // Show auth buttons only if user is not logged in
  const showAuthButtons = !user;

  // If user exists but profileType is missing, fetch it from backend
  useEffect(() => {
    if (user && !profileType) {
      const fetchProfileType = async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) return;
          const res = await fetch("http://localhost:8080/api/v1/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) return;
          const data = await res.json();
          setProfileType(data.profile_type || null);
          // Optionally update localStorage for consistency
          const userObj = localStorage.getItem("user_object");
          if (userObj) {
            const parsed = JSON.parse(userObj);
            parsed.profile_type = data.profile_type;
            localStorage.setItem("user_object", JSON.stringify(parsed));
          }
        } catch {}
      };
      fetchProfileType();
    }
  }, [user, profileType]);

  useEffect(() => {
    // On mount, check localStorage for theme
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const newMode = !prev;
      if (newMode) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
      return newMode;
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
      setMobileMenuOpen(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="bg-white dark:bg-slate-900 py-4 shadow-sm border-b border-gray-100 dark:border-slate-800">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="text-primary-700 dark:text-primary-400 font-bold text-2xl hover:text-primary-800 dark:hover:text-primary-300 transition-colors duration-200">
            HomeXpert
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Dashboard link for authenticated users with profile_type (desktop) */}
            {user && dashboardPath && (
              <Link
                to={dashboardPath}
                className="text-purple-700 dark:text-purple-300 hover:text-purple-900 dark:hover:text-purple-100 transition-colors duration-200 font-semibold px-4 py-2 rounded-lg border-2 border-purple-200 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-600"
              >
                Dashboard
              </Link>
            )}
            {/* Auth Buttons - Only show when appropriate */}
            {showAuthButtons && (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-purple-700 dark:text-purple-300 hover:text-purple-900 dark:hover:text-purple-100 transition-colors duration-200 font-semibold px-4 py-2 rounded-lg border-2 border-purple-200 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-600"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-purple-600 dark:bg-purple-700 text-white px-6 py-2 rounded-lg border-2 border-purple-600 dark:border-purple-700 hover:bg-purple-700 dark:hover:bg-purple-600 hover:border-purple-700 dark:hover:border-purple-600 transition-colors duration-200 font-semibold shadow-sm hover:shadow-md"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* User info when authenticated */}
            {user && (

              <div className="flex items-center space-x-3">
                <div className="text-base text-gray-700 dark:text-gray-300 font-medium">
                  Welcome, {(user.first_name || user.user?.first_name) ?? 'User'}
                </div>
              </div>
            )}

            {/* Modern Menu Dropdown - Positioned at far right */}
            <Menu as="div" className="relative inline-block text-left">
              <div>
                <Menu.Button className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white dark:bg-slate-800 px-3 py-2 text-gray-700 dark:text-gray-300 shadow-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900">
                  <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                </Menu.Button>
              </div>

              <Transition
                as={React.Fragment}
                enter="transition ease-out duration-200"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-150"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 z-50 mt-3 w-64 origin-top-right rounded-2xl bg-white dark:bg-slate-800 shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-100 dark:border-slate-700">
                  <div className="py-2">
                    {/* Navigation Items */}
                    {navigation.map((item) => (
                      <Menu.Item key={item.name}>
                        {({ active }) => (
                          <Link
                            to={item.href}
                            className={`${
                              active 
                                ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300' 
                                : 'text-gray-700 dark:text-gray-300'
                            } flex items-center px-6 py-3 text-base font-medium hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-700 dark:hover:text-purple-300 transition-all duration-200`}
                          >
                            {item.name}
                          </Link>
                        )}
                      </Menu.Item>
                    ))}
                    
                    {/* Dark Mode Toggle */}
                    <div className="border-t border-gray-200 dark:border-slate-700 my-2"></div>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={toggleDarkMode}
                          className={`${
                            active 
                              ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300' 
                              : 'text-gray-700 dark:text-gray-300'
                          } flex items-center w-full px-6 py-3 text-base font-medium hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-700 dark:hover:text-purple-300 transition-all duration-200`}
                        >
                          {darkMode ? (
                            <SunIcon className="mr-3 h-5 w-5" />
                          ) : (
                            <MoonIcon className="mr-3 h-5 w-5" />
                          )}
                          {darkMode ? 'Light Mode' : 'Dark Mode'}
                        </button>
                      )}
                    </Menu.Item>
                    
                    {/* User-specific menu items */}
                    {user && (
                      <>
                        <div className="border-t border-gray-200 dark:border-slate-700 my-2"></div>
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/profile"
                              className={`${
                                active 
                                  ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300' 
                                  : 'text-gray-700 dark:text-gray-300'
                              } flex items-center px-6 py-3 text-base font-medium hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-700 dark:hover:text-purple-300 transition-all duration-200`}
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
                                active 
                                  ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300' 
                                  : 'text-gray-700 dark:text-gray-300'
                              } flex items-center px-6 py-3 text-base font-medium hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-700 dark:hover:text-purple-300 transition-all duration-200`}
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
                                active 
                                  ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300' 
                                  : 'text-gray-700 dark:text-gray-300'
                              } flex items-center w-full px-6 py-3 text-base font-medium hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 transition-all duration-200`}
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

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg border border-slate-300 dark:border-primary-400 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-primary-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <Transition
          show={mobileMenuOpen}
          as={React.Fragment}
          enter="transition ease-out duration-200"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-150"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <div className="md:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 mt-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="block px-4 py-3 rounded-xl text-base font-medium text-gray-700 dark:text-gray-300 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {/* Dashboard link for authenticated users with profile_type (mobile) */}
              {user && dashboardPath && (
                <Link
                  to={dashboardPath}
                  className="block px-4 py-3 rounded-xl text-base font-medium text-gray-700 dark:text-gray-300 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}

              {/* User-specific mobile menu items */}
              {user && (
                <>
                  <div className="border-t border-gray-200 dark:border-slate-700 my-2"></div>
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-3 rounded-xl text-base font-medium text-gray-700 dark:text-gray-300 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <UserIcon className="mr-3 h-5 w-5" />
                    Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center px-4 py-3 rounded-xl text-base font-medium text-gray-700 dark:text-gray-300 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <CogIcon className="mr-3 h-5 w-5" />
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-3 rounded-xl text-base font-medium text-gray-700 dark:text-gray-300 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                  >
                    <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
                    Logout
                  </button>
                </>
              )}

              {/* Auth buttons in mobile menu */}
              {showAuthButtons && (
                <div className="pt-4 pb-3 border-t border-gray-200 dark:border-slate-700">
                  <div className="flex flex-col space-y-3">
                    <Link
                      to="/login"
                      className="block px-4 py-3 rounded-xl text-base font-semibold text-purple-700 dark:text-purple-300 hover:text-purple-900 dark:hover:text-purple-100 border-2 border-purple-200 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-200 text-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      className="block px-4 py-3 rounded-xl text-base font-semibold bg-purple-600 dark:bg-purple-700 text-white hover:bg-purple-700 dark:hover:bg-purple-600 border-2 border-purple-600 dark:border-purple-700 hover:border-purple-700 dark:hover:border-purple-600 transition-all duration-200 text-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Transition>
      </div>
    </nav>
  );
}