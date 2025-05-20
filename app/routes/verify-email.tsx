import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "@remix-run/react";
import { Error as ErrorComponent } from "~/components/Error";
import { Loading } from "~/components/Loading";

interface ApiError {
  message: string;
}

interface ErrorConstructor {
  new (message?: string): Error;
}

declare const Error: ErrorConstructor;

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setError("Invalid or missing verification token");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("http://localhost:8080/auth/verify-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        if (!response.ok) {
          const data = await response.json() as ApiError;
          throw new Error(data.message || "Failed to verify email");
        }

        setSuccess(true);
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } catch (error) {
        setError(error instanceof Error ? error.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [token, navigate]);

  if (loading) {
    return <Loading text="Verifying your email..." />;
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <h1 className="text-3xl font-bold text-slate-900">
            Email verified successfully
          </h1>
          <p className="mt-2 text-slate-600">
            Your email has been verified. You will be redirected to the login page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {error ? (
          <>
            <h1 className="text-3xl font-bold text-slate-900">
              Verification failed
            </h1>
            <p className="mt-2 text-slate-600">
              {error}
            </p>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-slate-900">
              Verifying your email
            </h1>
            <p className="mt-2 text-slate-600">
              Please wait while we verify your email address...
            </p>
          </>
        )}
      </div>
    </div>
  );
} 