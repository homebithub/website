import React from "react";
import { Link, useLocation } from "react-router";

const menu = [
  { label: "Household Profile", to: "/household/profile" },
  { label: "Employment", to: "/household/employment" },
];

export default function HouseholdSidebar() {
  const location = useLocation();
  return (
    <aside className="w-full sm:w-56 bg-white dark:bg-[#13131a] border-r border-gray-100 dark:border-purple-500/20 p-4 rounded-xl shadow-sm dark:shadow-glow-sm flex flex-col space-y-2 mt-2 transition-colors duration-300">
      {menu.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          prefetch="intent"
          className={`block px-4 py-1 rounded-xl text-base font-medium transition-all duration-150
            ${location.pathname === item.to
              ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-bold dark:shadow-glow-sm"
              : "text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400"}
          `}
        >
          {item.label}
        </Link>
      ))}
    </aside>
  );
}
