import {Outlet, useLocation, useNavigate} from "react-router";
import { Navigation } from "~/components/Navigation";
import HouseholdSidebar from "~/components/features/HouseholdSidebar";
import {useEffect} from "react";
import { FloatingBubbles } from '~/components/ui/FloatingBubbles';

export default function HouseholdDashboard() {

    const navigate = useNavigate();
    const location = useLocation();
    // Redirect /bureau to /bureau/home by default
    useEffect(() => {
        if (location.pathname === "/household") {
            navigate("/household/profile", { replace: true });
        }
    }, [location, navigate]);

    return (
    <>
      <Navigation />
      <div className="relative min-h-screen w-full bg-gradient-to-br from-purple-50 via-white to-purple-100 dark:from-[#0a0a0f] dark:via-[#13131a] dark:to-[#0a0a0f] mt-4 transition-colors duration-300">
        <FloatingBubbles variant="light" density="low" />
        <div className="relative z-10 mx-auto w-full max-w-6xl flex flex-col sm:flex-row gap-2 items-start overflow-x-hidden">
          <HouseholdSidebar />
          <section className="flex-1 min-w-0 w-full max-w-full mx-auto px-0 sm:px-4">
            <Outlet />
          </section>
        </div>
      </div>
    </>
  );
}

// Error boundary for better error handling
export { ErrorBoundary } from "~/components/ErrorBoundary";
