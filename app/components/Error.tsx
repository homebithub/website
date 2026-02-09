import React from "react";
import { Link } from "react-router";

interface ErrorProps {
  title?: string;
  message: string;
  action?: {
    to: string;
    label: string;
  };
}

export function Error({
  title = "Error",
  message,
  action,
}: ErrorProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-xl font-bold text-slate-900">
          {title}
        </h1>
        <p className="mt-2 text-slate-600">{message}</p>
        {action && (
          <div className="mt-6">
            <Link
              to={action.to}
              className="inline-flex items-center px-4 py-1 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              {action.label}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 