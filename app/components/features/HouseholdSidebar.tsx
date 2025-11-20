import React from "react";
import { Link, useLocation } from "react-router";
import { HomeIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

const menu = [
  { label: "My Profile", to: "/household/profile", icon: HomeIcon },
  { label: "Find Househelps", to: "/household/employment", icon: MagnifyingGlassIcon },
];

export default function HouseholdSidebar() {
  const location = useLocation();
  return (
    <aside className="w-full sm:w-56 bg-white dark:bg-[#13131a] border-r border-gray-100 dark:border-purple-500/20 p-4 rounded-xl shadow-sm dark:shadow-glow-sm flex flex-col space-y-2 mt-2 transition-colors duration-300">
      {menu.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            prefetch="intent"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-150
              ${isActive
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-lg dark:shadow-glow-sm"
                : "text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400"}
            `}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </aside>
  );
}
