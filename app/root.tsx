import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration, } from "@remix-run/react";
import React from "react";
import stylesheet from "~/tailwind.css";
import glowCardStyles from "~/styles/glow-card.css";
import {LinksFunction} from "@remix-run/node";

import { AuthProvider } from "~/contexts/AuthContext";

export const links: LinksFunction = () => [
    {rel: "stylesheet", href: stylesheet},
    {rel: "stylesheet", href: glowCardStyles},
];

export default function App() {
    return (
        <html lang="en" className="h-full dark">
            <head>
                <meta charSet="utf-8"/>
                <meta name="viewport" content="width=device-width, initial-scale=1"/>
                <Meta/>
                <Links/>
                <link rel="icon" href="/favicon.ico" type="image/x-icon" />
                <title>homexpert</title>
            </head>
            <body className="min-h-screen bg-slate-950 text-slate-50 font-sans antialiased dark">
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

