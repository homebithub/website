/**
 * Shared form styling.
 *
 * Inputs, selects and textareas were styled ad hoc per component, which left
 * some controls readable only in dark mode. These constants keep every field
 * on the same purple/pink language and legible in both themes.
 */

export const FIELD_LABEL_CLASS =
  "mb-2 block text-sm font-semibold text-purple-700 dark:text-purple-300";

export const FIELD_BASE_CLASS =
  "w-full rounded-2xl border px-4 py-3 outline-none transition " +
  "border-purple-200 bg-white text-gray-900 placeholder:text-gray-400 " +
  "focus:border-purple-500 focus:ring-2 focus:ring-purple-500/25 " +
  "disabled:cursor-not-allowed disabled:opacity-60 " +
  "dark:border-purple-500/35 dark:bg-black/30 dark:text-white dark:placeholder:text-gray-500 " +
  "dark:focus:border-purple-400";

export const INPUT_CLASS = FIELD_BASE_CLASS;

export const TEXTAREA_CLASS = `${FIELD_BASE_CLASS} resize-y`;

/**
 * Native selects need an explicit background on the element itself, because
 * the rendered option list inherits it. Without this the dark theme shows
 * white-on-white options on some platforms.
 */
export const SELECT_CLASS =
  `${FIELD_BASE_CLASS} appearance-none bg-no-repeat pr-11 ` +
  "dark:bg-dark-card [&>option]:bg-white [&>option]:text-gray-900 " +
  "dark:[&>option]:bg-dark-card dark:[&>option]:text-white";

/**
 * Chevron for a native select. Pair with SELECT_CLASS on a `relative` wrapper.
 */
export function SelectChevron() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-500 dark:text-purple-300"
    >
      <path
        d="M6 8l4 4 4-4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Marks a field as required. Screen readers announce "required" rather than
 * the bare asterisk.
 */
export function RequiredMark() {
  return (
    <span className="ml-0.5 font-bold text-pink-600 dark:text-pink-400" aria-hidden="true">
      *
    </span>
  );
}

/**
 * Legend explaining the asterisk, for forms with required fields.
 */
export function RequiredLegend({ className = "" }: { className?: string }) {
  return (
    <p className={`text-xs text-gray-500 dark:text-gray-400 ${className}`}>
      Fields marked <RequiredMark /> are required.
    </p>
  );
}
