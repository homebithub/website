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
import CustomSelect from "~/components/ui/CustomSelect";

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
                <CustomSelect
                  value={fields.status || ""}
                  onChange={(val) => onChange("status", val)}
                  options={[{ value: "", label: "Any" }, ...PROFILE_STATUS.map((status) => ({ value: status, label: status[0].toUpperCase() + status.slice(1) }))]}
                  placeholder="Any"
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Gender</label>
                <CustomSelect
                  value={fields.gender || ""}
                  onChange={(val) => onChange("gender", val)}
                  options={[{ value: "", label: "Any" }, ...GENDERS.map((gender) => ({ value: gender.toLowerCase(), label: gender }))]}
                  placeholder="Any"
                />
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
                <CustomSelect
                  value={typeValue}
                  onChange={(val) => setType(val)}
                  options={[
                    { value: "", label: "Any" },
                    { value: "live_in", label: "Live-in" },
                    { value: "day_worker", label: "Day worker" },
                  ]}
                  placeholder="Any"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Available From</label>
                <input type="date" value={fields.available_from || ""} onChange={(e) => onChange("available_from", e.target.value)} className={inputCls} />
              </div>
              <div className="flex flex-col">
                <label className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Experience</label>
                <CustomSelect
                  value={fields.experience || ""}
                  onChange={(val) => onChange("experience", val)}
                  options={EXPERIENCE_OPTIONS}
                  placeholder="Any"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Language</label>
                <CustomSelect
                  value={fields.language || ""}
                  onChange={(val) => onChange("language", val)}
                  options={[
                    { value: "", label: "Any" },
                    ...PRIMARY_LANGUAGES.map((language) => ({ value: language, label: language })),
                    ...ALL_LANGUAGES.filter((language) => !PRIMARY_LANGUAGES.includes(language as any)).map((language) => ({ value: language, label: language })),
                  ]}
                  placeholder="Any"
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Skills / Can Help With</label>
                <CustomSelect
                  value={fields.skill || ""}
                  onChange={(val) => onChange("skill", val)}
                  options={[{ value: "", label: "Any" }, ...SKILLS.map((skill) => ({ value: skill.toLowerCase(), label: skill }))]}
                  placeholder="Any"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Trait</label>
                <CustomSelect
                  value={fields.traits || ""}
                  onChange={(val) => onChange("traits", val)}
                  options={TRAITS.map((trait) => ({ value: trait, label: trait ? trait[0].toUpperCase() + trait.slice(1) : "Any" }))}
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
                <CustomSelect
                  value={fields.salary_frequency || ""}
                  onChange={(val) => onChange("salary_frequency", val)}
                  options={[{ value: "", label: "Any" }, ...SALARY_FREQUENCIES.map((frequency) => ({ value: frequency, label: SALARY_FREQUENCY_LABELS[frequency] }))]}
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
                <CustomSelect
                  value={fields.can_work_with_kids || ""}
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
                <label className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Works with Pets</label>
                <CustomSelect
                  value={fields.can_work_with_pets || ""}
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
