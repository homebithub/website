import React from "react";
import { Outlet, useNavigate, useLocation } from "@remix-run/react";
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
      <main className="flex flex-col min-h-screen bg-gray-50 dark:bg-slate-900 px-2 py-4">
  <div className="mx-auto w-full max-w-5xl flex flex-col gap-4 sm:flex-row sm:gap-8 overflow-x-hidden">
    <BureauSidebar />
    <section className="flex-1 min-w-0">
      <Outlet />
    </section>
  </div>
</main>
    </>
  );
}


