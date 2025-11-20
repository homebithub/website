import React, { useMemo, useState, useRef, useEffect } from "react";
import { PRIMARY_LANGUAGES, ALL_LANGUAGES, EXPERIENCE_LEVELS } from "~/constants/profileOptions";

export type HousehelpMoreFilterFields = {
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
  const [showKidsDropdown, setShowKidsDropdown] = useState(false);
  const [showPetsDropdown, setShowPetsDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showExperienceDropdown, setShowExperienceDropdown] = useState(false);
  
  const kidsDropdownRef = useRef<HTMLDivElement>(null);
  const petsDropdownRef = useRef<HTMLDivElement>(null);
  const typeDropdownRef = useRef<HTMLDivElement>(null);
  const languageDropdownRef = useRef<HTMLDivElement>(null);
  const experienceDropdownRef = useRef<HTMLDivElement>(null);

  const minAge = parseInt(fields.min_age || "18");
  const maxAge = parseInt(fields.max_age || "65");

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (kidsDropdownRef.current && !kidsDropdownRef.current.contains(event.target as Node)) {
        setShowKidsDropdown(false);
      }
      if (petsDropdownRef.current && !petsDropdownRef.current.contains(event.target as Node)) {
        setShowPetsDropdown(false);
      }
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target as Node)) {
        setShowTypeDropdown(false);
      }
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target as Node)) {
        setShowLanguageDropdown(false);
      }
      if (experienceDropdownRef.current && !experienceDropdownRef.current.contains(event.target as Node)) {
        setShowExperienceDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const inputCls =
    "w-full px-4 py-3 rounded-xl text-base bg-white dark:bg-[#13131a] text-gray-900 dark:text-gray-100 border-2 border-transparent focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-300 shadow-md";

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
        {/* Works with Kids */}
        <div className="flex flex-col relative" ref={kidsDropdownRef}>
          <label className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Works with Kids</label>
          <div className="relative">
            <div
              onClick={() => setShowKidsDropdown(!showKidsDropdown)}
              className="w-full h-12 px-4 py-3 rounded-xl text-base bg-white dark:bg-[#13131a] text-gray-900 dark:text-gray-100 border-2 border-transparent focus-within:border-purple-500 shadow-md cursor-pointer flex items-center justify-between"
            >
              <span className={fields.can_work_with_kids ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-300'}>
                {fields.can_work_with_kids === 'true' ? 'Yes' : fields.can_work_with_kids === 'false' ? 'No' : 'Any'}
              </span>
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            {showKidsDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-[#13131a] border-2 border-purple-200 dark:border-purple-500/30 rounded-xl shadow-lg overflow-hidden">
                {[{ value: '', label: 'Any' }, { value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }].map((option) => (
                  <div
                    key={option.value}
                    onClick={() => {
                      onChange('can_work_with_kids', option.value);
                      setShowKidsDropdown(false);
                    }}
                    className="px-4 py-3 hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                  >
                    {option.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Works with Pets */}
        <div className="flex flex-col relative" ref={petsDropdownRef}>
          <label className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Works with Pets</label>
          <div className="relative">
            <div
              onClick={() => setShowPetsDropdown(!showPetsDropdown)}
              className="w-full h-12 px-4 py-3 rounded-xl text-base bg-white dark:bg-[#13131a] text-gray-900 dark:text-gray-100 border-2 border-transparent focus-within:border-purple-500 shadow-md cursor-pointer flex items-center justify-between"
            >
              <span className={fields.can_work_with_pets ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-300'}>
                {fields.can_work_with_pets === 'true' ? 'Yes' : fields.can_work_with_pets === 'false' ? 'No' : 'Any'}
              </span>
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            {showPetsDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-[#13131a] border-2 border-purple-200 dark:border-purple-500/30 rounded-xl shadow-lg overflow-hidden">
                {[{ value: '', label: 'Any' }, { value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }].map((option) => (
                  <div
                    key={option.value}
                    onClick={() => {
                      onChange('can_work_with_pets', option.value);
                      setShowPetsDropdown(false);
                    }}
                    className="px-4 py-3 hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                  >
                    {option.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Type of Househelp */}
        <div className="flex flex-col relative" ref={typeDropdownRef}>
          <label className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Type of Househelp</label>
          <div className="relative">
            <div
              onClick={() => setShowTypeDropdown(!showTypeDropdown)}
              className="w-full h-12 px-4 py-3 rounded-xl text-base bg-white dark:bg-[#13131a] text-gray-900 dark:text-gray-100 border-2 border-transparent focus-within:border-purple-500 shadow-md cursor-pointer flex items-center justify-between"
            >
              <span className={typeValue ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-300'}>
                {typeValue === 'live_in' ? 'Live-in' : typeValue === 'day_worker' ? 'Day worker' : 'Any'}
              </span>
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            {showTypeDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-[#13131a] border-2 border-purple-200 dark:border-purple-500/30 rounded-xl shadow-lg overflow-hidden">
                {[{ value: '', label: 'Any' }, { value: 'live_in', label: 'Live-in' }, { value: 'day_worker', label: 'Day worker' }].map((option) => (
                  <div
                    key={option.value}
                    onClick={() => {
                      setType(option.value);
                      setShowTypeDropdown(false);
                    }}
                    className="px-4 py-3 hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                  >
                    {option.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Available From */}
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Language */}
        <div className="flex flex-col relative" ref={languageDropdownRef}>
          <label className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Language</label>
          <div className="relative">
            <div
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
              className="w-full h-12 px-4 py-3 rounded-xl text-base bg-white dark:bg-[#13131a] text-gray-900 dark:text-gray-100 border-2 border-transparent focus-within:border-purple-500 shadow-md cursor-pointer flex items-center justify-between"
            >
              <span className={fields.language ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-300'}>
                {fields.language || 'Any'}
              </span>
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            {showLanguageDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-[#13131a] border-2 border-purple-200 dark:border-purple-500/30 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                <div
                  onClick={() => {
                    onChange('language', '');
                    setShowLanguageDropdown(false);
                  }}
                  className="px-4 py-3 hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-gray-800"
                >
                  Any
                </div>
                {PRIMARY_LANGUAGES.map((lang) => (
                  <div
                    key={lang}
                    onClick={() => {
                      onChange('language', lang);
                      setShowLanguageDropdown(false);
                    }}
                    className="px-4 py-3 hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-gray-800"
                  >
                    {lang}
                  </div>
                ))}
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50">Other Languages</div>
                {ALL_LANGUAGES.filter(lang => !PRIMARY_LANGUAGES.includes(lang as any)).map((lang) => (
                  <div
                    key={lang}
                    onClick={() => {
                      onChange('language', lang);
                      setShowLanguageDropdown(false);
                    }}
                    className="px-4 py-3 hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                  >
                    {lang}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Experience */}
        <div className="flex flex-col relative" ref={experienceDropdownRef}>
          <label className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Experience</label>
          <div className="relative">
            <div
              onClick={() => setShowExperienceDropdown(!showExperienceDropdown)}
              className="w-full h-12 px-4 py-3 rounded-xl text-base bg-white dark:bg-[#13131a] text-gray-900 dark:text-gray-100 border-2 border-transparent focus-within:border-purple-500 shadow-md cursor-pointer flex items-center justify-between"
            >
              <span className={fields.experience ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-300'}>
                {fields.experience ? EXPERIENCE_LEVELS.find(l => l.value === fields.experience)?.label : 'Any'}
              </span>
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            {showExperienceDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-[#13131a] border-2 border-purple-200 dark:border-purple-500/30 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                <div
                  onClick={() => {
                    onChange('experience', '');
                    setShowExperienceDropdown(false);
                  }}
                  className="px-4 py-3 hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-gray-800"
                >
                  Any
                </div>
                {EXPERIENCE_LEVELS.map((level) => (
                  <div
                    key={level.value}
                    onClick={() => {
                      onChange('experience', level.value);
                      setShowExperienceDropdown(false);
                    }}
                    className="px-4 py-3 hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                  >
                    {level.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Age Range Slider */}
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
                  onChange('min_age', e.target.value);
                }
              }}
              className="absolute w-full top-0 h-2 bg-transparent appearance-none cursor-pointer z-30"
              style={{
                pointerEvents: 'auto',
              }}
            />
            <input
              type="range"
              min="18"
              max="65"
              value={maxAge}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (val >= minAge) {
                  onChange('max_age', e.target.value);
                }
              }}
              className="absolute w-full top-0 h-2 bg-transparent appearance-none cursor-pointer z-30"
              style={{
                pointerEvents: 'auto',
              }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-2">
        <button
          onClick={onClear}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-50 dark:hover:bg-white/10 transition-all"
        >
          Clear
        </button>
        <button
          onClick={onSearch}
          className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all shadow-lg"
        >
          Apply
        </button>
      </div>
    </div>
  );
}
