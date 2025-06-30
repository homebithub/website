import { Outlet } from "@remix-run/react";
import { Navigation } from "~/components/Navigation";
import HouseholdSidebar from "~/components/HouseholdSidebar";

export default function HouseholdDashboard() {
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
