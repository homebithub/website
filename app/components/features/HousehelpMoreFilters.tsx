import React, { useMemo, useState } from "react";
import {
  PRIMARY_LANGUAGES,
  ALL_LANGUAGES,
  PROFILE_STATUS,
  GENDERS,
  SALARY_FREQUENCIES,
  SALARY_FREQUENCY_LABELS,
  SKILLS,
} from "~/constants/profileOptions";
import SearchableTownSelect from "~/components/ui/SearchableTownSelect";

export type HousehelpMoreFilterFields = {
  status?: string;
  gender?: string;
  town?: string;
  salary_frequency?: string;
  skill?: string;
  traits?: string;
  min_rating?: string;
  salary_min?: string;
  salary_max?: string;
  can_work_with_kids?: string; // "", "true", "false"
  can_work_with_pets?: string; // "", "true", "false"
  offers_live_in?: string; // "", "true", "false"
  offers_day_worker?: string; // "", "true", "false"
  available_from?: string;
  language?: string; // Language filter
  experience?: string; // Years of experience
  min_age?: string; // Minimum age
  max_age?: string; // Maximum age
};

interface Props {
  fields: HousehelpMoreFilterFields & Record<string, string>;
  onChange: (name: string, value: string) => void;
  onSearch: () => void;
  onClear: () => void;
}

export default function HousehelpMoreFilters({ fields, onChange, onSearch, onClear }: Props) {
  const EXPERIENCE_OPTIONS = [
    { value: "", label: "Any" },
    { value: "1", label: "1+ years" },
    { value: "2", label: "2+ years" },
    { value: "5", label: "5+ years" },
    { value: "10", label: "10+ years" },
  ];
  const TRAITS = ["", "honest", "patient", "punctual", "organized", "friendly", "calm", "proactive"];
  const [openSections, setOpenSections] = useState({
    basics: true,
    compensation: true,
    compatibility: true,
  });

  const minAge = parseInt(fields.min_age || "18");
  const maxAge = parseInt(fields.max_age || "65");

  const inputCls =
    "w-full h-12 px-4 py-1.5 rounded-xl text-base bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-300 shadow-sm";
  const selectCls = `${inputCls} appearance-none`;

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
                <label className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Status</label>
                <select value={fields.status || ""} onChange={(e) => onChange("status", e.target.value)} className={selectCls}>
                  <option value="">Any</option>
                  {PROFILE_STATUS.map((status) => (
                    <option key={status} value={status}>{status[0].toUpperCase() + status.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col">
                <label className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Gender</label>
                <select value={fields.gender || ""} onChange={(e) => onChange("gender", e.target.value)} className={selectCls}>
                  <option value="">Any</option>
                  {GENDERS.map((gender) => (
                    <option key={gender} value={gender.toLowerCase()}>{gender}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Town</label>
                <SearchableTownSelect
                  value={fields.town || ""}
                  onChange={(value) => onChange("town", value)}
                  target="househelps"
                  buttonClassName={selectCls}
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Type of Househelp</label>
                <select value={typeValue} onChange={(e) => setType(e.target.value)} className={selectCls}>
                  <option value="">Any</option>
                  <option value="live_in">Live-in</option>
                  <option value="day_worker">Day worker</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Available From</label>
                <input type="date" value={fields.available_from || ""} onChange={(e) => onChange("available_from", e.target.value)} className={inputCls} />
              </div>
              <div className="flex flex-col">
                <label className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Experience</label>
                <select value={fields.experience || ""} onChange={(e) => onChange("experience", e.target.value)} className={selectCls}>
                  {EXPERIENCE_OPTIONS.map((option) => (
                    <option key={option.value || "any"} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Language</label>
                <select value={fields.language || ""} onChange={(e) => onChange("language", e.target.value)} className={selectCls}>
                  <option value="">Any</option>
                  {PRIMARY_LANGUAGES.map((language) => (
                    <option key={language} value={language}>{language}</option>
                  ))}
                  {ALL_LANGUAGES.filter((language) => !PRIMARY_LANGUAGES.includes(language as any)).map((language) => (
                    <option key={language} value={language}>{language}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col">
                <label className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Skills / Can Help With</label>
                <select value={fields.skill || ""} onChange={(e) => onChange("skill", e.target.value)} className={selectCls}>
                  <option value="">Any</option>
                  {SKILLS.map((skill) => (
                    <option key={skill} value={skill.toLowerCase()}>{skill}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Trait</label>
                <select value={fields.traits || ""} onChange={(e) => onChange("traits", e.target.value)} className={selectCls}>
                  {TRAITS.map((trait) => (
                    <option key={trait || "any"} value={trait}>{trait ? trait[0].toUpperCase() + trait.slice(1) : "Any"}</option>
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
          onClick={() => setOpenSections((prev) => ({ ...prev, compensation: !prev.compensation }))}
          className="w-full px-4 py-3 flex items-center justify-between text-left"
        >
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Compensation & Rating</span>
          <span className="text-gray-500">{openSections.compensation ? "−" : "+"}</span>
        </button>
        {openSections.compensation && (
          <div className="px-4 pb-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Salary Frequency</label>
                <select value={fields.salary_frequency || ""} onChange={(e) => onChange("salary_frequency", e.target.value)} className={selectCls}>
                  <option value="">Any</option>
                  {SALARY_FREQUENCIES.map((frequency) => (
                    <option key={frequency} value={frequency}>{SALARY_FREQUENCY_LABELS[frequency]}</option>
                  ))}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Min Salary</label>
                <input type="number" min="0" value={fields.salary_min || ""} onChange={(e) => onChange("salary_min", e.target.value)} placeholder="e.g. 15000" className={inputCls} />
              </div>
              <div className="flex flex-col">
                <label className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Max Salary</label>
                <input type="number" min="0" value={fields.salary_max || ""} onChange={(e) => onChange("salary_max", e.target.value)} placeholder="e.g. 45000" className={inputCls} />
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
                <label className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Works with Kids</label>
                <select value={fields.can_work_with_kids || ""} onChange={(e) => onChange("can_work_with_kids", e.target.value)} className={selectCls}>
                  <option value="">Any</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Works with Pets</label>
                <select value={fields.can_work_with_pets || ""} onChange={(e) => onChange("can_work_with_pets", e.target.value)} className={selectCls}>
                  <option value="">Any</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col">
              <label className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Age Range: {minAge} - {maxAge} years</label>
              <div className="px-2 py-4">
                <div className="relative">
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full relative">
                    <div
                      className="absolute h-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"
                      style={{
                        left: `${((minAge - 18) / (65 - 18)) * 100}%`,
                        right: `${100 - ((maxAge - 18) / (65 - 18)) * 100}%`,
                      }}
                    />
                  </div>
                  <input
                    type="range"
                    min="18"
                    max="65"
                    value={minAge}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (val <= maxAge) {
                        onChange("min_age", e.target.value);
                      }
                    }}
                    className="absolute w-full top-0 h-2 bg-transparent appearance-none cursor-pointer z-30"
                  />
                  <input
                    type="range"
                    min="18"
                    max="65"
                    value={maxAge}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (val >= minAge) {
                        onChange("max_age", e.target.value);
                      }
                    }}
                    className="absolute w-full top-0 h-2 bg-transparent appearance-none cursor-pointer z-30"
                  />
                </div>
              </div>
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
