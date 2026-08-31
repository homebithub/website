import { ArrowRight, CheckCircle2, Sparkles, X } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { BaseModal } from "~/components/ui/BaseModal";
import type { ProfileCompletionReminderState } from "~/hooks/useProfileCompletionReminder";

type ProfileType = "household" | "househelp";

interface ProfileCompletionCelebrationModalProps {
  isOpen: boolean;
  profileType: ProfileType;
  celebration: ProfileCompletionReminderState["celebration"];
  onSeen: () => Promise<void>;
  onClose: () => void;
  /** When supplied, this completion flow always continues to this page. */
  completionDestination?: string;
}

export function ProfileCompletionCelebrationModal({
  isOpen,
  profileType,
  celebration,
  onSeen,
  onClose,
  completionDestination,
}: ProfileCompletionCelebrationModalProps) {
  const navigate = useNavigate();

  // Acknowledging after the dialog is mounted means a refresh cannot show it
  // again, while still allowing the user to choose a next step first.
  useEffect(() => {
    if (isOpen) void onSeen();
  }, [isOpen, onSeen]);

  const goTo = (href: string) => {
    onClose();
    navigate(href);
  };

  const closeModal = () => {
    onClose();
    if (completionDestination) navigate(completionDestination);
  };

  return (
    <BaseModal isOpen={isOpen} onClose={closeModal} size="lg" showCloseButton={false}>
      <div className="relative overflow-hidden rounded-2xl bg-[#171020] text-white">
        <div className="pointer-events-none absolute -right-16 -top-20 h-44 w-44 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-16 h-44 w-44 rounded-full bg-violet-500/20 blur-3xl" />

        <div className="relative border-b border-white/10 px-5 pb-5 pt-6 sm:px-7">
          <button
            type="button"
            onClick={closeModal}
            aria-label="Close profile completion message"
            className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/70 transition hover:border-fuchsia-300 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 shadow-lg shadow-fuchsia-500/25">
            <Sparkles className="h-6 w-6" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-fuchsia-300">Profile setup complete</p>
          <h2 className="mt-2 pr-10 text-2xl font-bold tracking-tight sm:text-3xl">{celebration.title}</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/70">{celebration.description}</p>
        </div>

        {completionDestination ? (
          <div className="relative px-5 py-5 sm:px-7 sm:py-6">
            <button
              type="button"
              onClick={closeModal}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-950/30 transition hover:from-violet-500 hover:to-pink-500"
            >
              Continue to home
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </button>
          </div>
        ) : (
          <div className="relative space-y-3 px-5 py-5 sm:px-7 sm:py-6">
            <p className="text-sm font-semibold text-white/90">Here are a few good next steps:</p>
            {celebration.steps.map((step, index) => (
              <button
                key={step.title}
                type="button"
                onClick={() => goTo(step.href)}
                className="group flex w-full items-start gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-left transition hover:border-fuchsia-400/60 hover:bg-white/[0.08]"
              >
                <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-fuchsia-500/15 text-xs font-bold text-fuchsia-200">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-white">{step.title}</span>
                  <span className="mt-0.5 block text-xs leading-5 text-white/60">{step.description}</span>
                </span>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-fuchsia-300 transition group-hover:translate-x-0.5" />
              </button>
            ))}
          </div>
        )}

        <div className="relative flex items-center justify-between gap-3 border-t border-white/10 px-5 py-4 sm:px-7">
          <div className="flex items-center gap-2 text-xs text-emerald-300">
            <CheckCircle2 className="h-4 w-4" />
            {profileType === "household" ? "Your household is ready" : "Your profile is ready to be discovered"}
          </div>
          {!completionDestination && (
            <button
              type="button"
              onClick={closeModal}
              className="rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-fuchsia-300 hover:text-white"
            >
              Explore later
            </button>
          )}
        </div>
      </div>
    </BaseModal>
  );
}
