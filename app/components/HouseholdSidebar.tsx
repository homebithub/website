import React from "react";
import { Link, useLocation } from "@remix-run/react";

const menu = [
  { label: "Household Profile", to: "/household/profile" },
  { label: "Employment", to: "/household/employment" },
];

export default function HouseholdSidebar() {
  const location = useLocation();
  return (
    <aside className="w-full sm:w-56 bg-white border-r border-gray-100 p-4 rounded-xl shadow-sm flex flex-col space-y-2 mt-2">
      {menu.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className={`block px-4 py-2 rounded-lg text-base font-medium transition-colors duration-150
            ${location.pathname === item.to
              ? "bg-purple-100 text-purple-600 font-bold"
              : "text-gray-700 hover:bg-purple-50 hover:text-purple-600"}
          `}
        >
          {item.label}
        </Link>
      ))}
    </aside>
  );
}
