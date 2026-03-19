import React, { useState } from "react";
import SearchableTownSelect from "~/components/ui/SearchableTownSelect";
import CustomSelect from "~/components/ui/CustomSelect";

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
                <CustomSelect
                  value={fields.verified || ""}
                  onChange={(val) => onChange("verified", val)}
                  options={[
                    { value: "", label: "Any" },
                    { value: "true", label: "Verified" },
                    { value: "false", label: "Not verified" },
                  ]}
                  placeholder="Any"
                />
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
                <CustomSelect
                  value={fields.house_size || ""}
                  onChange={(val) => onChange("house_size", val)}
                  options={['', 'bedsitter', '1br', '2br', '3br+', 'mansion'].map((s) => ({ value: s, label: s || 'Any' }))}
                  placeholder="Any"
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Available From</label>
                <input type="date" value={fields.available_from || ""} onChange={(e) => onChange("available_from", e.target.value)} className={inputCls} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Needs Live-in</label>
                <CustomSelect
                  value={fields.needs_live_in || ""}
                  onChange={(val) => onChange("needs_live_in", val)}
                  options={[
                    { value: "", label: "Any" },
                    { value: "true", label: "Yes" },
                    { value: "false", label: "No" },
                  ]}
                  placeholder="Any"
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Needs Day Worker</label>
                <CustomSelect
                  value={fields.needs_day_worker || ""}
                  onChange={(val) => onChange("needs_day_worker", val)}
                  options={[
                    { value: "", label: "Any" },
                    { value: "true", label: "Yes" },
                    { value: "false", label: "No" },
                  ]}
                  placeholder="Any"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Type of Househelp</label>
                <CustomSelect
                  value={fields.type_of_househelp || ""}
                  onChange={(val) => onChange("type_of_househelp", val)}
                  options={[
                    { value: "", label: "Any" },
                    { value: "live_in", label: "Live-in" },
                    { value: "day_worker", label: "Day worker" },
                  ]}
                  placeholder="Any"
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Religion</label>
                <CustomSelect
                  value={fields.religion || ""}
                  onChange={(val) => onChange("religion", val)}
                  options={[{ value: "", label: "Any" }, ...RELIGIONS.map((r) => ({ value: r.toLowerCase(), label: r }))]}
                  placeholder="Any"
                />
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
                <CustomSelect
                  value={fields.salary_frequency || ""}
                  onChange={(val) => onChange("salary_frequency", val)}
                  options={[
                    { value: "", label: "Any" },
                    { value: "daily", label: "Daily" },
                    { value: "weekly", label: "Weekly" },
                    { value: "monthly", label: "Monthly" },
                    { value: "yearly", label: "Yearly" },
                  ]}
                  placeholder="Any"
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Minimum Rating</label>
                <CustomSelect
                  value={fields.min_rating || ""}
                  onChange={(val) => onChange("min_rating", val)}
                  options={[
                    { value: "", label: "Any" },
                    { value: "4.5", label: "4.5+" },
                    { value: "4", label: "4.0+" },
                    { value: "3", label: "3.0+" },
                    { value: "2", label: "2.0+" },
                    { value: "1", label: "1.0+" },
                  ]}
                  placeholder="Any"
                />
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
                <CustomSelect
                  value={fields.has_kids || ""}
                  onChange={(val) => onChange("has_kids", val)}
                  options={[
                    { value: "", label: "Any" },
                    { value: "true", label: "Yes" },
                    { value: "false", label: "No" },
                  ]}
                  placeholder="Any"
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Has Pets</label>
                <CustomSelect
                  value={fields.has_pets || ""}
                  onChange={(val) => onChange("has_pets", val)}
                  options={[
                    { value: "", label: "Any" },
                    { value: "true", label: "Yes" },
                    { value: "false", label: "No" },
                  ]}
                  placeholder="Any"
                />
              </div>
            </div>
            <div className="flex flex-col">
              <label className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Chore / Duty Required</label>
              <CustomSelect
                value={fields.chore || ""}
                onChange={(val) => onChange("chore", val)}
                options={[{ value: "", label: "Any" }, ...CHORES.map((c) => ({ value: c, label: c }))]}
                placeholder="Any"
              />
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
