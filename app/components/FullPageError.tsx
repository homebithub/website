import { AlertTriangle, ArrowLeft, Home, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { PurpleThemeWrapper } from "~/components/layout/PurpleThemeWrapper";
import { transformErrorMessage } from "~/utils/errorMessages";

type FullPageErrorProps = {
  title?: string;
  message: string;
  onRetry?: () => void;
  backTo?: string | null;
  backLabel?: string;
  embed?: boolean;
};

export function FullPageError({
  title = "We couldn't open this page",
  message,
  onRetry,
  backTo,
  backLabel = "Go back",
  embed = false,
}: FullPageErrorProps) {
  const navigate = useNavigate();
  const goBack = () => {
    if (backTo) return navigate(backTo);
    if (typeof window !== "undefined" && window.history.length > 1) return navigate(-1);
    navigate("/", { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col">
      {embed ? null : <Navigation />}
      <PurpleThemeWrapper variant="gradient" bubbles={false} bubbleDensity="low" className="flex flex-1">
        <main className="flex w-full flex-1 items-center justify-center px-4 py-12">
          <section className="w-full max-w-lg rounded-2xl border border-purple-200/70 bg-white p-6 text-center shadow-xl dark:border-purple-500/30 dark:bg-[#13131a] sm:p-8">
            <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-200">
              <AlertTriangle className="h-6 w-6" aria-hidden />
            </span>
            <h1 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">{title}</h1>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-gray-600 dark:text-gray-300">{transformErrorMessage(message)}</p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
              {onRetry && (
                <button type="button" onClick={onRetry} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-2 text-sm font-semibold text-white">
                  <RefreshCw className="h-4 w-4" /> Try again
                </button>
              )}
              <button type="button" onClick={goBack} className="inline-flex items-center justify-center gap-2 rounded-xl border border-purple-300 px-5 py-2 text-sm font-semibold text-purple-700 dark:border-purple-500/40 dark:text-purple-200">
                <ArrowLeft className="h-4 w-4" /> {backLabel}
              </button>
              <button type="button" onClick={() => navigate("/")} className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-700 dark:border-white/10 dark:text-gray-200">
                <Home className="h-4 w-4" /> Home
              </button>
            </div>
          </section>
        </main>
      </PurpleThemeWrapper>
      {embed ? null : <Footer />}
    </div>
  );
}
