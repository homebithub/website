import { Eye, MessageCircle } from 'lucide-react';
import { formatListingPlace } from '~/utils/place';
import { formatTimeAgo } from '~/utils/timeAgo';
import { listingHighlights } from '~/utils/listingFeatures';
import { matchScoreClasses } from '~/utils/matchScore';
import { ListingRating } from '~/components/ui/ListingRating';
import { ListingCardFacts } from './ListingCardFacts';
import { deriveHouseholdResponsivenessBadge, RESPONSIVENESS_BADGE_STYLES } from '~/utils/listingResponsiveness';
type Props = {
 job: Record<string, any>; householdName?: string | null; householdProfile?: Record<string, any> | null;
 isGridView: boolean; hasApplied: boolean; contacted: boolean; shortlisted: boolean;
 chatLoading?: boolean; saving?: boolean; onOpen: () => void; onChat: () => void;
 onViewProfile: () => void; onToggleSave: () => void; onApply?: () => void;
};
const isJobOpen = (job: Props['job']) => ['active', 'open', 'available'].includes((job.status || 'active').toLowerCase());
/** Discovery and Saved share the same card information. */
export function JobListingCard({ job, householdName, householdProfile, isGridView, hasApplied, contacted, shortlisted, chatLoading, saving, onOpen, onChat, onViewProfile, onToggleSave, onApply }: Props) {
 const responseBadge = deriveHouseholdResponsivenessBadge(householdProfile);
 const highlights = listingHighlights(job);
 return (
                    <div
                      data-tour="marketplace-card"
                      key={job.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => onOpen()}
                      onKeyDown={(event) => {
                        if (event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) {
                          event.preventDefault();
                          onOpen();
                        }
                      }}
                      className={`cursor-pointer rounded-2xl border border-purple-200/50 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-purple-300/70 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-400 dark:border-purple-500/25 dark:bg-[#13131a] sm:p-6 ${isGridView ? "flex h-full flex-col" : ""}`}
                    >
                      <div className={isGridView ? "flex flex-col gap-3" : "grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2 lg:grid-cols-[minmax(260px,0.9fr)_minmax(320px,1.2fr)_auto] lg:gap-8"}>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="min-w-0 text-base font-semibold text-gray-900 dark:text-white sm:text-lg">{job.title || "Household Job"}</h3>
                            {typeof job.fit_score === "number" && job.fit_score >= 0 && (
                              <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${matchScoreClasses(job.fit_score)}`}>
                                Match {job.fit_score}%
                              </span>
                            )}
                            {hasApplied && (
                              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
                                You applied for this job
                              </span>
                            )}
                            {contacted && (
                              <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200">
                                You two are in contact
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">📍 {formatListingPlace(job)}</p>
                          {/* What earned the score, on the card.
                              A percentage on its own is a number nobody can
                              argue with or learn from — it invites people to
                              either over-trust it or ignore it. The matching
                              service already returns its reasons; showing the
                              first few here turns the score into something a
                              person can act on, and the rest are in the job
                              detail. */}
                          {typeof job.fit_score === "number" && job.fit_score > 0 && (job.match_reasons?.length ?? 0) > 0 && (
                            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                              {job.match_reasons!.slice(0, isGridView ? 2 : 3).map((reason: string) => (
                                <span
                                  key={reason}
                                  className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium capitalize text-gray-800 dark:bg-white/10 dark:text-gray-100"
                                >
                                  <span aria-hidden>✓</span>
                                  {reason.replace(/_/g, " ")}
                                </span>
                              ))}
                              {(job.match_reasons?.length ?? 0) > (isGridView ? 2 : 3) && (
                                <span className="text-[10px] text-gray-500 dark:text-gray-400">
                                  +{job.match_reasons!.length - (isGridView ? 2 : 3)} more
                                </span>
                              )}
                            </div>
                          )}
                          {householdName && (
                            <p className="mt-1 text-xs font-semibold text-purple-600 dark:text-purple-300">Hosted by {householdName}</p>
                          )}
                          <ListingRating
                            rating={householdProfile?.rating ?? job.owner_rating}
                            reviewCount={householdProfile?.review_count ?? job.owner_review_count}
                            className="mt-1"
                          />
                          {responseBadge && (
                            <div className="mt-2 space-y-1">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold ${RESPONSIVENESS_BADGE_STYLES[responseBadge.tone]}`}>
                                {responseBadge.label}
                              </span>
                              {!isGridView && responseBadge.detail && (
                                <p className="text-[11px] text-gray-500 dark:text-gray-400">{responseBadge.detail}</p>
                              )}
                            </div>
                          )}
                        </div>
                        {!isGridView && <ListingCardFacts listing={job} />}
                        <div className={`flex shrink-0 items-start gap-1.5 sm:gap-2 ${isGridView ? "justify-between" : ""}`}>
                          <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-full sm:px-3 sm:text-xs ${isJobOpen(job)
                            ? "bg-gray-100 text-gray-800 dark:bg-white/10 dark:text-white"
                            : "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300"}`}
                          >
                            {job.status || "open"}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                onChat();
                              }}
                              disabled={chatLoading}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-purple-200/60 bg-white text-purple-700 transition hover:bg-purple-50 disabled:opacity-60 dark:border-purple-500/30 dark:bg-white/10 dark:text-purple-200 dark:hover:bg-purple-500/10 sm:h-9 sm:w-9"
                              aria-label="Chat with household"
                            >
                              {chatLoading ? (
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
                              ) : (
                                <MessageCircle className="w-4 h-4" />
                              )}
                            </button>
                            {/* Restored. It was removed as dead, and it was not
                                — it opens the household's profile, and that was
                                broken by the household_id bug rather than by
                                this button. */}
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                onViewProfile();
                              }}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-purple-200/60 bg-white text-purple-700 transition hover:bg-purple-50 dark:border-purple-500/30 dark:bg-white/10 dark:text-purple-200 dark:hover:bg-purple-500/10 sm:h-9 sm:w-9"
                              aria-label="View household profile"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {job.description && (
                        <p className={`mt-3 text-sm text-gray-600 dark:text-gray-300 ${isGridView ? "line-clamp-2" : "line-clamp-3"}`}>
                          {job.description}
                        </p>
                      )}

                      {/* Salary and start timing live in the listing's feature
                          picks. Read from salary_range and start_date, fields no
                          listing carries, every card claimed "Not specified". */}
                      <div className="mt-4 flex flex-wrap gap-2">
                        {(job.job_types || []).length > 0
                          ? job.job_types?.slice(0, isGridView ? 2 : job.job_types.length).map((type: string) => (
                            <span
                              key={type}
                              className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-200"
                            >
                              {type.replace(/_/g, " ")}
                            </span>
                          ))
                          : null}
                        {highlights.salary ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-white/10 dark:text-white">
                            {highlights.salary}
                          </span>
                        ) : null}
                        {highlights.startTiming ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200">
                            Start {highlights.startTiming}
                          </span>
                        ) : null}
                        {job.max_applicants ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200">
                            {Math.max(0, Number(job.applicant_count || 0))} / {job.max_applicants} applicants
                          </span>
                        ) : null}
                      </div>

                      <div className={`mt-4 flex items-center justify-between ${isGridView ? "mt-auto pt-4" : ""}`}>
                        <span className="text-xs text-gray-400">Posted {formatTimeAgo(job.created_at)}</span>
                        <div className="flex gap-2 flex-wrap justify-end">
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              onToggleSave();
                            }}
                            disabled={saving}
                            className={`px-4 py-2 text-xs font-semibold rounded-xl border transition ${
                              shortlisted
                                ? "border-pink-400 bg-pink-500 text-white"
                                : "border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-500/40 dark:text-purple-200 dark:hover:bg-purple-500/10"
                            } disabled:opacity-60`}
                          >
                            {saving
                              ? "Updating..."
                              : shortlisted
                                ? "Saved"
                                : "Save"}
                          </button>
                          {!hasApplied && onApply && (
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                onApply?.();
                              }}
                              disabled={!isJobOpen(job)}
                              className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-1.5 text-xs font-semibold text-white hover:from-purple-700 hover:to-pink-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Apply
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
 );
}
