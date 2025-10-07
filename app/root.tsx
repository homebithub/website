import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData, data } from "react-router";
import React from "react";
import type { Route } from "./+types/root";

import { AuthProvider } from "~/contexts/AuthContext";
import { ThemeProvider } from "~/contexts/ThemeContext";
import { API_BASE_URL } from '~/config/api';
import "./tailwind.css";

export const links: Route.LinksFunction = () => [];

export const headers: Route.HeadersFunction = () => ({
    "Cache-Control": "no-store",
});

export function loader() {
    return data({
        ENV: {
            GOOGLE_CLIENT_ID:
                process.env.GOOGLE_CLIENT_ID ||
                "562184165636-klkgj2b74194819lgh5netj4s2e343o2.apps.googleusercontent.com",
            API_BASE_URL: process.env.API_BASE_URL || "https://api.homexpert.co.ke",
            AUTH_API_BASE_URL: process.env.AUTH_API_BASE_URL || "https://api.homexpert.co.ke/auth",
        },
    });
}

export default function App() {
    const { ENV } = useLoaderData<typeof loader>() || { ENV: { GOOGLE_CLIENT_ID: "", AUTH_API_BASE_URL: "" } };
    return (
        <html lang="en" className="h-full">
            <head>
                <meta charSet="utf-8"/>
                <meta name="viewport" content="width=device-width, initial-scale=1"/>
                <Meta/>
                <Links/>
                {/* Google Identity Services */}
                <script src="https://accounts.google.com/gsi/client" async defer></script>
                <link rel="icon" href="/favicon.ico" />
                <link rel="icon" href="/logo_512x512.png" type="image/png" sizes="32x32" />
                <link rel="icon" href="/logo_512x512.png" type="image/png" sizes="16x16" />
                <link rel="apple-touch-icon" href="/logo_512x512.png" sizes="180x180" />
                <title>HomeXpert</title>
            </head>
            <body className="min-h-screen bg-white dark:bg-[#0a0a0f] text-slate-900 dark:text-[#e4e4e7] font-sans antialiased transition-colors duration-300">
                <ThemeProvider>
                    <AuthProvider>
                        <Outlet/>
                    </AuthProvider>
                </ThemeProvider>
                <ScrollRestoration/>
                {/* Expose server env to client */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `window.ENV = ${JSON.stringify(ENV)}`,
                    }}
                />
                <Scripts/>
            </body>
        </html>
    );
}



