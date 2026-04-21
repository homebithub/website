import React from "react";
import { Link } from "react-router";

export default function BureauCommercials() {
  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-lg font-bold text-primary dark:text-primary-300">Commercials</h2>
      <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
        <p className="font-semibold">This bureau contracts area is not enabled yet.</p>
        <p className="mt-2 text-xs">
          We have removed it from the main bureau navigation until the underlying contracts and partner workflows are implemented end to end.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link to="/bureau/home" className="btn-secondary">
            Back to Dashboard
          </Link>
          <Link to="/bureau/househelps" className="btn-primary">
            Manage Househelps
          </Link>
        </div>
      </div>
    </div>
  );
}

// Error boundary for better error handling
export { ErrorBoundary } from "~/components/ErrorBoundary";
