import {Link, Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration, useLocation, useNavigate} from "@remix-run/react";
import React, {ReactNode, useEffect, useRef, useState} from "react";
import stylesheet from "~/tailwind.css";
import {LinksFunction} from "@remix-run/node";
import {BarsArrowDownIcon, BarsArrowUpIcon} from "@heroicons/react/24/outline";
import {FULL_HOST} from "./config";
import {FaFacebook, FaInstagram, FaTwitter} from "react-icons/fa";
import logo from './images/logo-dark.png';
import axios from "axios";
import { AuthProvider } from "~/contexts/AuthContext";

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
                <AuthProvider>
                    <Outlet/>
                </AuthProvider>
                <ScrollRestoration/>
                <Scripts/>
                <LiveReload/>
            </body>
        </html>
    );
}
 
