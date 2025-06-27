import React from "react";
import { Link, useLocation } from "@remix-run/react";

const menu = [
  { label: "Household Profile", to: "/household/profile" },
  { label: "Employment", to: "/household/employment" },
];

export default function HouseholdSidebar() {
  const location = useLocation();
  return (
    <aside className="w-full sm:w-56 bg-white dark:bg-slate-800 border-r border-gray-100 dark:border-slate-700 p-4 rounded-xl shadow-sm flex flex-col space-y-2">
      {menu.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className={`block px-4 py-2 rounded-lg text-base font-medium transition-colors duration-150
            ${location.pathname === item.to
              ? "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-200 font-bold"
              : "text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-700 dark:hover:text-purple-200"}
          `}
        >
          {item.label}
        </Link>
      ))}
    </aside>
  );
}
