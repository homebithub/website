import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from "react-router";
import React from "react";
import type { Route } from "./+types/root";

import { AuthProvider } from "~/contexts/AuthContext";
import { ThemeProvider } from "~/contexts/ThemeContext";
import { ProfileSetupProvider } from "~/contexts/ProfileSetupContext";
import { ProfileSetupGuard } from "~/components/ProfileSetupGuard";
import { WebSocketProvider } from "~/contexts/WebSocketContext";
import { AUTH_API_BASE_URL, NOTIFICATIONS_API_BASE_URL, NOTIFICATIONS_WS_BASE_URL, PAYMENTS_API_BASE_URL } from '~/config/api';
import "./tailwind.css";

export const links: Route.LinksFunction = () => [];

export const headers: Route.HeadersFunction = () => ({
    "Cache-Control": "no-store",
});

export function loader() {
	return {
		ENV: {
			GOOGLE_CLIENT_ID:
				process.env.GOOGLE_CLIENT_ID ||
				"180303040990-6ad3ap3mpgteebuh89ni6orqno9tecje.apps.googleusercontent.com",
			// Use canonical API base URLs from config so they are consistently normalized
			GATEWAY_API_BASE_URL: process.env.GATEWAY_API_BASE_URL || AUTH_API_BASE_URL,
			AUTH_API_BASE_URL: AUTH_API_BASE_URL,
			NOTIFICATIONS_API_BASE_URL: NOTIFICATIONS_API_BASE_URL,
			NOTIFICATIONS_WS_BASE_URL: process.env.NOTIFICATIONS_WS_BASE_URL || NOTIFICATIONS_WS_BASE_URL,
			PAYMENTS_API_BASE_URL: PAYMENTS_API_BASE_URL,
		},
	};
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
                {/* Blocking script to prevent theme flash - runs before React hydrates */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            (function() {
                                try {
                                    // Check localStorage for saved theme
                                    const savedTheme = localStorage.getItem('theme');
                                    
                                    // Default to dark theme if no preference exists
                                    const theme = savedTheme || 'dark';
                                    
                                    // Apply theme immediately
                                    if (theme === 'dark') {
                                        document.documentElement.classList.add('dark');
                                    } else {
                                        document.documentElement.classList.remove('dark');
                                    }
                                } catch (e) {
                                    // Fallback to dark theme on error
                                    document.documentElement.classList.add('dark');
                                }
                            })();
                        `,
                    }}
                />
                {/* Expose server env to client - in head to prevent visual flash */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `window.ENV=${JSON.stringify(ENV)}`,
                    }}
                />
                {/* Google Identity Services */}
                <script src="https://accounts.google.com/gsi/client" async defer></script>
                <link rel="icon" href="/favicon.ico" />
                <link rel="icon" href="/logo_512x512.png" type="image/png" sizes="32x32" />
                <link rel="icon" href="/logo_512x512.png" type="image/png" sizes="16x16" />
                <link rel="apple-touch-icon" href="/logo_512x512.png" sizes="180x180" />

                {/* Global font: Plus Jakarta Sans (thinner, modern sans) */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                  href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap"
                  rel="stylesheet"
                />
                <title>Homebit</title>
            </head>
            <body className="min-h-screen bg-white dark:bg-[#0a0a0f] text-slate-900 dark:text-[#e4e4e7] font-sans antialiased transition-colors duration-300" suppressHydrationWarning>
                <ThemeProvider>
                    <AuthProvider>
                        <WebSocketProvider>
                            <ProfileSetupProvider>
                                <ProfileSetupGuard>
                                    <Outlet/>
                                </ProfileSetupGuard>
                            </ProfileSetupProvider>
                        </WebSocketProvider>
                    </AuthProvider>
                </ThemeProvider>
                <ScrollRestoration/>
                <Scripts/>
            </body>
        </html>
    );
}

