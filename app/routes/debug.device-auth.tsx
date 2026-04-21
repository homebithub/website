import { useEffect } from "react";
import { useNavigate } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { PurpleThemeWrapper } from "~/components/layout/PurpleThemeWrapper";
import { Button } from "~/components/ui/Button";
import { cacheAuthSession } from "~/utils/authStorage";
import { serializeCookie, TOKEN_COOKIE_NAME, cookieOptions } from "~/utils/cookie";

const DEBUG_USER = {
  id: "debug-user-123",
  user_id: "debug-user-123",
  email: "security-debugger@homebit.local",
  first_name: "Security",
  last_name: "Tester",
  profile_type: "debug",
  is_verified: true,
};

const DEBUG_TOKEN = "debug-token";

export async function loader({ request }: LoaderFunctionArgs) {
  if (process.env.NODE_ENV === "production") {
    throw new Response("Not found", { status: 404 });
  }

  const headers = new Headers();
  headers.append("Set-Cookie", serializeCookie(TOKEN_COOKIE_NAME, DEBUG_TOKEN, cookieOptions));
  headers.append(
    "Set-Cookie",
    serializeCookie(
      "hb_user",
      JSON.stringify(DEBUG_USER),
      cookieOptions,
    ),
  );

  return Response.json({ baseUrl: new URL(request.url).origin }, { headers });
}

export default function DebugDeviceAuthPage() {
  const navigate = useNavigate();

  useEffect(() => {
    cacheAuthSession({ token: DEBUG_TOKEN, user: DEBUG_USER, provider: "debug" });
  }, []);

  const triggerMockEvent = () => {
    const payload = {
      event_type: "auth.device.pending_confirmation",
      data: {
        device_id: "device-debug-01",
        device_name: "MacBook Pro Debug",
        device_type: "desktop",
        browser: "Playwright",
        os: "DebugOS",
        ip_address: "203.0.113.42",
        country: "Kenya",
        city: "Nairobi",
        confirmation_token: "mock-confirm-token",
        confirmation_url: "/devices/confirm?token=mock-confirm-token",
      },
    };

    window.__HOME_BIT_SSE_DEBUG__?.({ ...payload.data, event_type: payload.event_type });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <PurpleThemeWrapper variant="light" bubbles={false} bubbleDensity="low" className="flex-1">
        <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12 space-y-8">
          <section>
            <h1 className="text-2xl font-bold text-purple-700 dark:text-purple-200 mb-2">
              Device Authentication SSE Debugger
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              This page helps debug the real-time pending device approval banner. Trigger an event to simulate the
              notifications service emitting <code>auth.device.pending_confirmation</code>.
            </p>
          </section>

          <div className="rounded-3xl border border-purple-200/60 dark:border-purple-500/30 bg-white/90 dark:bg-[#12121c]/90 backdrop-blur-xl shadow-lg p-6 space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Simulate SSE Event</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  You must run the gateway locally (default <code>http://localhost:3005</code>) before executing the
                  Playwright test.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  onClick={triggerMockEvent}
                  data-testid="trigger-device-approval"
                >
                  Trigger pending approval
                </Button>
                <Button variant="ghost" onClick={() => navigate("/")}>Back home</Button>
              </div>
            </div>

            <div className="rounded-2xl border border-purple-100/70 dark:border-purple-500/30 bg-purple-50/60 dark:bg-purple-900/20 px-4 py-3 text-xs text-purple-700 dark:text-purple-200">
              <p className="font-semibold mb-1">Heads up</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  The debug route is only available when <code>NODE_ENV</code> is <code>development</code> or <code>test</code>.
                </li>
                <li>
                  <code>window.__HOME_BIT_SSE_DEBUG__</code> injects directly into the SSE hub for deterministic testing.
                </li>
              </ul>
            </div>
          </div>
        </main>
      </PurpleThemeWrapper>
      <Footer />
    </div>
  );
}
