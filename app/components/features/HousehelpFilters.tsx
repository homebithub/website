import React from "react";
import SearchableTownSelect from "~/components/ui/SearchableTownSelect";
import CustomSelect from "~/components/ui/CustomSelect";

type ChangeHandler = (name: string, value: string) => void;

export type HousehelpSearchFields = {
  status: string;
  househelp_type: string;
  gender: string;
  experience: string;
  town: string;
  salary_frequency: string;
  skill: string;
  traits: string;
  min_rating: string;
  salary_min: string;
  salary_max: string;
  can_work_with_kids: string;
  can_work_with_pets: string;
  offers_live_in: string;
  offers_day_worker: string;
  available_from: string;
  language?: string;
  min_age?: string;
  max_age?: string;
};

// Curated options (kept in sync with backend expectations)
const SKILLS = ["", "cooking", "cleaning", "babysitting", "laundry", "elderly care"];
const TRAITS = ["", "honest", "patient", "punctual", "organized", "friendly"];
const EXPERIENCES = Array.from({ length: 11 }, (_, i) => String(i)); // "0".."10"
const GENDERS = ["", "male", "female"];
const NANNY_TYPES = ["", "dayburg", "sleeper"];

interface Props {
  fields: HousehelpSearchFields;
  onChange: ChangeHandler;
  onSearch: () => void;
  onClose?: () => void; // used by mobile Sheet/Drawer
  onClear?: () => void; // optional clear handler
}

export default function HousehelpFilters({ fields, onChange, onSearch, onClose, onClear }: Props) {
  const inputBase =
    "w-full h-11 px-4 py-2 rounded-xl border-2 border-purple-200 bg-white text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all";

  return (
    <aside className="w-full sm:w-72 bg-white dark:bg-[#13131a] border border-purple-200/60 dark:border-purple-500/30 rounded-2xl shadow-lg p-4 sm:p-5 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-purple-700 dark:text-purple-300">Filters</h3>
        <div className="flex items-center gap-2">
          {onClear && (
            <button
              onClick={onClear}
              className="hidden sm:inline-block text-xs px-3 py-1 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              Clear
            </button>
          )}
          {onClose && (
            <button onClick={onClose} className="sm:hidden text-xs px-3 py-1 rounded-xl bg-purple-100 text-purple-700">Close</button>
          )}
        </div>
      </div>

      {/* Status */}
      <div className="flex flex-col">
        <label className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-200">Status</label>
        <CustomSelect
          value={fields.status}
          onChange={(val) => onChange("status", val)}
          options={[
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
          ]}
          placeholder="Select status"
        />
      </div>

      {/* Nanny type */}
      <div className="flex flex-col">
        <label className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-200">Nanny type</label>
        <CustomSelect
          value={fields.househelp_type}
          onChange={(val) => onChange("househelp_type", val)}
          options={NANNY_TYPES.map((t) => ({ value: t, label: t || "Any" }))}
          placeholder="Any"
        />
      </div>

      {/* Gender */}
      <div className="flex flex-col">
        <label className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-200">Gender</label>
        <CustomSelect
          value={fields.gender}
          onChange={(val) => onChange("gender", val)}
          options={GENDERS.map((g) => ({ value: g, label: g || "Any" }))}
          placeholder="Any"
        />
      </div>

      {/* Experience */}
      <div className="flex flex-col">
        <label className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-200">Experience (min)</label>
        <CustomSelect
          value={fields.experience}
          onChange={(val) => onChange("experience", val)}
          options={EXPERIENCES.map((y) => ({ value: y, label: y }))}
          placeholder="0"
        />
      </div>

      {/* Town */}
      <div className="flex flex-col">
        <label className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-200">Town</label>
        <SearchableTownSelect
          value={fields.town}
          onChange={(value) => onChange("town", value)}
          target="househelps"
          buttonClassName="w-full h-12 px-4 py-2 rounded-xl border-2 border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a] text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all"
        />
      </div>

      {/* Salary frequency */}
      <div className="flex flex-col">
        <label className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-200">Salary frequency</label>
        <CustomSelect
          value={fields.salary_frequency}
          onChange={(val) => onChange("salary_frequency", val)}
          options={[
            { value: "monthly", label: "Monthly" },
            { value: "weekly", label: "Weekly" },
            { value: "daily", label: "Daily" },
          ]}
          placeholder="Monthly"
        />
      </div>

      {/* Salary range */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col">
          <label className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-200">Min salary</label>
          <input
            type="number"
            min="0"
            className={inputBase}
            value={fields.salary_min}
            onChange={(e) => onChange("salary_min", e.target.value)}
            placeholder="e.g. 15000"
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-200">Max salary</label>
          <input
            type="number"
            min="0"
            className={inputBase}
            value={fields.salary_max}
            onChange={(e) => onChange("salary_max", e.target.value)}
            placeholder="e.g. 35000"
          />
        </div>
      </div>

      {/* Skill */}
      <div className="flex flex-col">
        <label className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-200">Skill</label>
        <CustomSelect
          value={fields.skill}
          onChange={(val) => onChange("skill", val)}
          options={SKILLS.map((s) => ({ value: s, label: s || "Any" }))}
          placeholder="Any"
        />
      </div>

      {/* Trait */}
      <div className="flex flex-col">
        <label className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-200">Trait</label>
        <CustomSelect
          value={fields.traits}
          onChange={(val) => onChange("traits", val)}
          options={TRAITS.map((t) => ({ value: t, label: t || "Any" }))}
          placeholder="Any"
        />
      </div>

      {/* Compatibility and availability */}
      <div className="flex flex-col">
        <label className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-200">Works with kids</label>
        <CustomSelect
          value={fields.can_work_with_kids}
          onChange={(val) => onChange("can_work_with_kids", val)}
          options={[
            { value: "", label: "Any" },
            { value: "true", label: "Yes" },
            { value: "false", label: "No" },
          ]}
          placeholder="Any"
        />
      </div>
      <div className="flex flex-col">
        <label className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-200">Works with pets</label>
        <CustomSelect
          value={fields.can_work_with_pets}
          onChange={(val) => onChange("can_work_with_pets", val)}
          options={[
            { value: "", label: "Any" },
            { value: "true", label: "Yes" },
            { value: "false", label: "No" },
          ]}
          placeholder="Any"
        />
      </div>
      <div className="flex flex-col">
        <label className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-200">Live-in</label>
        <CustomSelect
          value={fields.offers_live_in}
          onChange={(val) => onChange("offers_live_in", val)}
          options={[
            { value: "", label: "Any" },
            { value: "true", label: "Yes" },
            { value: "false", label: "No" },
          ]}
          placeholder="Any"
        />
      </div>
      <div className="flex flex-col">
        <label className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-200">Day worker</label>
        <CustomSelect
          value={fields.offers_day_worker}
          onChange={(val) => onChange("offers_day_worker", val)}
          options={[
            { value: "", label: "Any" },
            { value: "true", label: "Yes" },
            { value: "false", label: "No" },
          ]}
          placeholder="Any"
        />
      </div>
      <div className="flex flex-col">
        <label className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-200">Available from</label>
        <input
          type="date"
          className={inputBase}
          value={fields.available_from}
          onChange={(e) => onChange("available_from", e.target.value)}
        />
      </div>

      {/* Min rating */}
      <div className="flex flex-col">
        <label className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-200">Min rating</label>
        <CustomSelect
          value={fields.min_rating}
          onChange={(val) => onChange("min_rating", val)}
          options={["", "5", "4", "3", "2", "1"].map((r) => ({ value: r, label: r ? `${r}+` : "Any" }))}
          placeholder="Any"
        />
      </div>

      <div className="flex items-center gap-2">
        {onClear && (
          <button
            onClick={onClear}
            className="flex-1 px-4 py-1.5 rounded-xl border-2 border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100 transition"
            aria-label="Clear filters"
          >
            Clear
          </button>
        )}
        <button
          onClick={onSearch}
          className="flex-[2] px-6 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow-lg hover:from-purple-700 hover:to-pink-700 hover:scale-[1.02] transition-all"
        >
          🔍 Show results
        </button>
      </div>
    </aside>
  );
}

