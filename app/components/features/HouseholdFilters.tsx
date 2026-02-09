import React from "react";

export type HouseholdSearchFields = {
  town?: string;
  house_size?: string;
  verified?: string; // "", "true", "false"
  has_kids?: string; // "", "true", "false"
  has_pets?: string; // "", "true", "false"
  type_of_househelp?: string; // "", "live_in", "day_worker"
  available_from?: string;
};

interface Props {
  fields: HouseholdSearchFields;
  onChange: (name: keyof HouseholdSearchFields, value: string) => void;
  onSearch: () => void;
  onClear: () => void;
}

export default function HouseholdFilters({ fields, onChange, onSearch, onClear }: Props) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Has Kids</label>
          <select
            value={fields.has_kids || ""}
            onChange={(e) => onChange("has_kids", e.target.value)}
            className="w-full px-4 py-1.5 rounded-xl text-base focus:outline-none focus:ring-4 focus:ring-purple-300 shadow-md"
          >
            <option value="">Any</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Has Pets</label>
          <select
            value={fields.has_pets || ""}
            onChange={(e) => onChange("has_pets", e.target.value)}
            className="w-full px-4 py-1.5 rounded-xl text-base focus:outline-none focus:ring-4 focus:ring-purple-300 shadow-md"
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
          <select
            value={fields.type_of_househelp || ""}
            onChange={(e) => onChange("type_of_househelp", e.target.value)}
            className="w-full px-4 py-1.5 rounded-xl text-base focus:outline-none focus:ring-4 focus:ring-purple-300 shadow-md"
          >
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
            className="w-full px-4 py-1.5 rounded-xl text-base focus:outline-none focus:ring-4 focus:ring-purple-300 shadow-md"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <button onClick={onClear} className="px-4 py-1 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/10">Clear</button>
        <button onClick={onSearch} className="px-6 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all">Apply</button>
      </div>
    </div>
  );
}
