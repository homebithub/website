import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import { useEffect, useState } from "react";
import { Navigation } from "~/components/Navigation";
import BureauSidebar from "~/components/BureauSidebar";

export default function BureauDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  // Redirect /bureau to /bureau/home by default
  useEffect(() => {
    if (location.pathname === "/bureau") {
      navigate("/bureau/home", { replace: true });
    }
  }, [location, navigate]);

  return (
    <>
      <Navigation />
      <div className="min-h-screen w-full bg-slate-950">
        <div className="mx-auto w-full max-w-6xl flex flex-col sm:flex-row gap-2 items-start overflow-x-hidden">
          <BureauSidebar />
          <section className="flex-1 min-w-0">
            <Outlet />
          </section>
        </div>
      </div>
    </>
  );
}



// Error boundary for better error handling
export { ErrorBoundary } from "~/components/ErrorBoundary";
