import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { openForWorkService } from "~/services/grpc/authServices";
import { ErrorAlert } from "~/components/ui/ErrorAlert";
import { SuccessAlert } from "~/components/ui/SuccessAlert";
import { normalizeOnboardingAmountFromStorage } from "~/utils/onboardingCompensation";

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
}

export default function OpenForWorkModal({ isOpen, onClose, listing, onSaved }: OpenForWorkModalProps) {
  const [jobTypes, setJobTypes] = useState<string[]>([]);
  const [availableFrom, setAvailableFrom] = useState("");
  const [canWorkWithKids, setCanWorkWithKids] = useState(false);
  const [canWorkWithPets, setCanWorkWithPets] = useState(false);
  const [status, setStatus] = useState("active");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [salaryFrequency, setSalaryFrequency] = useState("monthly");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setJobTypes(Array.isArray(listing?.job_types) ? listing.job_types : []);
    setAvailableFrom(toDateInputValue(listing?.available_from));
    setCanWorkWithKids(Boolean(listing?.can_work_with_kids));
    setCanWorkWithPets(Boolean(listing?.can_work_with_pets));
    setStatus(listing?.status || "active");
    setSalaryFrequency(listing?.salary_frequency || "monthly");
    setSalaryMin(toSalaryInputValue(listing?.salary_min, listing?.salary_frequency));
    setSalaryMax(toSalaryInputValue(listing?.salary_max, listing?.salary_frequency));
    setError("");
    setSuccess("");
  }, [isOpen, listing]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

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
      status,
    };

    if (salaryMin || salaryMax) {
      payload.salary_min = salaryMin ? Number(salaryMin) : undefined;
      payload.salary_max = salaryMax ? Number(salaryMax) : undefined;
    }
    payload.salary_frequency = salaryFrequency || undefined;

    setLoading(true);
    try {
      if (listing?.id) {
        await openForWorkService.updateOpenForWork(listing.id, "", payload);
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
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-[#13131a] rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-lg sm:mx-4 max-h-[90vh] sm:max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-[#13131a] border-b border-gray-200 dark:border-purple-500/20 px-6 py-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            {listing ? "Update Open for Work" : "Go Open for Work"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {success && <SuccessAlert message={success} />}
          {error && <ErrorAlert message={error} />}

          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-200">Job Types</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {JOB_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => toggleJobType(type.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition shadow-sm ${
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
              className="mt-2 w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-purple-500/30 bg-white dark:bg-[#0f0b1a] text-sm text-gray-900 dark:text-gray-100"
            />
          </div>

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
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-200">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-2 w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-purple-500/30 bg-white dark:bg-[#0f0b1a] text-sm text-gray-900 dark:text-gray-100"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-200">Salary Expectation</label>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="block text-[11px] text-gray-500 dark:text-gray-400 mb-1">Minimum</span>
                <input
                  type="number"
                  min="0"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  placeholder="KES"
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-purple-500/30 bg-white dark:bg-[#0f0b1a] text-sm text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <span className="block text-[11px] text-gray-500 dark:text-gray-400 mb-1">Maximum</span>
                <input
                  type="number"
                  min="0"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                  placeholder="KES"
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-purple-500/30 bg-white dark:bg-[#0f0b1a] text-sm text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <span className="block text-[11px] text-gray-500 dark:text-gray-400 mb-1">Rate</span>
                <select
                  value={salaryFrequency}
                  onChange={(e) => setSalaryFrequency(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-purple-500/30 bg-white dark:bg-[#0f0b1a] text-sm text-gray-900 dark:text-gray-100"
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-60"
          >
            {loading ? "Saving..." : listing ? "Save Changes" : "Publish Listing"}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}
