import { useRouteError, isRouteErrorResponse, Link } from "react-router";
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
            <div className="text-7xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              {error.status}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
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
                onClick={() => window.location.reload()}
                className="block w-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-6 py-1.5 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-semibold"
              >
                🔄 Reload Page
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
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Oops! Something went wrong
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            We're sorry, but something unexpected happened. Please try again.
          </p>
          {process.env.NODE_ENV === 'development' && error instanceof Error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-500/30 rounded-xl text-left">
              <p className="text-sm font-mono text-red-800 dark:text-red-400 mb-2 font-semibold">
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
              onClick={() => window.location.reload()}
              className="block w-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-6 py-1.5 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-semibold"
            >
              🔄 Reload Page
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

  // In production, send to monitoring service
  // TODO: Integrate with error tracking service (e.g., Sentry)
  if (process.env.NODE_ENV === 'production') {
    // Example: Sentry.captureException(error);
  }
}
