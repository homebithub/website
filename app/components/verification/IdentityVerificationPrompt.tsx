import { useEffect } from "react";
import { createPortal } from "react-dom";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FileCheck2,
  Fingerprint,
  IdCard,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  X,
} from "lucide-react";
import type { IdentityVerificationState } from "~/hooks/useIdentityVerification";

interface IdentityVerificationPromptProps {
  verification: IdentityVerificationState;
  className?: string;
}
const isWaitingForReview = (internalStatus: string) =>
  ["submitted", "provider_review", "manual_review", "pending"].includes(internalStatus);

export function IdentityVerificationPrompt({
  verification,
  className = "",
}: IdentityVerificationPromptProps) {
  const {
    status,
    internalStatus,
    failureReason,
    loading,
    launching,
    modalOpen,
    error,
    openModal,
    dismissModal,
    startVerification,
    refresh,
  } = verification;

  useEffect(() => {
    if (!modalOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !launching) dismissModal();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [dismissModal, launching, modalOpen]);

  if (loading || status === "loading" || status === "approved") return null;

  const waiting = status === "in_progress" && isWaitingForReview(internalStatus);
  const banner = {
    not_started: {
      icon: ShieldCheck,
      eyebrow: "IDENTITY VERIFICATION",
      title: "Build trust with a verified identity",
      description: "Verify with Smile ID so households know that your identity has been checked securely.",
      action: "Verify identity",
      tone: "purple",
    },
    in_progress: waiting
      ? {
          icon: Clock3,
          eyebrow: "VERIFICATION IN PROGRESS",
          title: "Smile ID is reviewing your identity",
          description: "You can continue using Homebit. We’ll notify you as soon as the review is complete.",
          action: "Check status",
          tone: "blue",
        }
      : {
          icon: FileCheck2,
          eyebrow: "FINISH IDENTITY VERIFICATION",
          title: "Your verification session is ready",
          description: "Continue where you left off to submit your document and live selfie.",
          action: "Continue verification",
          tone: "purple",
        },
    failed: {
      icon: AlertTriangle,
      eyebrow: "VERIFICATION NEEDS ATTENTION",
      title: "We couldn’t verify your identity",
      description: failureReason || "Review your document details and try again with clear, well-lit images.",
      action: "Try again",
      tone: "rose",
    },
  }[status];

  const Icon = banner.icon;
  const toneClasses = {
    purple: "border-purple-500/40 bg-purple-950/45 text-purple-100",
    blue: "border-sky-500/35 bg-sky-950/35 text-sky-100",
    rose: "border-rose-500/35 bg-rose-950/35 text-rose-100",
  }[banner.tone];

  return (
    <>
      <section className={`mt-4 rounded-2xl border px-4 py-4 shadow-lg backdrop-blur-md sm:px-5 ${toneClasses} ${className}`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold tracking-[0.2em] opacity-75">{banner.eyebrow}</p>
              <h2 className="mt-1 text-sm font-semibold text-white">{banner.title}</h2>
              <p className="mt-1 max-w-3xl text-xs leading-5 text-white/70">{banner.description}</p>
              {error && <p className="mt-2 text-xs font-medium text-rose-300">{error}</p>}
            </div>
          </div>
          <button
            type="button"
            onClick={waiting ? () => void refresh() : openModal}
            className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 text-xs font-semibold text-white shadow-lg shadow-purple-950/30 transition hover:from-purple-500 hover:to-pink-500 focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            {waiting ? <RefreshCw className="h-4 w-4" /> : <Fingerprint className="h-4 w-4" />}
            {banner.action}
          </button>
        </div>
      </section>

      {modalOpen && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-6" role="presentation">
          <button
            type="button"
            className="absolute inset-0 cursor-default bg-black/75 backdrop-blur-sm"
            onClick={launching ? undefined : dismissModal}
            aria-label="Close identity verification"
          />
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="identity-verification-title"
            className="relative max-h-[92vh] w-full overflow-y-auto rounded-t-3xl border border-purple-500/35 bg-[#111018] p-5 text-white shadow-2xl shadow-purple-950/60 sm:max-w-2xl sm:rounded-3xl sm:p-7"
          >
            <button
              type="button"
              onClick={dismissModal}
              disabled={launching}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="pr-10">
              <span className="inline-flex items-center gap-2 rounded-full border border-purple-400/25 bg-purple-500/10 px-3 py-1 text-[10px] font-bold tracking-[0.16em] text-purple-200">
                <ShieldCheck className="h-3.5 w-3.5" />
                VERIFIED WITH SMILE ID
              </span>
              <h2 id="identity-verification-title" className="mt-4 text-xl font-semibold sm:text-2xl">
                Verify your identity
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-white/65">
                Identity checks make Homebit safer for househelps and households. Smile ID securely compares your
                government-issued document with a live selfie to confirm that it belongs to you.
              </p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <DocumentCard
                icon={IdCard}
                title="National ID"
                description="Front, back and a live selfie"
              />
              <DocumentCard
                icon={IdCard}
                title="Alien Card"
                description="Front, back and a live selfie"
              />
              <DocumentCard
                icon={FileCheck2}
                title="Passport"
                description="Photo page and a live selfie"
              />
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <h3 className="text-xs font-semibold text-white">Before you begin</h3>
              <ul className="mt-3 grid gap-2 text-xs leading-5 text-white/65 sm:grid-cols-2">
                <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-purple-400" />Use a valid, unexpired document.</li>
                <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-purple-400" />Find a bright place without glare.</li>
                <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-purple-400" />Make sure every document edge is visible.</li>
                <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-purple-400" />Allow camera access for the live selfie.</li>
              </ul>
            </div>

            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-purple-400/20 bg-purple-500/[0.07] p-4">
              <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-purple-300" />
              <p className="text-xs leading-5 text-white/65">
                Your identity documents are private and used only for verification, fraud prevention and legally
                required safety checks. They are not displayed on your public profile.
              </p>
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-200">
                {error}
              </div>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={dismissModal}
                disabled={launching}
                className="min-h-11 rounded-xl border border-white/10 px-5 text-xs font-semibold text-white/70 transition hover:bg-white/5 hover:text-white disabled:opacity-40"
              >
                Not now
              </button>
              <button
                type="button"
                onClick={() => void startVerification()}
                disabled={launching || waiting}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 text-xs font-semibold text-white shadow-lg shadow-purple-950/40 transition hover:from-purple-500 hover:to-pink-500 focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {launching ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Fingerprint className="h-4 w-4" />}
                {launching ? "Preparing secure check…" : status === "failed" ? "Retry with Smile ID" : "Continue with Smile ID"}
              </button>
            </div>
          </section>
        </div>,
        document.body,
      )}
    </>
  );
}

function DocumentCard({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof IdCard;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <Icon className="h-5 w-5 text-purple-300" aria-hidden="true" />
      <p className="mt-3 text-xs font-semibold text-white">{title}</p>
      <p className="mt-1 text-[11px] leading-4 text-white/55">{description}</p>
    </div>
  );
}
