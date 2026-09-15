import { useRouteError, isRouteErrorResponse } from "react-router";
import { useEffect } from "react";
import { FullPageError } from "~/components/FullPageError";

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
    return <FullPageError title={`${error.status}: ${error.statusText || "Request failed"}`} message={error.data?.message || getDefaultMessage(error.status)} onRetry={() => window.location.reload()} />;
  }

  // Handle unexpected errors
  return <FullPageError title="Something went wrong" message="We couldn't complete that request. Please try again; if it continues, return to the previous page." onRetry={() => window.location.reload()} />;
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
