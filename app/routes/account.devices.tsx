import { Link } from "react-router";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { PurpleThemeWrapper } from "~/components/layout/PurpleThemeWrapper";
import { PurpleCard } from "~/components/ui/PurpleCard";

export const meta = () => [
  { title: "Devices - Homebit" },
  { name: "description", content: "Device management is currently disabled." },
];

export default function DevicesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <PurpleThemeWrapper variant="light" bubbles={false} className="flex-1">
        <main className="max-w-3xl mx-auto px-4 py-12">
          <PurpleCard hover={false} glow={true} className="p-8 sm:p-10 text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Device management is disabled
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              HomeBit is not using frontend device approval right now. You can manage your account from settings.
            </p>
            <Link
              to="/settings"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-base shadow-lg hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              Back to Settings
            </Link>
          </PurpleCard>
        </main>
      </PurpleThemeWrapper>
      <Footer />
    </div>
  );
}
