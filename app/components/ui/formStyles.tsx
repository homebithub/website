/**
 * Shared form styling.
 *
 * Inputs and textareas were styled ad hoc per component, which left some
 * controls readable only in dark mode. These constants keep every field on the
 * same purple/pink language and legible in both themes.
 *
 * Selects are not here: a native <select> renders its open list through the
 * operating system and ignores the theme, so dropdowns use CustomSelect.
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
