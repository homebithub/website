import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from "react-router";
import React from "react";
import type { Route } from "./+types/root";

import { AuthProvider } from "~/contexts/AuthContext";
import { ThemeProvider } from "~/contexts/ThemeContext";
import { ProfileEditorProvider } from "~/contexts/ProfileEditorContext";
import { WebSocketProvider } from "~/contexts/WebSocketContext";
import { SSEProvider } from "~/contexts/SSEContext";
import { DeviceRevocationWatcher } from "~/components/DeviceRevocationWatcher";
import { RouteProgress } from "~/components/RouteProgress";
import { PersistentNavigation } from "~/components/Navigation";
import { API_BASE_URL, NOTIFICATIONS_API_BASE_URL, NOTIFICATIONS_WS_BASE_URL } from '~/config/api';
import SupportChat from "~/components/support/SupportChat";
import { PWARegistration } from "~/components/PWARegistration";
import { PWAInstallPrompt } from "~/components/PWAInstallPrompt";
import { AppLaunchScreen } from "~/components/AppLaunchScreen";
import stylesheet from "./tailwind.css?url";

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
    { rel: "stylesheet", href: stylesheet },
    { rel: "canonical", href: "https://homebit.co.ke" },
    { rel: "manifest", href: "/manifest.webmanifest" },
    { rel: "apple-touch-startup-image", href: "/pwa/splash/splash-640x1136.png", media: "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)" },
    { rel: "apple-touch-startup-image", href: "/pwa/splash/splash-750x1334.png", media: "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" },
    { rel: "apple-touch-startup-image", href: "/pwa/splash/splash-828x1792.png", media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)" },
    { rel: "apple-touch-startup-image", href: "/pwa/splash/splash-1080x2340.png", media: "(device-width: 360px) and (device-height: 780px) and (-webkit-device-pixel-ratio: 3)" },
    { rel: "apple-touch-startup-image", href: "/pwa/splash/splash-1125x2436.png", media: "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)" },
    { rel: "apple-touch-startup-image", href: "/pwa/splash/splash-1170x2532.png", media: "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)" },
    { rel: "apple-touch-startup-image", href: "/pwa/splash/splash-1179x2556.png", media: "(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)" },
    { rel: "apple-touch-startup-image", href: "/pwa/splash/splash-1206x2622.png", media: "(device-width: 402px) and (device-height: 874px) and (-webkit-device-pixel-ratio: 3)" },
    { rel: "apple-touch-startup-image", href: "/pwa/splash/splash-1242x2688.png", media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)" },
    { rel: "apple-touch-startup-image", href: "/pwa/splash/splash-1260x2736.png", media: "(device-width: 420px) and (device-height: 912px) and (-webkit-device-pixel-ratio: 3)" },
    { rel: "apple-touch-startup-image", href: "/pwa/splash/splash-1284x2778.png", media: "(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)" },
    { rel: "apple-touch-startup-image", href: "/pwa/splash/splash-1290x2796.png", media: "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)" },
    { rel: "apple-touch-startup-image", href: "/pwa/splash/splash-1320x2868.png", media: "(device-width: 440px) and (device-height: 956px) and (-webkit-device-pixel-ratio: 3)" },
    { rel: "apple-touch-startup-image", href: "/pwa/splash/splash-1536x2048.png", media: "(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)" },
    { rel: "apple-touch-startup-image", href: "/pwa/splash/splash-1668x2224.png", media: "(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2)" },
    { rel: "apple-touch-startup-image", href: "/pwa/splash/splash-1668x2388.png", media: "(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)" },
    { rel: "apple-touch-startup-image", href: "/pwa/splash/splash-2048x2732.png", media: "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)" },
];

export const headers: Route.HeadersFunction = () => ({
    "Cache-Control": "no-cache, max-age=0, must-revalidate",
});

export function loader({ request }: Route.LoaderArgs) {
	const requestUrl = new URL(request.url);
	const requestHost = requestUrl.hostname.toLowerCase();
	const isLocalRequest = requestHost === "localhost" || requestHost === "127.0.0.1";
	const localGatewayBaseUrl = `${requestUrl.protocol}//${requestUrl.hostname}:3005`;
	const localAuthBaseUrl = `${requestUrl.protocol}//${requestUrl.hostname}:5004`;

	const gatewayBaseUrl = isLocalRequest ? localGatewayBaseUrl : API_BASE_URL;
	const authBaseUrl = isLocalRequest
		? localAuthBaseUrl
		: process.env.AUTH_API_BASE_URL || gatewayBaseUrl;
	const notificationsWsBaseUrl = isLocalRequest
		? `${localGatewayBaseUrl}/ws`
		: NOTIFICATIONS_WS_BASE_URL;
	const notificationsBaseUrl = isLocalRequest
		? localGatewayBaseUrl
		: process.env.NOTIFICATIONS_API_BASE_URL || NOTIFICATIONS_API_BASE_URL;

	return {
		ENV: {
			GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || "",
			GOOGLE_MAPS_MAP_ID: process.env.GOOGLE_MAPS_MAP_ID || "",
			GOOGLE_CLIENT_ID:
				process.env.GOOGLE_CLIENT_ID ||
				"180303040990-6ad3ap3mpgteebuh89ni6orqno9tecje.apps.googleusercontent.com",
			GATEWAY_API_BASE_URL: gatewayBaseUrl,
			AUTH_API_BASE_URL: authBaseUrl,
			NOTIFICATIONS_API_BASE_URL: notificationsBaseUrl,
			NOTIFICATIONS_WS_BASE_URL: notificationsWsBaseUrl,
			PAYMENTS_API_BASE_URL: gatewayBaseUrl,
			HOUSEHOLD_PROFILE_ID: process.env.HOUSEHOLD_PROFILE_ID || "",
			HOUSEHELP_PROFILE_ID: process.env.HOUSEHELP_PROFILE_ID || "",
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
    const apiOrigins = Array.from(new Set([
        ENV.GATEWAY_API_BASE_URL,
        ENV.AUTH_API_BASE_URL,
        ENV.NOTIFICATIONS_API_BASE_URL,
    ].filter(Boolean).map((value) => {
        try {
            return new URL(value).origin;
        } catch {
            return '';
        }
    }).filter(Boolean)));
    return (
        <html lang="en" className="h-full" suppressHydrationWarning>
            <head>
                <meta charSet="utf-8"/>
                <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/>
                <meta name="theme-color" content="#8b2be2" />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black" />
                <meta name="apple-mobile-web-app-title" content="Homebit" />
                <Meta/>
                <Links/>
                {/* Open the API connection while the browser parses the page.
                    Authenticated screens request it immediately after hydration,
                    so DNS/TCP/TLS should not sit on their critical path. */}
                {apiOrigins.map((origin) => (
                    <React.Fragment key={origin}>
                        <link rel="dns-prefetch" href={origin} />
                        <link rel="preconnect" href={origin} crossOrigin="anonymous" />
                    </React.Fragment>
                ))}
                <link rel="icon" type="image/x-icon" href="/favicon.ico" />
                <link rel="icon" href="/logos/logo-dark.png" type="image/png" sizes="32x32" media="(prefers-color-scheme: light)" />
                <link rel="icon" href="/logos/logo-light.png" type="image/png" sizes="32x32" media="(prefers-color-scheme: dark)" />
                <link rel="apple-touch-icon" href="/pwa/apple-touch-icon.png" sizes="180x180" />

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
                <AppLaunchScreen />
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
                                <ProfileEditorProvider>
                                    <RouteProgress/>
                                    <DeviceRevocationWatcher/>
                                    <PersistentNavigation/>
                                    <Outlet/>
                                    <SupportChat />
                                    <PWAInstallPrompt />
                                </ProfileEditorProvider>
                            </WebSocketProvider>
                        </SSEProvider>
                    </AuthProvider>
                </ThemeProvider>
                <ScrollRestoration/>
                <Scripts/>
                <PWARegistration />
            </body>
        </html>
    );
}
