import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { QRCodeSVG } from "qrcode.react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FileCheck2,
  Fingerprint,
  IdCard,
  LockKeyhole,
  QrCode,
  RefreshCw,
  ShieldCheck,
  Smartphone,
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
    purple: "border-purple-200 bg-purple-50 text-purple-900 dark:border-purple-500/40 dark:bg-purple-950/45 dark:text-purple-100",
    blue: "border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-500/35 dark:bg-sky-950/35 dark:text-sky-100",
    rose: "border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-500/35 dark:bg-rose-950/35 dark:text-rose-100",
  }[banner.tone];

  return (
    <>
      <section className={`mb-5 mt-4 rounded-2xl border px-4 py-4 shadow-lg backdrop-blur-md sm:px-5 ${toneClasses} ${className}`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black/5 dark:bg-white/10">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold tracking-[0.2em] opacity-75">{banner.eyebrow}</p>
              <h2 className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{banner.title}</h2>
              <p className="mt-1 max-w-3xl text-xs leading-5 text-gray-600 dark:text-white/70">{banner.description}</p>
              {error && <p className="mt-2 text-xs font-medium text-rose-600 dark:text-rose-300">{error}</p>}
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
            className="absolute inset-0 cursor-default bg-black/50 backdrop-blur-sm dark:bg-black/75"
            onClick={launching ? undefined : dismissModal}
            aria-label="Close identity verification"
          />
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="identity-verification-title"
            className="relative max-h-[92vh] w-full overflow-y-auto rounded-t-3xl border border-purple-200 bg-white p-5 text-gray-900 shadow-2xl sm:max-w-2xl sm:rounded-3xl sm:p-7 dark:border-purple-500/35 dark:bg-[#111018] dark:text-white dark:shadow-purple-950/60"
          >
            <button
              type="button"
              onClick={dismissModal}
              disabled={launching}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl border border-purple-200 bg-purple-50 text-gray-500 transition hover:bg-purple-100 hover:text-gray-900 disabled:opacity-40 dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="pr-10">
              <span className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-100 px-3 py-1 text-[10px] font-bold tracking-[0.16em] text-purple-700 dark:border-purple-400/25 dark:bg-purple-500/10 dark:text-purple-200">
                <ShieldCheck className="h-3.5 w-3.5" />
                VERIFIED WITH SMILE ID
              </span>
              <h2 id="identity-verification-title" className="mt-4 text-xl font-semibold sm:text-2xl">
                Verify your identity
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-gray-600 dark:text-white/65">
                Identity checks make Homebit safer for househelps and households. Smile ID securely compares your
                government-issued document with a live selfie to confirm that it belongs to you.
              </p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <DocumentCard
                icon={IdCard}
                title="National ID"
                description="Front of the card and a live selfie"
              />
              <DocumentCard
                icon={IdCard}
                title="Alien Card"
                description="Front of the card and a live selfie"
              />
              <DocumentCard
                icon={FileCheck2}
                title="Passport"
                description="Photo page and a live selfie"
              />
            </div>

            <PhoneHandoffPanel verification={verification} />

            <div className="mt-5 rounded-2xl border border-purple-100 bg-purple-50/60 p-4 dark:border-white/10 dark:bg-white/[0.04]">
              <h3 className="text-xs font-semibold text-gray-900 dark:text-white">Before you begin</h3>
              <ul className="mt-3 grid gap-2 text-xs leading-5 text-gray-600 sm:grid-cols-2 dark:text-white/65">
                <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-purple-600 dark:text-purple-400" />Have the original document with you — photos of a copy or a screen are rejected.</li>
                <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-purple-600 dark:text-purple-400" />Find a bright place without glare.</li>
                <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-purple-600 dark:text-purple-400" />Make sure every document edge is visible.</li>
                <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-purple-600 dark:text-purple-400" />Allow camera access for the photo and the selfie.</li>
              </ul>
            </div>

            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-purple-200 bg-purple-50 p-4 dark:border-purple-400/20 dark:bg-purple-500/[0.07]">
              <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-purple-600 dark:text-purple-300" />
              <p className="text-xs leading-5 text-gray-600 dark:text-white/65">
                Your identity documents are private and used only for verification, fraud prevention and legally
                required safety checks. They are not displayed on your public profile.
              </p>
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
                {error}
              </div>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={dismissModal}
                disabled={launching}
                className="min-h-11 rounded-xl border border-purple-200 px-5 text-xs font-semibold text-gray-600 transition hover:bg-purple-50 hover:text-gray-900 disabled:opacity-40 dark:border-white/10 dark:text-white/70 dark:hover:bg-white/5 dark:hover:text-white"
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

/**
 * Continuing on a phone.
 *
 * The document is photographed, never uploaded — an upload lets a photocopy or a
 * picture of a screen through, and those fail the document check. A phone camera
 * does this well and a webcam does it badly, so on a desktop this is the
 * recommended path rather than a fallback, and on a machine with no camera it is
 * the only one.
 */
function PhoneHandoffPanel({ verification }: { verification: IdentityVerificationState }) {
  const { handoffLink, handoffExpiresAt, handoffLoading, handoffError, requestHandoff } = verification;
  const [secondsLeft, setSecondsLeft] = useState(0);

  // Touch pointers are phones and tablets, which already have the right camera.
  // Offering to hand the session to a phone from a phone is just noise.
  const [onTouchDevice, setOnTouchDevice] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    setOnTouchDevice(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  // Show the code straight away rather than behind a button.
  //
  // On a desktop this is the recommended path, not a fallback — a phone camera
  // photographs an ID far better than a webcam, and since capture is camera-only
  // a machine without one has no other route. A collapsed "Show QR code" button
  // sitting above a large "Continue with Smile ID" is a button nobody presses,
  // which is exactly what happened: the panel shipped and the first person
  // through it reported there was no way to scan anything.
  useEffect(() => {
    if (onTouchDevice || handoffLink || handoffLoading || handoffError) return;
    void requestHandoff();
  }, [onTouchDevice, handoffLink, handoffLoading, handoffError, requestHandoff]);

  useEffect(() => {
    if (!handoffExpiresAt) {
      setSecondsLeft(0);
      return;
    }
    const tick = () =>
      setSecondsLeft(Math.max(0, Math.round((handoffExpiresAt.getTime() - Date.now()) / 1000)));
    tick();
    const timer = window.setInterval(tick, 1_000);
    return () => window.clearInterval(timer);
  }, [handoffExpiresAt]);

  if (onTouchDevice) return null;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = String(secondsLeft % 60).padStart(2, "0");

  return (
    <div className="mt-5 rounded-2xl border border-purple-100 bg-purple-50/60 p-4 dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="flex items-center gap-2 text-xs font-semibold text-gray-900 dark:text-white">
            <Smartphone className="h-4 w-4 text-purple-600 dark:text-purple-300" aria-hidden="true" />
            Finish on your phone
          </h3>
          <p className="mt-2 max-w-md text-xs leading-5 text-gray-600 dark:text-white/65">
            Phone cameras photograph ID documents far better than most laptop webcams. Scan the code
            with your phone to carry on there — this page will update by itself when you are done.
          </p>
          {handoffError && (
            <p className="mt-2 text-xs font-medium text-rose-600 dark:text-rose-300">{handoffError}</p>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-center gap-2">
          {handoffLink ? (
            <>
              <div className="rounded-xl bg-white p-3 shadow-sm">
                <QRCodeSVG value={handoffLink} size={132} aria-label="Code to continue on your phone" />
              </div>
              <p className="text-[11px] text-gray-500 dark:text-white/55">
                {secondsLeft > 0 ? `Expires in ${minutes}:${seconds}` : "This code has expired."}
              </p>
              {secondsLeft === 0 && (
                <button
                  type="button"
                  onClick={() => void requestHandoff()}
                  className="text-[11px] font-semibold text-purple-700 underline underline-offset-2 dark:text-purple-300"
                >
                  Show a new code
                </button>
              )}
            </>
          ) : (
            <button
              type="button"
              onClick={() => void requestHandoff()}
              disabled={handoffLoading}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-purple-200 px-4 text-xs font-semibold text-purple-700 transition hover:bg-purple-100 disabled:opacity-50 dark:border-purple-400/25 dark:text-purple-200 dark:hover:bg-purple-500/10"
            >
              {handoffLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <QrCode className="h-4 w-4" />}
              {handoffLoading ? "Preparing…" : "Show QR code"}
            </button>
          )}
        </div>
      </div>
    </div>
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
    <div className="rounded-2xl border border-purple-100 bg-purple-50/60 p-4 dark:border-white/10 dark:bg-white/[0.035]">
      <Icon className="h-5 w-5 text-purple-600 dark:text-purple-300" aria-hidden="true" />
      <p className="mt-3 text-xs font-semibold text-gray-900 dark:text-white">{title}</p>
      <p className="mt-1 text-[11px] leading-4 text-gray-500 dark:text-white/55">{description}</p>
    </div>
  );
}
