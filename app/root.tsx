import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from "react-router";
import React from "react";
import type { Route } from "./+types/root";

import { AuthProvider } from "~/contexts/AuthContext";
import { ThemeProvider } from "~/contexts/ThemeContext";
import { ProfileSetupProvider } from "~/contexts/ProfileSetupContext";
import { ProfileSetupGuard } from "~/components/ProfileSetupGuard";
import { WebSocketProvider } from "~/contexts/WebSocketContext";
import { SSEProvider } from "~/contexts/SSEContext";
import { API_BASE_URL, NOTIFICATIONS_WS_BASE_URL } from '~/config/api';
import "./tailwind.css";

export const meta: Route.MetaFunction = () => [
    { title: "Homebit — Find Trusted Home Help in Kenya" },
    { name: "description", content: "Homebit connects Kenyan households with vetted, rated housekeepers, nannies, and home-service professionals. Browse profiles, compare prices, and hire with confidence." },
    { name: "keywords", content: "househelp Kenya, home services Nairobi, nanny Kenya, housekeeper, domestic worker, cleaning services, Homebit" },
    { name: "author", content: "Homebit" },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: "Homebit" },
    { property: "og:title", content: "Homebit — Find Trusted Home Help in Kenya" },
    { property: "og:description", content: "Connect with vetted, rated housekeepers, nannies, and home-service professionals across Kenya." },
    { property: "og:image", content: "https://homebit.co.ke/logo_512x512.png" },
    { property: "og:url", content: "https://homebit.co.ke" },
    { property: "og:locale", content: "en_KE" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Homebit — Find Trusted Home Help in Kenya" },
    { name: "twitter:description", content: "Connect with vetted, rated housekeepers, nannies, and home-service professionals across Kenya." },
    { name: "twitter:image", content: "https://homebit.co.ke/logo_512x512.png" },
];

export const links: Route.LinksFunction = () => [
    { rel: "canonical", href: "https://homebit.co.ke" },
];

export const headers: Route.HeadersFunction = () => ({
    "Cache-Control": "no-cache, max-age=0, must-revalidate",
});

export function loader({ request }: Route.LoaderArgs) {
	const requestUrl = new URL(request.url);
	const requestHost = requestUrl.hostname.toLowerCase();
	const isLocalRequest = requestHost === "localhost" || requestHost === "127.0.0.1";
	const localGatewayBaseUrl = `${requestUrl.protocol}//${requestUrl.hostname}:3005`;

	const gatewayBaseUrl = isLocalRequest ? localGatewayBaseUrl : API_BASE_URL;
	const notificationsWsBaseUrl = isLocalRequest
		? `${localGatewayBaseUrl}/ws`
		: NOTIFICATIONS_WS_BASE_URL;

	return {
		ENV: {
			GOOGLE_CLIENT_ID:
				process.env.GOOGLE_CLIENT_ID ||
				"180303040990-6ad3ap3mpgteebuh89ni6orqno9tecje.apps.googleusercontent.com",
			GATEWAY_API_BASE_URL: gatewayBaseUrl,
			AUTH_API_BASE_URL: gatewayBaseUrl,
			NOTIFICATIONS_API_BASE_URL: gatewayBaseUrl,
			NOTIFICATIONS_WS_BASE_URL: notificationsWsBaseUrl,
			PAYMENTS_API_BASE_URL: gatewayBaseUrl,
		},
	};
}

// Add action handler to prevent "no action" errors from external POST requests
export async function action() {
	// Return 405 Method Not Allowed for unsupported actions
	return new Response("Method Not Allowed", { status: 405 });
}

export default function App() {
    const { ENV } = useLoaderData<typeof loader>() || { ENV: { GOOGLE_CLIENT_ID: "", GATEWAY_API_BASE_URL: "" } };
    return (
        <html lang="en" className="h-full" suppressHydrationWarning>
            <head>
                <meta charSet="utf-8"/>
                <meta name="viewport" content="width=device-width, initial-scale=1"/>
                <Meta/>
                <Links/>
                {/* Google Identity Services */}
                <script src="https://accounts.google.com/gsi/client" async defer></script>
                <link rel="icon" type="image/x-icon" href="/favicon.ico" />
                <link rel="icon" href="/logos/logo-dark.png" type="image/png" sizes="32x32" media="(prefers-color-scheme: light)" />
                <link rel="icon" href="/logos/logo-light.png" type="image/png" sizes="32x32" media="(prefers-color-scheme: dark)" />
                <link rel="apple-touch-icon" href="/logos/logo-dark.png" />
                <link rel="apple-touch-icon" href="/logos/logo-light.png" sizes="180x180" />

                {/* Global font: Plus Jakarta Sans (thinner, modern sans) */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                  href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap"
                  rel="stylesheet"
                />
                {/* Structured data: Organization + WebSite */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@graph": [
                                {
                                    "@type": "Organization",
                                    "@id": "https://homebit.co.ke/#organization",
                                    "name": "Homebit",
                                    "url": "https://homebit.co.ke",
                                    "logo": {
                                        "@type": "ImageObject",
                                        "url": "https://homebit.co.ke/logo_512x512.png",
                                        "width": 512,
                                        "height": 512
                                    },
                                    "description": "Homebit connects Kenyan households with vetted, rated housekeepers, nannies, and home-service professionals.",
                                    "areaServed": {
                                        "@type": "Country",
                                        "name": "Kenya"
                                    },
                                    "sameAs": [
                                        "https://web.facebook.com/profile.php?id=61582801828384",
                                        "https://www.instagram.com/homebithub/",
                                        "https://x.com/homebithub",
                                        "https://www.linkedin.com/company/homebithub"
                                    ]
                                },
                                {
                                    "@type": "WebSite",
                                    "@id": "https://homebit.co.ke/#website",
                                    "url": "https://homebit.co.ke",
                                    "name": "Homebit",
                                    "publisher": { "@id": "https://homebit.co.ke/#organization" }
                                }
                            ]
                        })
                    }}
                />
                <title>Homebit</title>
            </head>
            <body className="min-h-screen bg-white dark:bg-[#0a0a0f] text-slate-900 dark:text-[#e4e4e7] font-sans antialiased transition-colors duration-300" suppressHydrationWarning>
                {/* Blocking script to prevent theme flash - must be in body, not head (head scripts break React Router CSS injection) */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `(function(){try{var t=localStorage.getItem('theme')||'dark';if(t==='dark'){document.documentElement.classList.add('dark')}else{document.documentElement.classList.remove('dark')}}catch(e){document.documentElement.classList.add('dark')}})()`,
                    }}
                />
                {/* Expose server env to client */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `window.ENV=${JSON.stringify(ENV)}`,
                    }}
                />
                <ThemeProvider>
                    <AuthProvider>
                        <SSEProvider>
                            <WebSocketProvider>
                                <ProfileSetupProvider>
                                    <ProfileSetupGuard>
                                        <Outlet/>
                                    </ProfileSetupGuard>
                                </ProfileSetupProvider>
                            </WebSocketProvider>
                        </SSEProvider>
                    </AuthProvider>
                </ThemeProvider>
                <ScrollRestoration/>
                <Scripts/>
            </body>
        </html>
    );
}
