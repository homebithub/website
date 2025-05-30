import {Link, Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration, useLocation, useNavigate} from "@remix-run/react";
import React, {ReactNode, useEffect, useRef, useState} from "react";
import stylesheet from "~/tailwind.css";
import {LinksFunction} from "@remix-run/node";
import {BarsArrowDownIcon, BarsArrowUpIcon} from "@heroicons/react/24/outline";
import {FULL_HOST} from "./config";
import {FaFacebook, FaInstagram, FaTwitter} from "react-icons/fa";
import logo from './images/logo-dark.png';
import axios from "axios";

export const links: LinksFunction = () => [
    {rel: "stylesheet", href: stylesheet},
];

export default function App() {
    return (
        <html lang="en" className="h-full">
            <head>
                <meta charSet="utf-8"/>
                <meta name="viewport" content="width=device-width, initial-scale=1"/>
                <Meta/>
                <Links/>
                <link rel="icon" href="/favicon.ico" type="image/x-icon" />
                <title>homexpert</title>
            </head>
            <body className="min-h-screen bg-white text-slate-900 font-sans antialiased">
                <Outlet/>
                <ScrollRestoration/>
                <Scripts/>
                <LiveReload/>
            </body>
        </html>
    );
}

const UserDropdown = ({
                          full_name,
                          username,
                          setFullName,
                          setUsername,
                      }: {
    full_name: string | "";
    username: string | "";
    setFullName: React.Dispatch<React.SetStateAction<string>>;
    setUsername: React.Dispatch<React.SetStateAction<string>>;
}) => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    const toggleDropdown = () => setIsOpen(!isOpen);

    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const removePlayer = async () => {
        const storedJwt = window.localStorage.getItem("jwt");
        const playerId = window.localStorage.getItem("playerId");
        if (playerId) {
            try {
                await axios.post(
                    `${FULL_HOST}/homexpert/players/update_status`,
                    {player_id: playerId, status: "dnf"},
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: storedJwt,
                        },
                    }
                );
            } catch (error) {
                console.error(error);
            }
        }
    };

    const handleLogout = () => {
        window.localStorage.clear();
        setFullName("");
        setUsername("");
        removePlayer();
        navigate("/login");
    };

    const handleLogoutUsername = () => {
        window.localStorage.removeItem("username");
        window.localStorage.removeItem("playerId");
        setUsername("");
        removePlayer();
        window.location.href = "/";
    };

    return (
        <div className="relative inline-block text-left"
             ref={dropdownRef}>
            <button
                onClick={toggleDropdown}
                className=" px-6 py-1 rounded flex items-center font-semibold space-x-1 focus:outline-none"
            >
                {username || full_name}
                <svg
                    className={`-mr-1 ml-2 h-5 w-5 transform transition-transform ${
                        isOpen ? "rotate-180" : ""
                    }`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                    />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                    <ul className="flex flex-col text-black">
                        {username && (
                            <li className="px-4 py-2 hover:bg-yellow-400 cursor-pointer">
                                <button onClick={handleLogoutUsername}>
                                    Remove ({username})
                                </button>
                            </li>
                        )}
                        {full_name && (
                            <li className="px-4 py-2 hover:bg-yellow-400 cursor-pointer">
                                <button onClick={handleLogout}>Logout</button>
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export const btnLinkClass = "text-primary-700 px-4 py-2 hover:text-primary-900 hover:bg-primary-100 rounded-lg transition-colors duration-200 font-semibold";
export const btnLinkClass2 = "text-primary-600 px-4 py-2 hover:text-primary-800 hover:bg-primary-50 rounded-lg transition-colors duration-200 font-semibold" +
    " underline-offset-8";


