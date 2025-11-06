import React from "react";
import { Link } from "react-router";
import { Error } from "~/components/Error";

export default function Unauthorized() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <Error
          title="Access Denied"
          message="You don't have permission to access this page. Please contact your administrator if you believe this is a mistake."
          action={{
            text: "Go back home",
            to: "/",
          }}
        />
      </div>
    </div>
  );
} 