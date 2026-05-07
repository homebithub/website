import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { jobService } from "~/services/grpc/authServices";
import { ErrorAlert } from "~/components/ui/ErrorAlert";
import { SuccessAlert } from "~/components/ui/SuccessAlert";

const JOB_TYPES = [
  { value: "live_in", label: "Live-in" },
  { value: "day_worker", label: "Day worker" },
  { value: "part_time", label: "Part-time" },
  { value: "full_time", label: "Full-time" },
];

const CURRENCIES = [
  { code: "KES", name: "Kenya Shillings" },
  { code: "USD", name: "United States Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound Sterling" },
  { code: "CNY", name: "Chinese Yuan" },
  { code: "JPY", name: "Japanese Yen" },
  { code: "INR", name: "Indian Rupee" },
  { code: "CAD", name: "Canadian Dollar" },
  { code: "AUD", name: "Australian Dollar" },
  { code: "ZAR", name: "South African Rand" },
];

interface CurrencySelectProps {
  value: string;
  onChange: (next: string) => void;
}

function CurrencySelect({ value, onChange }: CurrencySelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const options = useMemo(() => {
    if (!query.trim()) return CURRENCIES;
    const lowered = query.toLowerCase();
    return CURRENCIES.filter((item) =>
      `${item.code} ${item.name}`.toLowerCase().includes(lowered)
    );
  }, [query]);

  const selected = useMemo(() => CURRENCIES.find((item) => item.code === value), [value]);

  useEffect(() => {
    if (!open) return;
    const handleClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const displayLabel = selected ? `${selected.code} (${selected.name})` : value;

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="mt-2 w-full h-11 px-4 rounded-xl border border-purple-500/40 bg-gradient-to-r from-purple-900/60 via-purple-800/50 to-purple-900/60 text-sm text-gray-100 flex items-center justify-between shadow-[0_0_20px_rgba(147,51,234,0.25)]"
      >
        <span>{displayLabel}</span>
        <svg
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : "rotate-0"}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-10 mt-2 w-full rounded-xl border border-purple-500/40 bg-[#0b0814] shadow-2xl overflow-hidden">
          <div className="p-3 border-b border-purple-500/20">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search currency"
              className="w-full h-10 px-3 rounded-lg bg-[#140f1f] text-sm text-gray-100 border border-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-500/60"
            />
          </div>
          <ul className="max-h-48 overflow-y-auto py-2">
            {options.length === 0 && (
              <li className="px-4 py-2 text-xs text-gray-400">No results</li>
            )}
            {options.map((item) => (
              <li key={item.code}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(item.code);
                    setQuery("");
                    setOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between transition ${
                    item.code === value
                      ? "bg-gradient-to-r from-purple-600/70 to-pink-600/70 text-white"
                      : "text-gray-200 hover:bg-purple-600/20"
                  }`}
                >
                  <span>{item.code}</span>
                  <span className="text-xs text-gray-300 ml-2">{item.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

interface JobPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  job?: Record<string, any> | null;
  onSaved?: () => void;
}

export default function JobPostModal({ isOpen, onClose, job, onSaved }: JobPostModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [jobTypes, setJobTypes] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("");
  const [maxApplicants, setMaxApplicants] = useState("");
  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");
  const [currency, setCurrency] = useState("KES");
  const [frequency, setFrequency] = useState("monthly");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setTitle(job?.title || "");
    setDescription(job?.description || "");
    setLocation(job?.location || "");
    setJobTypes(Array.isArray(job?.job_types) ? job.job_types : []);
    setStartDate(job?.start_date ? String(job.start_date).split("T")[0] : "");
    setMaxApplicants(job?.max_applicants ? String(job.max_applicants) : "");
    setMinSalary(job?.salary_range?.min ? String(job.salary_range.min) : "");
    setMaxSalary(job?.salary_range?.max ? String(job.salary_range.max) : "");
    setCurrency(job?.salary_range?.currency || "KES");
    setFrequency(job?.salary_range?.frequency || "monthly");
    setError("");
    setSuccess("");
  }, [isOpen, job]);

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

    if (!title.trim() || !description.trim() || !location.trim()) {
      setError("Please fill in title, description, and location.");
      return;
    }
    if (jobTypes.length === 0) {
      setError("Select at least one job type.");
      return;
    }

    const payload: Record<string, any> = {
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      job_types: jobTypes,
      start_date: startDate || null,
    };

    if (maxApplicants) {
      payload.max_applicants = Number(maxApplicants);
    }

    if (minSalary || maxSalary) {
      payload.salary_range = {
        min: minSalary ? Number(minSalary) : undefined,
        max: maxSalary ? Number(maxSalary) : undefined,
        currency: currency || "KES",
        frequency,
      };
    }

    if (job?.status) {
      payload.status = job.status;
    }

    setLoading(true);
    try {
      if (job?.id) {
        await jobService.updateJob(job.id, "", payload);
      } else {
        await jobService.createJob("", payload);
      }
      setSuccess("Job saved successfully.");
      onSaved?.();
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Failed to save job posting");
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
            {job ? "Edit Job Posting" : "Create Job Posting"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {success && <SuccessAlert message={success} />}
          {error && <ErrorAlert message={error} />}

          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-200">Job Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-2 w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-purple-500/30 bg-white dark:bg-[#0f0b1a] text-sm text-gray-900 dark:text-gray-100"
              placeholder="e.g. Live-in nanny needed"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-200">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-2 w-full min-h-[120px] px-4 py-3 rounded-xl border border-gray-200 dark:border-purple-500/30 bg-white dark:bg-[#0f0b1a] text-sm text-gray-900 dark:text-gray-100"
              placeholder="Describe the role, responsibilities, and expectations."
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-200">Location</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="mt-2 w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-purple-500/30 bg-white dark:bg-[#0f0b1a] text-sm text-gray-900 dark:text-gray-100"
              placeholder="e.g. Westlands, Nairobi"
            />
          </div>

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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-200">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-2 w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-purple-500/30 bg-white dark:bg-[#0f0b1a] text-sm text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-200">Max Applicants</label>
              <input
                type="number"
                min="1"
                value={maxApplicants}
                onChange={(e) => setMaxApplicants(e.target.value)}
                className="mt-2 w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-purple-500/30 bg-white dark:bg-[#0f0b1a] text-sm text-gray-900 dark:text-gray-100"
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-200">Min Salary</label>
              <input
                type="number"
                min="0"
                value={minSalary}
                onChange={(e) => setMinSalary(e.target.value)}
                className="mt-2 w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-purple-500/30 bg-white dark:bg-[#0f0b1a] text-sm text-gray-900 dark:text-gray-100"
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-200">Max Salary</label>
              <input
                type="number"
                min="0"
                value={maxSalary}
                onChange={(e) => setMaxSalary(e.target.value)}
                className="mt-2 w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-purple-500/30 bg-white dark:bg-[#0f0b1a] text-sm text-gray-900 dark:text-gray-100"
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-200">Currency</label>
              <CurrencySelect value={currency} onChange={setCurrency} />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-200">Payment Frequency</label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {[
                { value: "daily", label: "Daily" },
                { value: "weekly", label: "Weekly" },
                { value: "monthly", label: "Monthly" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFrequency(option.value)}
                  className={`h-11 rounded-xl text-xs font-semibold border transition shadow-sm ${
                    frequency === option.value
                      ? "bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-600 text-white border-transparent shadow-[0_0_12px_rgba(168,85,247,0.45)]"
                      : "bg-white/80 dark:bg-[#100a1c] text-gray-600 dark:text-gray-300 border-purple-500/20 hover:border-purple-500/40 hover:bg-purple-500/10"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-60"
          >
            {loading ? "Saving..." : job ? "Save Changes" : "Publish Job"}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}
