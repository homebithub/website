import { LayoutGrid, List } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export type ListingViewMode = "list" | "grid";

export function useListingViewPreference(storageKey: string) {
  const [viewMode, setViewModeState] = useState<ListingViewMode>("list");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored === "list" || stored === "grid") setViewModeState(stored);
    } catch {
      // Storage can be unavailable in privacy modes. The list remains a safe default.
    }
  }, [storageKey]);

  const setViewMode = useCallback((next: ListingViewMode) => {
    setViewModeState(next);
    try {
      window.localStorage.setItem(storageKey, next);
    } catch {
      // The preference is still kept for the current page session.
    }
  }, [storageKey]);

  return [viewMode, setViewMode] as const;
}

export function ListingViewToggle({
  value,
  onChange,
  className = "",
}: {
  value: ListingViewMode;
  onChange: (value: ListingViewMode) => void;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label="Choose listing view"
      className={`hidden h-10 shrink-0 items-center rounded-xl border border-purple-200/70 bg-white/80 p-1 dark:border-purple-500/40 dark:bg-white/10 md:inline-flex ${className}`}
    >
      {([
        { value: "list" as const, label: "List view", Icon: List },
        { value: "grid" as const, label: "Grid view", Icon: LayoutGrid },
      ]).map(({ value: option, label, Icon }) => {
        const selected = value === option;
        return (
          <button
            key={option}
            type="button"
            aria-label={label}
            aria-pressed={selected}
            title={label}
            onClick={() => onChange(option)}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition ${
              selected
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm"
                : "text-gray-500 hover:bg-purple-50 hover:text-purple-700 dark:text-gray-300 dark:hover:bg-purple-500/10 dark:hover:text-purple-200"
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
