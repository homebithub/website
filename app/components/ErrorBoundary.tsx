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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
          <div className="text-center">
            <div className="text-6xl font-bold text-purple-600 mb-4">
              {error.status}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {error.statusText}
            </h1>
            <p className="text-gray-600 mb-6">
              {error.data?.message || getDefaultMessage(error.status)}
            </p>
            <div className="space-y-3">
              <Link 
                to="/" 
                className="block w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Go Home
              </Link>
              <button
                onClick={() => window.location.reload()}
                className="block w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle unexpected errors
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Oops! Something went wrong
          </h1>
          <p className="text-gray-600 mb-6">
            We're sorry, but something unexpected happened. Please try again.
          </p>
          {process.env.NODE_ENV === 'development' && error instanceof Error && (
            <div className="mb-6 p-4 bg-red-50 rounded-lg text-left">
              <p className="text-sm font-mono text-red-800 mb-2">
                {error.message}
              </p>
              {error.stack && (
                <pre className="text-xs text-red-600 overflow-auto max-h-40">
                  {error.stack}
                </pre>
              )}
            </div>
          )}
          <div className="space-y-3">
            <Link 
              to="/" 
              className="block w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Go Home
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="block w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Reload Page
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
