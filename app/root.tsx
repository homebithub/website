import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration, } from "@remix-run/react";
import React from "react";
import { cssBundleHref } from "@remix-run/css-bundle";
import stylesheet from "~/tailwind.css";
import glowCardStyles from "~/styles/glow-card.css";
import type {LinksFunction} from "@remix-run/node";

import { AuthProvider } from "~/contexts/AuthContext";

export const links: LinksFunction = () => [
    ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] as const : []),
    { rel: "stylesheet", href: stylesheet },
    { rel: "stylesheet", href: glowCardStyles },
];

export default function App() {
    return (
        <html lang="en" className="h-full">
            <head>
                <meta charSet="utf-8"/>
                <meta name="viewport" content="width=device-width, initial-scale=1"/>
                <Meta/>
                <Links/>
                <link rel="icon" href="/favicon.ico" />
                <link rel="icon" href="/logo_512x512.png" type="image/png" sizes="32x32" />
                <link rel="icon" href="/logo_512x512.png" type="image/png" sizes="16x16" />
                <link rel="apple-touch-icon" href="/logo_512x512.png" sizes="180x180" />
                <title>HomeXpert</title>
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

