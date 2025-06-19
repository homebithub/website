import { Link } from "@remix-run/react";
import React, { useEffect, useState } from "react";

const navigation = [
  { name: "Services", href: "/services" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export function Navigation() {
  const [darkMode, setDarkMode] = useState(false);

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

  return (
    <nav className="bg-white dark:bg-slate-900 py-3">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="text-primary-700 dark:text-yellow-400 font-bold text-2xl">
          HomeXpert
        </Link>
        <div className="flex space-x-8 items-center">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className="text-primary-700 dark:text-yellow-300 hover:text-primary-900 dark:hover:text-yellow-400 transition-colors duration-200"
            >
              {item.name}
            </Link>
          ))}
          <Link
            to="/signup"
            className="bg-primary-700 dark:bg-yellow-400 text-white dark:text-slate-900 px-6 py-2 rounded-md hover:bg-primary-800 dark:hover:bg-yellow-500 transition-colors duration-200 font-semibold"
          >
            Sign Up
          </Link>
          <button className="bg-primary-600 dark:bg-yellow-500 text-white dark:text-slate-900 px-6 py-2 rounded-md hover:bg-primary-700 dark:hover:bg-yellow-400 transition-colors duration-200">
            Contact Us —
          </button>
          <button
            onClick={toggleDarkMode}
            className="ml-4 px-3 py-2 rounded-md border border-slate-300 dark:border-yellow-400 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-yellow-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200"
            aria-label="Toggle dark mode"
          >
            {darkMode ? "🌙 Dark" : "☀️ Light"}
          </button>
        </div>
      </div>
    </nav>
  );
}