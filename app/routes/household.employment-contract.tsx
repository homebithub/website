import React from "react";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { PurpleThemeWrapper } from "~/components/layout/PurpleThemeWrapper";
import EmploymentContractPage from "./household/employment-contract";

export default function HouseholdEmploymentContractRoute() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <PurpleThemeWrapper
        variant="gradient"
        bubbles
        bubbleDensity="medium"
        className="flex-1 w-full"
      >
        <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <EmploymentContractPage />
        </main>
      </PurpleThemeWrapper>
      <Footer />
    </div>
  );
}

export { ErrorBoundary } from "~/components/ErrorBoundary";
