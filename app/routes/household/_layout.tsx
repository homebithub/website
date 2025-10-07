import {Outlet, useLocation, useNavigate} from "react-router";
import { Navigation } from "~/components/Navigation";
import HouseholdSidebar from "~/components/HouseholdSidebar";
import {useEffect} from "react";

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
      <div className="min-h-screen w-full bg-slate-950 mt-4">
        <div className="mx-auto w-full max-w-6xl flex flex-col sm:flex-row gap-2 items-start overflow-x-hidden">
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
