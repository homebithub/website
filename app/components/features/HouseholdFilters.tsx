import React, { useState } from "react";
import SearchableTownSelect from "~/components/ui/SearchableTownSelect";

export type HouseholdSearchFields = {
  town?: string;
  house_size?: string;
  verified?: string;
  has_kids?: string;
  has_pets?: string;
  type_of_househelp?: string;
  available_from?: string;
  needs_live_in?: string;
  needs_day_worker?: string;
  budget_min?: string;
  budget_max?: string;
  salary_frequency?: string;
  religion?: string;
  chore?: string;
  min_rating?: string;
};

interface Props {
  fields: HouseholdSearchFields;
  onChange: (name: keyof HouseholdSearchFields, value: string) => void;
  onSearch: () => void;
  onClear: () => void;
}

const CHORES = [
  "Cooking", "Cleaning", "Laundry", "Ironing", "Childcare", "Pet care",
  "Gardening", "Shopping", "Errands", "Elderly care", "Tutoring",
];

const RELIGIONS = [
  "Christian", "Muslim", "Hindu", "Buddhist", "Traditional", "None", "Other",
];

export default function HouseholdFilters({ fields, onChange, onSearch, onClear }: Props) {
  const [openSections, setOpenSections] = useState({
    basics: true,
    budget: true,
    compatibility: true,
  });

  const inputCls =
    "w-full h-12 px-4 py-1.5 rounded-xl text-base bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-300 shadow-sm";
  const selectCls = `${inputCls} appearance-none`;

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-gray-200/80 dark:border-gray-700/70 bg-white/70 dark:bg-black/20 overflow-hidden">
        <button
          type="button"
          onClick={() => setOpenSections((prev) => ({ ...prev, basics: !prev.basics }))}
          className="w-full px-4 py-3 flex items-center justify-between text-left"
        >
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Basics & Availability</span>
          <span className="text-gray-500">{openSections.basics ? "−" : "+"}</span>
        </button>
        {openSections.basics && (
          <div className="px-4 pb-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Verified</label>
                <select value={fields.verified || ""} onChange={(e) => onChange("verified", e.target.value)} className={selectCls}>
                  <option value="">Any</option>
                  <option value="true">Verified</option>
                  <option value="false">Not verified</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Town</label>
                <SearchableTownSelect
                  value={fields.town || ""}
                  onChange={(value) => onChange("town", value)}
                  target="households"
                  buttonClassName={selectCls}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">House Size</label>
                <select value={fields.house_size || ""} onChange={(e) => onChange("house_size", e.target.value)} className={selectCls}>
                  {['', 'bedsitter', '1br', '2br', '3br+', 'mansion'].map((s) => (
                    <option key={s} value={s}>{s || 'Any'}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col">
                <label className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Available From</label>
                <input type="date" value={fields.available_from || ""} onChange={(e) => onChange("available_from", e.target.value)} className={inputCls} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Needs Live-in</label>
                <select value={fields.needs_live_in || ""} onChange={(e) => onChange("needs_live_in", e.target.value)} className={selectCls}>
                  <option value="">Any</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Needs Day Worker</label>
                <select value={fields.needs_day_worker || ""} onChange={(e) => onChange("needs_day_worker", e.target.value)} className={selectCls}>
                  <option value="">Any</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Type of Househelp</label>
                <select value={fields.type_of_househelp || ""} onChange={(e) => onChange("type_of_househelp", e.target.value)} className={selectCls}>
                  <option value="">Any</option>
                  <option value="live_in">Live-in</option>
                  <option value="day_worker">Day worker</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Religion</label>
                <select value={fields.religion || ""} onChange={(e) => onChange("religion", e.target.value)} className={selectCls}>
                  <option value="">Any</option>
                  {RELIGIONS.map((r) => (
                    <option key={r} value={r.toLowerCase()}>{r}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-gray-200/80 dark:border-gray-700/70 bg-white/70 dark:bg-black/20 overflow-hidden">
        <button
          type="button"
          onClick={() => setOpenSections((prev) => ({ ...prev, budget: !prev.budget }))}
          className="w-full px-4 py-3 flex items-center justify-between text-left"
        >
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Budget & Rating</span>
          <span className="text-gray-500">{openSections.budget ? "−" : "+"}</span>
        </button>
        {openSections.budget && (
          <div className="px-4 pb-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Min Budget (KES)</label>
                <input type="number" min="0" value={fields.budget_min || ""} onChange={(e) => onChange("budget_min", e.target.value)} placeholder="e.g. 10000" className={inputCls} />
              </div>
              <div className="flex flex-col">
                <label className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Max Budget (KES)</label>
                <input type="number" min="0" value={fields.budget_max || ""} onChange={(e) => onChange("budget_max", e.target.value)} placeholder="e.g. 50000" className={inputCls} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Salary Frequency</label>
                <select value={fields.salary_frequency || ""} onChange={(e) => onChange("salary_frequency", e.target.value)} className={selectCls}>
                  <option value="">Any</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Minimum Rating</label>
                <select value={fields.min_rating || ""} onChange={(e) => onChange("min_rating", e.target.value)} className={selectCls}>
                  <option value="">Any</option>
                  <option value="4.5">4.5+</option>
                  <option value="4">4.0+</option>
                  <option value="3">3.0+</option>
                  <option value="2">2.0+</option>
                  <option value="1">1.0+</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-gray-200/80 dark:border-gray-700/70 bg-white/70 dark:bg-black/20 overflow-hidden">
        <button
          type="button"
          onClick={() => setOpenSections((prev) => ({ ...prev, compatibility: !prev.compatibility }))}
          className="w-full px-4 py-3 flex items-center justify-between text-left"
        >
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Compatibility</span>
          <span className="text-gray-500">{openSections.compatibility ? "−" : "+"}</span>
        </button>
        {openSections.compatibility && (
          <div className="px-4 pb-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Has Kids</label>
                <select value={fields.has_kids || ""} onChange={(e) => onChange("has_kids", e.target.value)} className={selectCls}>
                  <option value="">Any</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Has Pets</label>
                <select value={fields.has_pets || ""} onChange={(e) => onChange("has_pets", e.target.value)} className={selectCls}>
                  <option value="">Any</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col">
              <label className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Chore / Duty Required</label>
              <select value={fields.chore || ""} onChange={(e) => onChange("chore", e.target.value)} className={selectCls}>
                <option value="">Any</option>
                {CHORES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 pt-2">
        <button
          onClick={onClear}
          className="w-full px-4 py-1.5 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-50 dark:hover:bg-white/10 transition-all"
        >
          Clear
        </button>
        <button
          onClick={onSearch}
          className="w-full px-6 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all shadow-lg"
        >
          Apply
        </button>
      </div>
    </div>
  );
}
