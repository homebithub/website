import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration, } from "@remix-run/react";
import React from "react";
import stylesheet from "~/tailwind.css";
import {LinksFunction} from "@remix-run/node";

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
            <body className="min-h-screen bg-gray-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans antialiased">
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

