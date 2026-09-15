import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { CalendarDays, Check, Pencil, Power } from "lucide-react";
import { openForWorkService, profileFeatureService, profileService, userProfilePicksService } from "~/services/grpc/authServices";
import { SuccessAlert } from "~/components/ui/SuccessAlert";
import {
  formatOnboardingBudgetRangeWithFrequency,
  normalizeOnboardingAmountFromStorage,
} from "~/utils/onboardingCompensation";
import { FormError } from '~/components/FormError';
import { useBodyScrollLock } from '~/hooks/useBodyScrollLock';
import { buildServiceProviderListingDefaults } from '~/utils/listingProfileDefaults';
import { getStoredUser, getStoredUserProfileId } from '~/utils/authStorage';

const JOB_TYPES = [
  { value: "live_in", label: "Live-in" },
  { value: "day_worker", label: "Day worker" },
  { value: "part_time", label: "Part-time" },
  { value: "full_time", label: "Full-time" },
];

const toDateInputValue = (value: unknown): string => {
  if (!value) return "";
  const text = String(value).split("T")[0];
  const parsed = new Date(`${text}T00:00:00`);
  if (Number.isNaN(parsed.getTime()) || parsed.getFullYear() < 1900) return "";
  return text;
};

const todayInputValue = () => new Date().toISOString().split("T")[0];

const toSalaryInputValue = (value: unknown, frequency?: string): string => {
  const normalized = normalizeOnboardingAmountFromStorage(value as string | number | null, frequency);
  return normalized > 0 ? String(normalized) : "";
};

interface OpenForWorkModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing?: Record<string, any> | null;
  onSaved?: () => void;
  readOnly?: boolean;
  onEdit?: () => void;
  onRemove?: () => void;
}

const listingId = (listing?: Record<string, any> | null): string => {
  const candidates = [
    listing?.listing_id,
    listing?.listingId,
    listing?.id,
    listing?.data?.listing_id,
    listing?.data?.listingId,
    listing?.data?.id,
  ];
  return String(candidates.find((value) => /^\d+$/.test(String(value ?? ""))) ?? "");
};

const displayJobType = (value: string) =>
  JOB_TYPES.find((type) => type.value === value)?.label || value.replace(/_/g, " ");

export default function OpenForWorkModal({ isOpen, onClose, listing, onSaved, readOnly = false, onEdit, onRemove }: OpenForWorkModalProps) {
  useBodyScrollLock(isOpen);
  const [jobTypes, setJobTypes] = useState<string[]>([]);
  const [availableFrom, setAvailableFrom] = useState("");
  const [canWorkWithKids, setCanWorkWithKids] = useState(false);
  const [canWorkWithPets, setCanWorkWithPets] = useState(false);
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [salaryFrequency, setSalaryFrequency] = useState("monthly");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [prefilled, setPrefilled] = useState(false);
  const [profileHighlights, setProfileHighlights] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (!isOpen) return;
    setJobTypes(Array.isArray(listing?.job_types) ? listing.job_types : []);
    setAvailableFrom(toDateInputValue(listing?.available_from));
    setCanWorkWithKids(Boolean(listing?.can_work_with_kids));
    setCanWorkWithPets(Boolean(listing?.can_work_with_pets));
    setSalaryFrequency(listing?.salary_frequency || "monthly");
    setSalaryMin(toSalaryInputValue(listing?.salary_min, listing?.salary_frequency));
    setSalaryMax(toSalaryInputValue(listing?.salary_max, listing?.salary_frequency));
    setDescription(String(listing?.description || ""));
    setProfileHighlights({
      languages: Array.isArray(listing?.languages) ? listing.languages : [],
      skills: Array.isArray(listing?.skills) ? listing.skills : [],
      certifications: Array.isArray(listing?.certifications) ? listing.certifications : [],
    });
    setError("");
    setSuccess("");
  }, [isOpen, listing]);

  useEffect(() => {
    if (!isOpen || listing?.id) return;
    let cancelled = false;
    profileService.getCurrentServiceProviderProfile('')
      .then(async (raw) => {
        if (cancelled) return;
        const profile = raw?.data ?? raw ?? {};
        const storedUser = getStoredUser() || {};
        const catalogueProfileId = String(
          profile.profile_id || profile.profileId || profile.profile?.id ||
          storedUser.profile_id || storedUser.profileId ||
          window.localStorage.getItem('profile_id') || '',
        );
        const userProfileId = String(
          profile.user_profile_id || profile.userProfileId || profile.user_profile?.id ||
          getStoredUserProfileId() || '',
        );
        const [featuresResult, picksResult] = await Promise.allSettled([
          catalogueProfileId ? profileFeatureService.getProfileFeatures(catalogueProfileId) : Promise.resolve([]),
          userProfileId ? userProfilePicksService.listPicks(userProfileId) : Promise.resolve([]),
        ]);
        if (cancelled) return;
        const features = featuresResult.status === 'fulfilled' ? featuresResult.value : [];
        const picks = picksResult.status === 'fulfilled' ? picksResult.value : [];
        const defaults = buildServiceProviderListingDefaults(profile, features, picks);
        if (defaults.jobTypes.length > 0) setJobTypes(defaults.jobTypes);
        setAvailableFrom(toDateInputValue(defaults.availableFrom));
        setCanWorkWithKids(defaults.canWorkWithKids);
        setCanWorkWithPets(defaults.canWorkWithPets);
        setSalaryFrequency(defaults.salaryFrequency);
        setSalaryMin(toSalaryInputValue(defaults.salaryMin, defaults.salaryFrequency));
        setSalaryMax(toSalaryInputValue(defaults.salaryMax, defaults.salaryFrequency));
        setDescription((current) => current.trim() ? current : defaults.description);
        setProfileHighlights(defaults.highlights);
        setPrefilled(true);
      })
      .catch(() => {
        // A listing can still be created when an older profile has no reusable
        // details; the form simply remains empty.
      });
    return () => { cancelled = true; };
  }, [isOpen, listing?.id]);

  if (!isOpen) return null;
  const isLive = String(listing?.status ?? "active").toLowerCase() === "active";

  const toggleJobType = (value: string) => {
    setJobTypes((prev) =>
      prev.includes(value) ? prev.filter((type) => type !== value) : [...prev, value]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (jobTypes.length === 0) {
      setError("Select at least one job type.");
      return;
    }

    const payload: Record<string, any> = {
      job_types: jobTypes,
      available_from: availableFrom || null,
      can_work_with_kids: canWorkWithKids,
      can_work_with_pets: canWorkWithPets,
      status: "active",
      languages: profileHighlights.languages || [],
      skills: profileHighlights.skills || [],
      certifications: profileHighlights.certifications || [],
      description: description.trim(),
    };

    if (salaryMin || salaryMax) {
      payload.salary_min = salaryMin ? Number(salaryMin) : undefined;
      payload.salary_max = salaryMax ? Number(salaryMax) : undefined;
    }
    payload.salary_frequency = salaryFrequency || undefined;

    setLoading(true);
    try {
      const id = listingId(listing);
      if (listing) {
        if (!id) throw new Error("We could not identify this listing. Close this window and try again.");
        await openForWorkService.updateOpenForWork(id, "", payload);
      } else {
        await openForWorkService.createOpenForWork("", payload);
      }
      setSuccess("Open-for-work listing saved.");
      onSaved?.();
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Failed to save open-for-work listing");
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="hb-modal-shell w-screen max-w-[100vw] overflow-x-hidden">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="hb-modal-panel flex max-h-full min-w-0 flex-col overflow-hidden sm:mx-4">
        <div className="sticky top-0 z-10 flex min-w-0 shrink-0 items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-4 dark:border-purple-500/20 dark:bg-[#13131a] sm:px-6">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            {readOnly ? "Your Open for Work details" : listing ? "Update Open for Work" : "Go Open for Work"}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close Open for Work" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {readOnly ? (
          <div className="min-h-0 min-w-0 max-w-full flex-1 space-y-4 overflow-y-auto overflow-x-hidden p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-6">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100">
              <p className="font-semibold">Open for work is {isLive ? "active" : "off"}</p>
              <p className="mt-0.5 opacity-80">{isLive ? "Households can find you using these availability details." : "Your details are saved, but households cannot currently find this listing."}</p>
            </div>

            <section>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Job types</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(Array.isArray(listing?.job_types) ? listing.job_types : []).map((type: string) => (
                  <span key={type} className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold capitalize text-purple-800 dark:bg-purple-500/20 dark:text-purple-100">{displayJobType(type)}</span>
                ))}
              </div>
            </section>

            <section>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">About me</p>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-gray-800 dark:text-gray-200">
                {listing?.description || "No introduction added yet."}
              </p>
            </section>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-gray-200 p-3 dark:border-white/10">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Available from</p>
                <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white"><CalendarDays className="h-4 w-4 text-purple-500" />{toDateInputValue(listing?.available_from) ? new Date(`${toDateInputValue(listing?.available_from)}T00:00:00`).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" }) : "Flexible"}</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-3 dark:border-white/10">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Salary expectation</p>
                <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                  {formatOnboardingBudgetRangeWithFrequency(
                    listing?.salary_min,
                    listing?.salary_max,
                    listing?.salary_frequency,
                  )}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-gray-700 dark:text-gray-200">
              <p className="flex items-center gap-2"><Check className={`h-4 w-4 ${listing?.can_work_with_kids ? "text-emerald-500" : "text-gray-400"}`} />{listing?.can_work_with_kids ? "Comfortable working with kids" : "Not marked as comfortable with kids"}</p>
              <p className="flex items-center gap-2"><Check className={`h-4 w-4 ${listing?.can_work_with_pets ? "text-emerald-500" : "text-gray-400"}`} />{listing?.can_work_with_pets ? "Comfortable working with pets" : "Not marked as comfortable with pets"}</p>
            </div>

            <div className="sticky bottom-0 -mx-4 flex gap-3 border-t border-gray-200 bg-white px-4 pt-4 dark:border-white/10 dark:bg-[#13131a] sm:-mx-6 sm:px-6">
              <button type="button" onClick={onEdit} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2.5 text-xs font-semibold text-white"><Pencil className="h-4 w-4" />Edit</button>
              {isLive ? (
                <button type="button" onClick={onRemove} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-400 px-4 py-2.5 text-xs font-semibold text-red-700 dark:text-red-200"><Power className="h-4 w-4" />Turn off</button>
              ) : null}
            </div>
          </div>
        ) : <form onSubmit={handleSubmit} className="min-h-0 min-w-0 max-w-full flex-1 space-y-5 overflow-y-auto overflow-x-hidden p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-6">
          {success && <SuccessAlert message={success} />}
          <p className="rounded-xl border border-purple-200 bg-purple-50 px-3 py-2 text-xs text-purple-800 dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-100">
            Open for Work makes you searchable by households using the skills, availability and preferences below. You can have one listing at a time, and it stays online only while your subscription is active.
          </p>
          {prefilled && !listing?.id ? (
            <p className="rounded-xl bg-purple-50 px-3 py-2 text-xs text-purple-800 dark:bg-purple-500/10 dark:text-purple-100">
              We started with your profile preferences. Changes here apply only to this Open for Work listing.
            </p>
          ) : null}
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-200">Job Types</label>
            <div className="mt-2 grid min-w-0 grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              {JOB_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => toggleJobType(type.value)}
                  className={`min-w-0 w-full px-2 py-1.5 rounded-full text-xs font-semibold border transition shadow-sm sm:w-auto sm:px-3 ${
                    jobTypes.includes(type.value)
                      ? "bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-600 text-white border-transparent shadow-[0_0_12px_rgba(168,85,247,0.45)]"
                      : "bg-white/80 dark:bg-[#100a1c] text-gray-600 dark:text-gray-300 border-purple-500/20 hover:border-purple-500/40 hover:bg-purple-500/10"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-200">Available From</label>
            <input
              type="date"
              value={availableFrom}
              min={todayInputValue()}
              onChange={(e) => setAvailableFrom(e.target.value)}
              className="mt-2 h-11 min-w-0 max-w-full w-full px-3 rounded-xl border border-gray-200 dark:border-purple-500/30 bg-white dark:bg-[#0f0b1a] text-[16px] text-gray-900 dark:text-gray-100 sm:px-4 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="open-for-work-description" className="text-xs font-semibold text-gray-700 dark:text-gray-200">Introduce yourself to potential employers</label>
            <textarea
              id="open-for-work-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              maxLength={1000}
              placeholder="Tell potential employers about yourself, your experience, the work you enjoy, and what they can expect from you."
              className="mt-2 min-h-28 w-full min-w-0 resize-y rounded-xl border border-gray-200 bg-white px-3 py-3 text-[16px] text-gray-900 placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-purple-500/30 dark:bg-[#0f0b1a] dark:text-gray-100 sm:px-4 sm:text-sm"
            />
            <div className="mt-1 flex items-start justify-between gap-3 text-[11px] text-gray-500 dark:text-gray-400">
              <span>This introduction appears on your Open for Work listing.</span>
              <span className="shrink-0">{description.length}/1000</span>
            </div>
          </div>

          {Object.values(profileHighlights).some((values) => values.length > 0) ? (
            <div className="rounded-xl border border-purple-100 p-3 dark:border-purple-500/20">
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">Included from your profile</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {Object.values(profileHighlights).flat().slice(0, 10).map((value, index) => (
                  <span key={`${value}-${index}`} className="rounded-full bg-purple-100 px-2.5 py-1 text-[11px] font-semibold text-purple-700 dark:bg-purple-500/20 dark:text-purple-100">{value}</span>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">Edit your profile preferences to change these reusable details.</p>
            </div>
          ) : null}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-200">
              <input
                type="checkbox"
                checked={canWorkWithKids}
                onChange={(e) => setCanWorkWithKids(e.target.checked)}
                className="rounded border-gray-300 text-purple-600"
              />
              Comfortable with kids
            </label>
            <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-200">
              <input
                type="checkbox"
                checked={canWorkWithPets}
                onChange={(e) => setCanWorkWithPets(e.target.checked)}
                className="rounded border-gray-300 text-purple-600"
              />
              Comfortable with pets
            </label>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-200">Salary Expectation</label>
            <div className="mt-2 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="min-w-0">
                <span className="block text-[11px] text-gray-500 dark:text-gray-400 mb-1">Minimum</span>
                <input
                  type="number"
                  min="0"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  placeholder="KES"
                  className="h-11 min-w-0 max-w-full w-full px-3 rounded-xl border border-gray-200 dark:border-purple-500/30 bg-white dark:bg-[#0f0b1a] text-[16px] text-gray-900 dark:text-gray-100 sm:px-4 sm:text-sm"
                />
              </div>
              <div className="min-w-0">
                <span className="block text-[11px] text-gray-500 dark:text-gray-400 mb-1">Maximum</span>
                <input
                  type="number"
                  min="0"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                  placeholder="KES"
                  className="h-11 min-w-0 max-w-full w-full px-3 rounded-xl border border-gray-200 dark:border-purple-500/30 bg-white dark:bg-[#0f0b1a] text-[16px] text-gray-900 dark:text-gray-100 sm:px-4 sm:text-sm"
                />
              </div>
              <div className="min-w-0">
                <span className="block text-[11px] text-gray-500 dark:text-gray-400 mb-1">Rate</span>
                <select
                  value={salaryFrequency}
                  onChange={(e) => setSalaryFrequency(e.target.value)}
                  className="h-11 min-w-0 max-w-full w-full px-3 rounded-xl border border-gray-200 dark:border-purple-500/30 bg-white dark:bg-[#0f0b1a] text-[16px] text-gray-900 dark:text-gray-100 sm:px-4 sm:text-sm"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">
              Share your preferred pay range so households can match you with the right opportunities.
            </p>
          </div>

          <FormError message={error} />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-60"
          >
            {loading ? "Saving..." : listing ? "Save Changes" : "Publish Listing"}
          </button>
        </form>}
      </div>
    </div>,
    document.body
  );
}
