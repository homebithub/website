import { Link } from "@remix-run/react";

const navigation = [
  { name: "Services", href: "/services" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export function Navigation() {
  return (
    <nav className="bg-white py-3">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="text-primary-700 font-bold text-2xl">
          HomeXpert
        </Link>
        <div className="flex space-x-8 items-center">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className="text-primary-700 hover:text-primary-900 transition-colors duration-200"
            >
              {item.name}
            </Link>
          ))}
          <Link
            to="/signup"
            className="bg-primary-700 text-white px-6 py-2 rounded-md hover:bg-primary-800 transition-colors duration-200 font-semibold"
          >
            Sign Up
          </Link>
          <button className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-colors duration-200">
            Contact Us —
          </button>
        </div>
      </div>
    </nav>
  );
}