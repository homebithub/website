import { CheckCircle2, ChevronRight, Circle, Loader2, LockKeyhole, X } from "lucide-react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router";
import type { MarketplaceReadiness } from "~/hooks/useMarketplaceReadiness";

const stepDestination = (profileType: string, stepId: string, supplied: string) => {
  if (stepId === "listing") {
    return profileType === "household" ? "/household/hiring-history" : "/";
  }
  return supplied || "/";
};

export function MarketplaceReadinessBanner({ readiness }: { readiness: MarketplaceReadiness }) {
  const navigate = useNavigate();
  if (readiness.loading) {
    return <div className="mb-5 flex items-center gap-2 rounded-2xl border border-purple-200 bg-white/80 px-4 py-4 text-xs text-gray-600 dark:border-purple-500/25 dark:bg-white/[0.04] dark:text-white/65"><Loader2 className="h-4 w-4 animate-spin" /> Checking your setup…</div>;
  }
  return (
    <section className="mb-5 rounded-2xl border border-purple-200 bg-white/90 p-4 shadow-lg dark:border-purple-500/30 dark:bg-[#15101f]/95 sm:p-5" aria-label="Marketplace setup actions">
      <div className="flex items-start gap-3">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${readiness.interactionAllowed ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" : "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300"}`}>
          {readiness.interactionAllowed ? <CheckCircle2 className="h-5 w-5" /> : <LockKeyhole className="h-5 w-5" />}
        </span>
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{readiness.interactionAllowed ? "You’re ready to use the marketplace" : "Finish these actions to interact"}</h2>
          <p className="mt-1 text-xs leading-5 text-gray-600 dark:text-white/65">{readiness.message}</p>
          {readiness.error && <p className="mt-1 text-xs text-rose-600 dark:text-rose-300">{readiness.error}</p>}
        </div>
      </div>
      <div className={`mt-4 grid gap-2 ${readiness.steps.length === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
        {readiness.steps.map((step) => (
          <button key={step.id} type="button" onClick={() => navigate(stepDestination(readiness.profileType, step.id, step.action_path))} className="group flex min-h-20 items-start gap-3 rounded-xl border border-purple-100 bg-purple-50/45 p-3 text-left transition hover:border-purple-300 hover:bg-purple-50 dark:border-white/10 dark:bg-white/[0.035] dark:hover:border-purple-400/40 dark:hover:bg-purple-500/[0.08]">
            {step.completed ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> : <Circle className="mt-0.5 h-4 w-4 shrink-0 text-purple-400" />}
            <span className="min-w-0 flex-1"><span className="block text-xs font-semibold text-gray-900 dark:text-white">{step.label}</span><span className="mt-1 block text-[11px] leading-4 text-gray-500 dark:text-white/55">{step.description}</span></span>
            <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-gray-400 transition group-hover:translate-x-0.5" />
          </button>
        ))}
      </div>
    </section>
  );
}

export function MarketplaceReadinessRequiredModal({ readiness, open, onClose }: { readiness: MarketplaceReadiness; open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  if (!open || typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 z-[160] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-5">
      <section role="dialog" aria-modal="true" aria-labelledby="readiness-required-title" className="relative w-full max-w-lg rounded-t-3xl border border-purple-200 bg-white p-5 shadow-2xl dark:border-purple-500/30 dark:bg-[#15101f] sm:rounded-3xl sm:p-6">
        <button type="button" onClick={onClose} aria-label="Close" className="absolute right-4 top-4 rounded-xl border border-purple-200 p-2 text-gray-500 dark:border-white/10 dark:text-white/60"><X className="h-4 w-4" /></button>
        <LockKeyhole className="h-8 w-8 text-purple-600 dark:text-purple-300" />
        <h2 id="readiness-required-title" className="mt-4 pr-10 text-lg font-semibold text-gray-900 dark:text-white">Complete your setup first</h2>
        <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-white/65">You can browse profiles and save them now. Complete the remaining actions below before applying, inviting, or messaging.</p>
        <div className="mt-5 space-y-2">
          {readiness.steps.filter((step) => !step.completed).map((step) => (
            <button key={step.id} type="button" onClick={() => { onClose(); navigate(stepDestination(readiness.profileType, step.id, step.action_path)); }} className="flex w-full items-center gap-3 rounded-xl border border-purple-200 px-4 py-3 text-left text-xs font-semibold text-gray-800 hover:bg-purple-50 dark:border-purple-500/25 dark:text-white dark:hover:bg-purple-500/10"><Circle className="h-4 w-4 text-purple-400" /><span className="flex-1">{step.label}</span><ChevronRight className="h-4 w-4" /></button>
          ))}
        </div>
      </section>
    </div>, document.body,
  );
}
