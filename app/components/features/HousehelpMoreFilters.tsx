import React, { useMemo } from "react";

export type HousehelpMoreFilterFields = {
  can_work_with_kids?: string; // "", "true", "false"
  can_work_with_pets?: string; // "", "true", "false"
  offers_live_in?: string; // "", "true", "false"
  offers_day_worker?: string; // "", "true", "false"
  available_from?: string;
};

interface Props {
  fields: HousehelpMoreFilterFields & Record<string, string>;
  onChange: (name: string, value: string) => void;
  onSearch: () => void;
  onClear: () => void;
}

export default function HousehelpMoreFilters({ fields, onChange, onSearch, onClear }: Props) {
  const selectCls =
    "w-full px-4 py-3 rounded-xl text-base focus:outline-none focus:ring-4 focus:ring-purple-300 shadow-md";
  const inputCls =
    "w-full px-4 py-3 rounded-xl text-base focus:outline-none focus:ring-4 focus:ring-purple-300 shadow-md";

  // Derive single select for type of househelp from two boolean-like flags
  const typeValue = useMemo(() => {
    const liveIn = fields.offers_live_in === "true";
    const dayWorker = fields.offers_day_worker === "true";
    if (liveIn && !dayWorker) return "live_in";
    if (dayWorker && !liveIn) return "day_worker";
    return "";
  }, [fields.offers_live_in, fields.offers_day_worker]);

  const setType = (val: string) => {
    if (val === "live_in") {
      onChange("offers_live_in", "true");
      onChange("offers_day_worker", "");
    } else if (val === "day_worker") {
      onChange("offers_live_in", "");
      onChange("offers_day_worker", "true");
    } else {
      onChange("offers_live_in", "");
      onChange("offers_day_worker", "");
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Works with Kids</label>
          <select
            value={fields.can_work_with_kids || ""}
            onChange={(e) => onChange("can_work_with_kids", e.target.value)}
            className={selectCls}
          >
            <option value="">Any</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Works with Pets</label>
          <select
            value={fields.can_work_with_pets || ""}
            onChange={(e) => onChange("can_work_with_pets", e.target.value)}
            className={selectCls}
          >
            <option value="">Any</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Type of Househelp</label>
          <select value={typeValue} onChange={(e) => setType(e.target.value)} className={selectCls}>
            <option value="">Any</option>
            <option value="live_in">Live-in</option>
            <option value="day_worker">Day worker</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Available From</label>
          <input
            type="date"
            value={fields.available_from || ""}
            onChange={(e) => onChange("available_from", e.target.value)}
            className={inputCls}
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <button
          onClick={onClear}
          className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/10"
        >
          Clear
        </button>
        <button
          onClick={onSearch}
          className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all"
        >
          Apply
        </button>
      </div>
    </div>
  );
}
