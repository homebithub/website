import React from "react";
import type { HousehelpSearchFields } from "~/components/features/HousehelpFilters";
import SearchableTownSelect from "~/components/ui/SearchableTownSelect";
import CustomSelect from "~/components/ui/CustomSelect";

interface Props {
  fields: HousehelpSearchFields;
  onChange: (name: string, value: string) => void;
  onSearch: () => void;
  onClear: () => void;
}

// Option sets aligned with HousehelpFilters
const SKILLS = ["", "cooking", "cleaning", "babysitting", "laundry", "elderly care"];
const TRAITS = ["", "honest", "patient", "punctual", "organized", "friendly"];
const EXPERIENCES = Array.from({ length: 11 }, (_, i) => String(i));
const GENDERS = ["", "male", "female"];
const NANNY_TYPES = ["", "dayburg", "sleeper"];

export default function HousehelpFiltersCompact({ fields, onChange, onSearch, onClear }: Props) {
  const selectClass =
    "w-full px-4 py-1.5 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-purple-300 shadow-md";
  const inputClass =
    "w-full px-4 py-1.5 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-purple-300 shadow-md";

  return (
    <div className="space-y-4">
      {/* Two-column responsive grid, mirroring HouseholdFilters layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="mb-2 text-xs font-semibold text-gray-800 dark:text-gray-200">Status</label>
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
        <div className="flex flex-col">
          <label className="mb-2 text-xs font-semibold text-gray-800 dark:text-gray-200">Nanny type</label>
          <CustomSelect
            value={fields.househelp_type}
            onChange={(val) => onChange("househelp_type", val)}
            options={NANNY_TYPES.map((t) => ({ value: t, label: t || "Any" }))}
            placeholder="Any"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="mb-2 text-xs font-semibold text-gray-800 dark:text-gray-200">Gender</label>
          <CustomSelect
            value={fields.gender}
            onChange={(val) => onChange("gender", val)}
            options={GENDERS.map((g) => ({ value: g, label: g || "Any" }))}
            placeholder="Any"
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-2 text-xs font-semibold text-gray-800 dark:text-gray-200">Experience (min)</label>
          <CustomSelect
            value={fields.experience}
            onChange={(val) => onChange("experience", val)}
            options={EXPERIENCES.map((y) => ({ value: y, label: y }))}
            placeholder="0"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="mb-2 text-xs font-semibold text-gray-800 dark:text-gray-200">Town</label>
          <SearchableTownSelect
            value={fields.town}
            onChange={(value) => onChange("town", value)}
            target="househelps"
            buttonClassName={selectClass}
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-2 text-xs font-semibold text-gray-800 dark:text-gray-200">Salary frequency</label>
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
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="mb-2 text-xs font-semibold text-gray-800 dark:text-gray-200">Min salary</label>
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
          <label className="mb-2 text-xs font-semibold text-gray-800 dark:text-gray-200">Max salary</label>
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
          <label className="mb-2 text-xs font-semibold text-gray-800 dark:text-gray-200">Skill</label>
          <CustomSelect
            value={fields.skill}
            onChange={(val) => onChange("skill", val)}
            options={SKILLS.map((s) => ({ value: s, label: s || "Any" }))}
            placeholder="Any"
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-2 text-xs font-semibold text-gray-800 dark:text-gray-200">Trait</label>
          <CustomSelect
            value={fields.traits}
            onChange={(val) => onChange("traits", val)}
            options={TRAITS.map((t) => ({ value: t, label: t || "Any" }))}
            placeholder="Any"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="mb-2 text-xs font-semibold text-gray-800 dark:text-gray-200">Works with kids</label>
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
          <label className="mb-2 text-xs font-semibold text-gray-800 dark:text-gray-200">Works with pets</label>
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
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="mb-2 text-xs font-semibold text-gray-800 dark:text-gray-200">Live-in</label>
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
          <label className="mb-2 text-xs font-semibold text-gray-800 dark:text-gray-200">Day worker</label>
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
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="mb-2 text-xs font-semibold text-gray-800 dark:text-gray-200">Available from</label>
          <input
            type="date"
            className={inputClass}
            value={fields.available_from}
            onChange={(e) => onChange("available_from", e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-2 text-xs font-semibold text-gray-800 dark:text-gray-200">Min rating</label>
          <CustomSelect
            value={fields.min_rating}
            onChange={(val) => onChange("min_rating", val)}
            options={["", "5", "4", "3", "2", "1"].map((r) => ({ value: r, label: r ? `${r}+` : "Any" }))}
            placeholder="Any"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <button
          onClick={onClear}
          className="px-4 py-1 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/10"
        >
          Clear
        </button>
        <button
          onClick={onSearch}
          className="px-6 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all"
        >
          Apply
        </button>
      </div>
    </div>
  );
}
