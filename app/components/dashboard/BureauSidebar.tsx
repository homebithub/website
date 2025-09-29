import React from "react";
import { Link, useLocation } from "@remix-run/react";

const menu = [
  { label: "Dashboard", to: "/bureau/home" },
  { label: "Profile", to: "/bureau/profile" },
  { label: "Househelps", to: "/bureau/househelps" },
  { label: "Commercials", to: "/bureau/commercials" },
];

export default function BureauSidebar() {
  const location = useLocation();
  return (
    <aside className="w-full sm:w-56 bg-white border-r border-gray-100 p-4 rounded-xl shadow-sm flex flex-col space-y-2">
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
