import React from "react";
import type { HousehelpSearchFields } from "~/components/features/HousehelpFilters";

interface Props {
  fields: HousehelpSearchFields;
  onChange: (name: string, value: string) => void;
  onSearch: () => void;
  onClear: () => void;
}

// Option sets aligned with HousehelpFilters
const TOWNS = ["", "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Thika"];
const SKILLS = ["", "cooking", "cleaning", "babysitting", "laundry", "elderly care"];
const TRAITS = ["", "honest", "patient", "punctual", "organized", "friendly"];
const EXPERIENCES = Array.from({ length: 11 }, (_, i) => String(i));
const GENDERS = ["", "male", "female"];
const NANNY_TYPES = ["", "dayburg", "sleeper"];

export default function HousehelpFiltersCompact({ fields, onChange, onSearch, onClear }: Props) {
  const selectClass =
    "w-full px-4 py-3 rounded-xl text-base focus:outline-none focus:ring-4 focus:ring-purple-300 shadow-md";
  const inputClass =
    "w-full px-4 py-3 rounded-xl text-base focus:outline-none focus:ring-4 focus:ring-purple-300 shadow-md";

  return (
    <div className="space-y-4">
      {/* Two-column responsive grid, mirroring HouseholdFilters layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Status</label>
          <select className={selectClass} value={fields.status} onChange={(e) => onChange("status", e.target.value)}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Nanny type</label>
          <select
            className={selectClass}
            value={fields.househelp_type}
            onChange={(e) => onChange("househelp_type", e.target.value)}
          >
            {NANNY_TYPES.map((t) => (
              <option key={t} value={t}>
                {t || "Any"}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Gender</label>
          <select className={selectClass} value={fields.gender} onChange={(e) => onChange("gender", e.target.value)}>
            {GENDERS.map((g) => (
              <option key={g} value={g}>
                {g || "Any"}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Experience (min)</label>
          <select
            className={selectClass}
            value={fields.experience}
            onChange={(e) => onChange("experience", e.target.value)}
          >
            {EXPERIENCES.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Town</label>
          <select className={selectClass} value={fields.town} onChange={(e) => onChange("town", e.target.value)}>
            {TOWNS.map((t) => (
              <option key={t} value={t}>
                {t || "Any"}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Salary frequency</label>
          <select
            className={selectClass}
            value={fields.salary_frequency}
            onChange={(e) => onChange("salary_frequency", e.target.value)}
          >
            <option value="monthly">Monthly</option>
            <option value="weekly">Weekly</option>
            <option value="daily">Daily</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Min salary</label>
          <input
            type="number"
            min="0"
            className={inputClass}
            value={fields.salary_min}
            onChange={(e) => onChange("salary_min", e.target.value)}
            placeholder="e.g. 15000"
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Max salary</label>
          <input
            type="number"
            min="0"
            className={inputClass}
            value={fields.salary_max}
            onChange={(e) => onChange("salary_max", e.target.value)}
            placeholder="e.g. 35000"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Skill</label>
          <select className={selectClass} value={fields.skill} onChange={(e) => onChange("skill", e.target.value)}>
            {SKILLS.map((s) => (
              <option key={s} value={s}>
                {s || "Any"}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Trait</label>
          <select className={selectClass} value={fields.traits} onChange={(e) => onChange("traits", e.target.value)}>
            {TRAITS.map((t) => (
              <option key={t} value={t}>
                {t || "Any"}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Works with kids</label>
          <select
            className={selectClass}
            value={fields.can_work_with_kids}
            onChange={(e) => onChange("can_work_with_kids", e.target.value)}
          >
            <option value="">Any</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Works with pets</label>
          <select
            className={selectClass}
            value={fields.can_work_with_pets}
            onChange={(e) => onChange("can_work_with_pets", e.target.value)}
          >
            <option value="">Any</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Live-in</label>
          <select
            className={selectClass}
            value={fields.offers_live_in}
            onChange={(e) => onChange("offers_live_in", e.target.value)}
          >
            <option value="">Any</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Day worker</label>
          <select
            className={selectClass}
            value={fields.offers_day_worker}
            onChange={(e) => onChange("offers_day_worker", e.target.value)}
          >
            <option value="">Any</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Available from</label>
          <input
            type="date"
            className={inputClass}
            value={fields.available_from}
            onChange={(e) => onChange("available_from", e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Min rating</label>
          <select className={selectClass} value={fields.min_rating} onChange={(e) => onChange("min_rating", e.target.value)}>
            {["", "5", "4", "3", "2", "1"].map((r) => (
              <option key={r} value={r}>
                {r ? `${r}+` : "Any"}
              </option>
            ))}
          </select>
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
