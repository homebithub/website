import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from "@remix-run/react";
import React from "react";
import { cssBundleHref } from "@remix-run/css-bundle";
import stylesheet from "~/tailwind.css";
import glowCardStyles from "~/styles/glow-card.css";
import { json, type LinksFunction, type HeadersFunction } from "@remix-run/node";

import { AuthProvider } from "~/contexts/AuthContext";

export const links: LinksFunction = () => [
    ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] as const : []),
    { rel: "stylesheet", href: stylesheet },
    { rel: "stylesheet", href: glowCardStyles },
];

export const headers: HeadersFunction = () => ({
    "Cache-Control": "no-store",
});

export function loader() {
    return json({
        ENV: {
            GOOGLE_CLIENT_ID:
                process.env.GOOGLE_CLIENT_ID ||
                "562184165636-klkgj2b74194819lgh5netj4s2e343o2.apps.googleusercontent.com",
            AUTH_API_BASE_URL: process.env.AUTH_API_BASE_URL || "https://api.homexpert.co.ke/auth",
        },
    });
}

export default function App() {
    const { ENV } = useLoaderData<typeof loader>();
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
            <body className="min-h-screen bg-white text-slate-900 font-sans antialiased">
                <AuthProvider>
                    <Outlet/>
                </AuthProvider>
                <ScrollRestoration/>
                {/* Expose server env to client */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `window.ENV = ${JSON.stringify(ENV)}`,
                    }}
                />
                <Scripts/>
                <LiveReload/>
            </body>
        </html>
    );
}



