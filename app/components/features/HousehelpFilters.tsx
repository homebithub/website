import React from "react";
import SearchableTownSelect from "~/components/ui/SearchableTownSelect";

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
  const selectBase =
    "w-full h-11 px-4 py-2 rounded-[10px] bg-white text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all border-0 dark:bg-[#13131a] dark:text-white";
  const gradientWrap = "rounded-xl p-[2px] bg-gradient-to-r from-purple-500 to-pink-500 dark:p-0 dark:bg-transparent";

  return (
    <aside className="w-full sm:w-72 bg-white dark:bg-[#13131a] border border-purple-200/60 dark:border-purple-500/30 rounded-2xl shadow-lg p-4 sm:p-5 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-purple-700 dark:text-purple-300">Filters</h3>
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
            <button onClick={onClose} className="sm:hidden text-sm px-3 py-1 rounded-xl bg-purple-100 text-purple-700">Close</button>
          )}
        </div>
      </div>

      {/* Status */}
      <div className="flex flex-col">
        <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">Status</label>
        <div className={gradientWrap}>
          <select className={selectBase} value={fields.status} onChange={(e) => onChange("status", e.target.value)}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Nanny type */}
      <div className="flex flex-col">
        <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">Nanny type</label>
        <div className={gradientWrap}>
          <select className={selectBase} value={fields.househelp_type} onChange={(e) => onChange("househelp_type", e.target.value)}>
            {NANNY_TYPES.map((t) => (
              <option key={t} value={t}>{t || "Any"}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Gender */}
      <div className="flex flex-col">
        <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">Gender</label>
        <div className={gradientWrap}>
          <select className={selectBase} value={fields.gender} onChange={(e) => onChange("gender", e.target.value)}>
            {GENDERS.map((g) => (
              <option key={g} value={g}>{g || "Any"}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Experience */}
      <div className="flex flex-col">
        <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">Experience (min)</label>
        <div className={gradientWrap}>
          <select className={selectBase} value={fields.experience} onChange={(e) => onChange("experience", e.target.value)}>
            {EXPERIENCES.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Town */}
      <div className="flex flex-col">
        <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">Town</label>
        <div className={gradientWrap}>
          <SearchableTownSelect
            value={fields.town}
            onChange={(value) => onChange("town", value)}
            target="househelps"
            buttonClassName={selectBase}
          />
        </div>
      </div>

      {/* Salary frequency */}
      <div className="flex flex-col">
        <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">Salary frequency</label>
        <div className={gradientWrap}>
          <select className={selectBase} value={fields.salary_frequency} onChange={(e) => onChange("salary_frequency", e.target.value)}>
            <option value="monthly">Monthly</option>
            <option value="weekly">Weekly</option>
            <option value="daily">Daily</option>
          </select>
        </div>
      </div>

      {/* Salary range */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">Min salary</label>
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
          <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">Max salary</label>
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
        <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">Skill</label>
        <div className={gradientWrap}>
          <select className={selectBase} value={fields.skill} onChange={(e) => onChange("skill", e.target.value)}>
            {SKILLS.map((s) => (
              <option key={s} value={s}>{s || "Any"}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Trait */}
      <div className="flex flex-col">
        <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">Trait</label>
        <div className={gradientWrap}>
          <select className={selectBase} value={fields.traits} onChange={(e) => onChange("traits", e.target.value)}>
            {TRAITS.map((t) => (
              <option key={t} value={t}>{t || "Any"}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Compatibility and availability */}
      <div className="flex flex-col">
        <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">Works with kids</label>
        <div className={gradientWrap}>
          <select className={selectBase} value={fields.can_work_with_kids} onChange={(e) => onChange("can_work_with_kids", e.target.value)}>
            <option value="">Any</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
      </div>
      <div className="flex flex-col">
        <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">Works with pets</label>
        <div className={gradientWrap}>
          <select className={selectBase} value={fields.can_work_with_pets} onChange={(e) => onChange("can_work_with_pets", e.target.value)}>
            <option value="">Any</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
      </div>
      <div className="flex flex-col">
        <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">Live-in</label>
        <div className={gradientWrap}>
          <select className={selectBase} value={fields.offers_live_in} onChange={(e) => onChange("offers_live_in", e.target.value)}>
            <option value="">Any</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
      </div>
      <div className="flex flex-col">
        <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">Day worker</label>
        <div className={gradientWrap}>
          <select className={selectBase} value={fields.offers_day_worker} onChange={(e) => onChange("offers_day_worker", e.target.value)}>
            <option value="">Any</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
      </div>
      <div className="flex flex-col">
        <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">Available from</label>
        <input
          type="date"
          className={inputBase}
          value={fields.available_from}
          onChange={(e) => onChange("available_from", e.target.value)}
        />
      </div>

      {/* Min rating */}
      <div className="flex flex-col">
        <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">Min rating</label>
        <div className={gradientWrap}>
          <select className={selectBase} value={fields.min_rating} onChange={(e) => onChange("min_rating", e.target.value)}>
            {["", "5", "4", "3", "2", "1"].map((r) => (
              <option key={r} value={r}>{r ? `${r}+` : "Any"}</option>
            ))}
          </select>
        </div>
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


