import { useEffect, useRef } from "react";
import { AlertCircle } from "lucide-react";
import { transformErrorMessage } from "~/utils/errorMessages";

/**
 * The reason a form would not submit, shown where the person is looking.
 *
 * Forms here put this at the top. On a short one that is fine; on a job post or
 * an open-for-work listing the submit button is a couple of hundred pixels below
 * the fold, so somebody presses Save, nothing appears to happen, and the
 * explanation is sitting off-screen above them. What they do next is give up on
 * a thing they had already decided to do.
 *
 * So it belongs immediately above the buttons — the last thing between deciding
 * to submit and submitting. It also pulls itself into view when it appears, for
 * the case where the form is long enough that even that is out of frame, and
 * announces itself, because somebody using a screen reader gets no benefit from
 * where it is on the page.
 */
export function FormError({
  message,
  className = "",
}: {
  message?: string | null;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const rawText = typeof message === "string" ? message.trim() : "";
  const text = rawText ? transformErrorMessage(rawText) : "";

  useEffect(() => {
    if (!text) return;
    // "nearest" rather than "center": if it is already visible, this does
    // nothing, which is what somebody who can see it already wants.
    ref.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [text]);

  if (!text) return null;

  return (
    <div
      ref={ref}
      role="alert"
      aria-live="assertive"
      className={`flex items-start gap-2 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-xs font-medium text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200 ${className}`}
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <span className="min-w-0">{text}</span>
    </div>
  );
}

export default FormError;
