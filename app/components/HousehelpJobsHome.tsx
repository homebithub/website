import React, { useEffect, useState } from "react";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { PurpleThemeWrapper } from "~/components/layout/PurpleThemeWrapper";
import { jobService, profileService as grpcProfileService } from "~/services/grpc/authServices";
import { ErrorAlert } from "~/components/ui/ErrorAlert";
import { SuccessAlert } from "~/components/ui/SuccessAlert";
import { formatTimeAgo } from "~/utils/timeAgo";

interface JobListing {
  id: string;
  title?: string;
  description?: string;
  location?: string;
  job_types?: string[];
  start_date?: string;
  salary_range?: { min?: number; max?: number; currency?: string };
  max_applicants?: number;
  status?: string;
  created_at?: string;
}

const formatDate = (value?: string) => {
  if (!value) return "Flexible";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Flexible";
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const formatSalaryRange = (range?: JobListing["salary_range"]) => {
  if (!range) return "Not specified";
  const min = range.min ? `KES ${range.min.toLocaleString()}` : "";
  const max = range.max ? `KES ${range.max.toLocaleString()}` : "";
  if (min && max) return `${min} - ${max}`;
  return min || max || "Not specified";
};

export default function HousehelpJobsHome() {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [househelpProfileId, setHousehelpProfileId] = useState<string>("");

  const limit = 12;

  useEffect(() => {
    let cancelled = false;
    const fetchProfile = async () => {
      try {
        const profile = await grpcProfileService.getCurrentHousehelpProfile("");
        const resolvedId = profile?.id || profile?.profile_id || "";
        if (!cancelled) setHousehelpProfileId(resolvedId);
      } catch (err) {
        // Non-blocking: allow browsing even if we can't resolve profile ID yet
      }
    };
    fetchProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const fetchJobs = async () => {
      setLoading(true);
      setError(null);
      try {
        const raw = await jobService.listJobs(limit, offset);
        const payload = raw?.data || raw || {};
        const items = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload)
            ? payload
            : [];
        if (cancelled) return;
        setJobs((prev) => (offset === 0 ? items : [...prev, ...items]));
        setHasMore(items.length === limit);
      } catch (err: any) {
        if (!cancelled) setError(err.message || "Failed to load job listings");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchJobs();

    return () => {
      cancelled = true;
    };
  }, [offset]);

  const handleApply = async (job: JobListing) => {
    if (!househelpProfileId) {
      setError("Please complete your househelp profile before applying.");
      return;
    }
    setError(null);
    setSuccess(null);
    try {
      await jobService.applyForJob(job.id, househelpProfileId);
      setSuccess("Application submitted successfully.");
    } catch (err: any) {
      setError(err.message || "Failed to apply for job");
    }
  };

  const isJobOpen = (job: JobListing) => (job.status || "open") === "open";

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <PurpleThemeWrapper variant="gradient" bubbles={false} bubbleDensity="low" className="flex-1 flex flex-col">
        <main className="flex-1 py-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Latest Job Openings</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Apply directly to households that are actively hiring.
              </p>
            </div>

            {error && <ErrorAlert message={error} className="mb-6" />}
            {success && <SuccessAlert message={success} className="mb-6" />}

            {loading && jobs.length === 0 ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600"></div>
              </div>
            ) : jobs.length === 0 ? (
              <div className="bg-white dark:bg-[#13131a] border-2 border-purple-200 dark:border-purple-500/30 rounded-2xl p-10 sm:p-14 text-center">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No jobs available yet</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mx-auto">
                  Check back soon for new household job postings.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-white dark:bg-[#13131a] rounded-2xl border-2 border-purple-200/40 dark:border-purple-500/30 p-6 shadow-sm hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{job.title || "Household Job"}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">📍 {job.location || "Location not specified"}</p>
                      </div>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${isJobOpen(job)
                        ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-200"
                        : "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300"}`}
                      >
                        {job.status || "open"}
                      </span>
                    </div>

                    {job.description && (
                      <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                        {job.description}
                      </p>
                    )}

                    <div className="mt-4 flex flex-wrap gap-2">
                      {(job.job_types || []).length > 0 ? (
                        job.job_types?.map((type) => (
                          <span
                            key={type}
                            className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-200"
                          >
                            {type.replace(/_/g, " ")}
                          </span>
                        ))
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300">
                          Flexible role
                        </span>
                      )}
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200">
                        Start {formatDate(job.start_date)}
                      </span>
                      {job.max_applicants ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200">
                          Max {job.max_applicants} applicants
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-4 text-xs text-gray-600 dark:text-gray-300">
                      Salary: {formatSalaryRange(job.salary_range)}
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-gray-400">Posted {formatTimeAgo(job.created_at)}</span>
                      <button
                        onClick={() => handleApply(job)}
                        disabled={!isJobOpen(job)}
                        className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && hasMore && jobs.length > 0 && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => setOffset((prev) => prev + limit)}
                  className="px-6 py-2 rounded-xl border border-purple-300 text-purple-700 font-semibold hover:bg-purple-50 dark:border-purple-500/40 dark:text-purple-200 dark:hover:bg-purple-500/10"
                >
                  Load More
                </button>
              </div>
            )}
          </div>
        </main>
      </PurpleThemeWrapper>
      <Footer />
    </div>
  );
}
