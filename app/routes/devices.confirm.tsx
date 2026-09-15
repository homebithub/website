import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { AlertTriangle, CheckCircle2, LoaderCircle, ShieldCheck } from "lucide-react";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { PurpleThemeWrapper } from "~/components/layout/PurpleThemeWrapper";
import { PurpleCard } from "~/components/ui/PurpleCard";
import { deviceService } from "~/services/grpc/device.service";

export const meta = () => [
  { title: "Confirm Device - HomeBit" },
  { name: "description", content: "Confirm a new trusted device for your HomeBit account." },
];

export default function DeviceConfirmPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [state, setState] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Confirming this device...");

  useEffect(() => {
    if (!token) {
      setState("error");
      setMessage("This confirmation link is missing its security token.");
      return;
    }
    let cancelled = false;
    deviceService
      .confirmDevice(token)
      .then((response) => {
        if (!cancelled) {
          setState("success");
          setMessage(response.message || "This device is now trusted.");
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setState("error");
          setMessage(
            error instanceof Error
              ? error.message
              : "This confirmation link is invalid or has expired.",
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />
      <PurpleThemeWrapper variant="light" bubbles={false} className="flex-1">
        <main className="flex flex-1 items-center justify-center px-4 py-10">
          <PurpleCard hover={false} glow className="w-full max-w-md p-8 text-center sm:p-10">
            <div
              className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl ${
                state === "success"
                  ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300"
                  : state === "error"
                    ? "bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-300"
                    : "bg-purple-100 text-purple-600 dark:bg-purple-500/15 dark:text-purple-300"
              }`}
            >
              {state === "loading" ? (
                <LoaderCircle className="h-8 w-8 animate-spin" />
              ) : state === "success" ? (
                <CheckCircle2 className="h-8 w-8" />
              ) : (
                <AlertTriangle className="h-8 w-8" />
              )}
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {state === "loading"
                ? "Confirming device"
                : state === "success"
                  ? "Device confirmed"
                  : "Confirmation failed"}
            </h1>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">{message}</p>
            <div className="mt-7 space-y-3">
              <Link
                to={state === "success" ? "/account/devices" : "/login"}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:from-purple-700 hover:to-pink-700"
              >
                <ShieldCheck className="h-4 w-4" />
                {state === "success" ? "Review trusted devices" : "Return to login"}
              </Link>
              {state === "error" && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Sign in again to request a fresh device confirmation.
                </p>
              )}
            </div>
          </PurpleCard>
        </main>
      </PurpleThemeWrapper>
      <Footer />
    </div>
  );
}

export { ErrorBoundary } from "~/components/ErrorBoundary";
