import { useRouteError, isRouteErrorResponse, Link, useNavigate } from "react-router";
import { useEffect } from "react";

/**
 * Global Error Boundary Component
 * 
 * Catches and displays errors in a user-friendly way
 * Logs errors for monitoring
 * 
 * Usage:
 * Export this from root.tsx or any route file:
 * export { ErrorBoundary } from "~/components/ErrorBoundary";
 */
export function ErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (
      typeof window !== "undefined" &&
      window.history.length > 1 &&
      document.referrer.startsWith(window.location.origin)
    ) {
      navigate(-1);
      return;
    }

    navigate("/", { replace: true });
  };
  
  useEffect(() => {
    // Log error to monitoring service
    if (error) {
      logErrorToMonitoring(error);
    }
  }, [error]);
  
  // Handle different error types
  if (isRouteErrorResponse(error)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-purple-100 dark:from-[#0a0a0f] dark:via-[#13131a] dark:to-[#0a0a0f] px-4 transition-colors duration-300">
        <div className="max-w-md w-full bg-white dark:bg-[#13131a] shadow-xl dark:shadow-glow-lg rounded-2xl border-2 border-purple-200 dark:border-purple-500/30 p-8 transition-colors duration-300">
          <div className="text-center">
            <div className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              {error.status}
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {error.statusText}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error.data?.message || getDefaultMessage(error.status)}
            </p>
            <div className="space-y-3">
              <Link 
                to="/" 
                className="block w-full px-6 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-lg hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all"
              >
                🏠 Go Home
              </Link>
              <button
                onClick={handleGoBack}
                className="block w-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-6 py-1.5 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-semibold"
              >
                ← Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle unexpected errors
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-purple-100 dark:from-[#0a0a0f] dark:via-[#13131a] dark:to-[#0a0a0f] px-4 transition-colors duration-300">
      <div className="max-w-md w-full bg-white dark:bg-[#13131a] shadow-xl dark:shadow-glow-lg rounded-2xl border-2 border-purple-200 dark:border-purple-500/30 p-8 transition-colors duration-300">
        <div className="text-center">
          <div className="text-3xl mb-4">😕</div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Oops! Something went wrong
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            We're sorry, but something unexpected happened. Please try again.
          </p>
          {process.env.NODE_ENV === 'development' && error instanceof Error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-500/30 rounded-xl text-left">
              <p className="text-xs font-mono text-red-800 dark:text-red-400 mb-2 font-semibold">
                {error.message}
              </p>
              {error.stack && (
                <pre className="text-xs text-red-600 dark:text-red-400 overflow-auto max-h-40 p-2 bg-red-100 dark:bg-red-950/50 rounded">
                  {error.stack}
                </pre>
              )}
            </div>
          )}
          <div className="space-y-3">
            <Link 
              to="/" 
              className="block w-full px-6 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-lg hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all"
            >
              🏠 Go Home
            </Link>
            <button
              onClick={handleGoBack}
              className="block w-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-6 py-1.5 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-semibold"
            >
              ← Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function getDefaultMessage(status: number): string {
  switch (status) {
    case 404:
      return "The page you're looking for doesn't exist.";
    case 401:
      return "You need to be logged in to access this page.";
    case 403:
      return "You don't have permission to access this page.";
    case 500:
      return "Our server encountered an error. Please try again later.";
    default:
      return "An unexpected error occurred.";
  }
}

function logErrorToMonitoring(error: unknown) {
  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.error('[Error Boundary]', error);
  }

  if (typeof window !== 'undefined') {
    const payload = {
      name: error instanceof Error ? error.name : 'RouteError',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      pathname: window.location.pathname,
      href: window.location.href,
      timestamp: new Date().toISOString(),
    };

    window.dispatchEvent(new CustomEvent('homebit:error', { detail: payload }));

    if (process.env.NODE_ENV === 'production') {
      const endpoint = (window as any).ENV?.ERROR_MONITORING_API_URL || (window as any).ENV?.MONITORING_API_URL;
      if (!endpoint) return;

      const body = JSON.stringify(payload);
      try {
        if (navigator.sendBeacon) {
          navigator.sendBeacon(endpoint, new Blob([body], { type: 'application/json' }));
          return;
        }
        void fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
          keepalive: true,
        });
      } catch {
        // Ignore monitoring transport errors.
      }
    }
  }
}
