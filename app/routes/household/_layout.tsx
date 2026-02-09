import {Outlet, useLocation, useNavigate} from "react-router";
import { Navigation } from "~/components/Navigation";
import HouseholdSidebar from "~/components/features/HouseholdSidebar";
import {useEffect, useState} from "react";
import OnboardingTipsBanner from "~/components/OnboardingTipsBanner";
import { fetchPreferences } from "~/utils/preferencesApi";

export default function HouseholdDashboard() {

    const navigate = useNavigate();
    const location = useLocation();
    const [showTips, setShowTips] = useState(false);

    // Redirect /household to /household/profile by default
    useEffect(() => {
        if (location.pathname === "/household") {
            navigate("/household/profile", { replace: true });
        }
    }, [location, navigate]);

    // Load onboarding preference once on mount
    useEffect(() => {
      let cancelled = false;
      const loadPrefs = async () => {
        try {
          const hiddenForSession = sessionStorage.getItem("hide_onboarding_tips") === "1";
          if (hiddenForSession) {
            setShowTips(false);
            return;
          }
          const prefs = await fetchPreferences();
          if (!cancelled) {
            setShowTips(Boolean(prefs?.settings?.show_onboarding));
          }
        } catch (e) {
          if (!cancelled) setShowTips(false);
        }
      };
      loadPrefs();
      return () => {
        cancelled = true;
      };
    }, []);

    const handleDismissTips = () => {
      sessionStorage.setItem("hide_onboarding_tips", "1");
      setShowTips(false);
    };

    return (
    <>
      <Navigation />
      <div className="relative min-h-screen w-full bg-gradient-to-br from-purple-50 via-white to-purple-100 dark:from-[#0a0a0f] dark:via-[#13131a] dark:to-[#0a0a0f] mt-4 transition-colors duration-300">
        <div className="relative z-10 mx-auto w-full max-w-6xl flex flex-col sm:flex-row gap-2 items-start overflow-x-hidden">
          <HouseholdSidebar />
          <section className="flex-1 min-w-0 w-full max-w-full mx-auto px-0 sm:px-4">
            {showTips && <OnboardingTipsBanner onDismiss={handleDismissTips} />}
            <Outlet />
          </section>
        </div>
      </div>
    </>
  );
}

// Error boundary for better error handling
export { ErrorBoundary } from "~/components/ErrorBoundary";
