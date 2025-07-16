import { Link } from "@remix-run/react";
import React, { useEffect, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import { Bars3Icon, UserIcon, CogIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/20/solid";
import { useAuth } from "~/contexts/AuthContext";

const navigation = [
  { name: "Services", href: "/services" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
  { name: "Pricing", href: "/pricing" },
];

export function Navigation() {
  const { user, logout } = useAuth();
  const [profileType, setProfileType] = useState<string | null>(null);

  // Memoized dashboard path based on profile type
  const dashboardPath = React.useMemo(() => {
    if (!profileType) return null;
    if (profileType === "employer") return "/household";
    if (profileType === "househelp") return "/househelp";
    if (profileType === "bureau") return "/bureau";
    return null;
  }, [profileType]);

  // Parse user profile type from localStorage
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
    <nav className="bg-slate-900 py-4 shadow-sm">
      <div className="flex justify-between items-center px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="text-primary-400 font-bold text-2xl hover:text-primary-300 transition-colors duration-200">
          HomeXpert
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-6">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className="link text-lg font-bold transition-colors duration-200 px-4 py-2 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 text-primary-400 hover:text-primary-100"
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-4">
          {showAuthButtons && (
            <div className="flex items-center space-x-3">
              <Link
                to="/login"
                className="link hidden md:block text-lg font-bold rounded-lg transition-colors duration-200 px-4 py-2 text-primary-400 hover:text-primary-100"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="px-6 py-3 text-lg rounded-xl bg-primary-700 text-white hover:bg-primary-600 transition-colors duration-200 font-bold shadow-md hover:shadow-lg"
              >
                Sign up
              </Link>
            </div>
          )}

          {/* Menu Dropdown */}
          <Menu as="div" className="relative inline-block text-left">
            <Menu.Button className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-slate-800 p-2 text-gray-300 shadow-sm border border-slate-700 hover:bg-slate-700 transition-all duration-200">
              <Bars3Icon className="h-5 w-5" />
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
              <Menu.Items className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-xl bg-slate-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-2">
                  {/* Navigation Links */}
                  {navigation.map((item) => (
                    <Menu.Item key={item.name}>
                      {({ active }) => (
                        <Link
                          to={item.href}
                          className={`${
                            active ? 'bg-purple-900/20 text-purple-300' : 'text-gray-300'
                          } block px-4 py-2 text-sm`}
                        >
                          {item.name}
                        </Link>
                      )}
                    </Menu.Item>
                  ))}
                    
                  {/* Mobile Login */}
                  {showAuthButtons && (
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/login"
                          className={`md:hidden ${
                            active ? 'bg-purple-900/20 text-purple-300' : 'text-gray-300'
                          } block px-4 py-2 text-sm`}
                        >
                          Log in
                        </Link>
                      )}
                    </Menu.Item>
                  )}

                  {/* User Menu Items */}
                  {user && (
                    <>
                      <div className="border-t border-slate-700 my-1"></div>
                      {dashboardPath && (
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to={dashboardPath}
                              className={`${
                                active ? 'bg-purple-900/20 text-purple-300' : 'text-gray-300'
                              } block px-4 py-2 text-sm`}
                            >
                              Dashboard
                            </Link>
                          )}
                        </Menu.Item>
                      )}
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/profile"
                            className={`${
                              active ? 'bg-purple-900/20 text-purple-300' : 'text-gray-300'
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
                              active ? 'bg-purple-900/20 text-purple-300' : 'text-gray-300'
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
                              active ? 'bg-red-900/20 text-red-300' : 'text-gray-300'
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
    </nav>
  );
}
