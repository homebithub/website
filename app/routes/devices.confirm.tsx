import { Link } from "react-router";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { PurpleThemeWrapper } from "~/components/layout/PurpleThemeWrapper";
import { PurpleCard } from "~/components/ui/PurpleCard";

export const meta = () => [
  { title: "Device Confirmation Disabled - Homebit" },
  { name: "description", content: "Device confirmation is not required for Homebit sign in." },
];

export default function DeviceConfirmPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <PurpleThemeWrapper variant="light" bubbles={false} className="flex-1">
        <main className="flex-1 flex flex-col justify-center items-center px-4 py-8">
          <PurpleCard hover={false} glow={true} className="w-full max-w-md p-8 sm:p-10 text-center">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Device confirmation is disabled
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              You can continue signing in without confirming this device.
            </p>
            <Link
              to="/login"
              className="inline-flex w-full items-center justify-center px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-base shadow-lg hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              Continue to Login
            </Link>
          </PurpleCard>
        </main>
      </PurpleThemeWrapper>
      <Footer />
    </div>
  );
}
