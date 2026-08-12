import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Briefcase, ChevronDown, Loader2, Pencil, Plus, X } from 'lucide-react';

import JobPostModal from '~/components/modals/JobPostModal';
import { FormError } from '~/components/FormError';
import { hireRequestService, jobService } from '~/services/grpc/authServices';
import { getStoredUserProfileId } from '~/utils/authStorage';

type HireRequestModalProps = {
  isOpen: boolean;
  onClose: () => void;
  househelpId: string;
  househelpName: string;
  initialListingId?: string | number;
  onSent?: (request: Record<string, any>) => void;
  // Kept optional for callers compiled against the former profile-based form.
  [key: string]: unknown;
};

function rowsFrom(payload: any): Record<string, any>[] {
  const value = payload?.data?.data ?? payload?.data ?? payload ?? [];
  return Array.isArray(value) ? value : [];
}

function featureGroups(listing?: Record<string, any>): Array<{ name: string; values: string[] }> {
  const groups = listing?.listing_feature_groups || listing?.feature_groups || [];
  if (!Array.isArray(groups)) return [];
  return groups.map((group: any) => ({
    name: String(group.feature_name || group.name || group.title || 'Detail'),
    values: (group.properties || group.values || group.options || [])
      .map((item: any) => String(item?.name || item?.value || item?.title || item || ''))
      .filter(Boolean),
  })).filter((group: { values: string[] }) => group.values.length > 0);
}

export default function HireRequestModal({
  isOpen,
  onClose,
  househelpId,
  househelpName,
  initialListingId,
  onSent,
}: HireRequestModalProps) {
  const [listings, setListings] = useState<Record<string, any>[]>([]);
  const [selectedListingId, setSelectedListingId] = useState(String(initialListingId || ''));
  const [notes, setNotes] = useState('');
  const [loadingListings, setLoadingListings] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<Record<string, any> | null>(null);
  const [createdForRequest, setCreatedForRequest] = useState(false);
  const [sentRequest, setSentRequest] = useState<Record<string, any> | null>(null);
  const [publishing, setPublishing] = useState(false);

  const loadListings = useCallback(async (preferredId?: string) => {
    setLoadingListings(true);
    try {
      const response = await jobService.listJobs(100, 0, getStoredUserProfileId(), 'active');
      const active = rowsFrom(response);
      setListings(active);
      const requested = String(preferredId || initialListingId || '');
      setSelectedListingId((current) => {
        if (requested && active.some((listing) => String(listing.id) === requested)) return requested;
        if (current && active.some((listing) => String(listing.id) === current)) return current;
        return active.length === 1 ? String(active[0].id) : '';
      });
      if (active.length === 0) {
        setEditingListing(null);
        setJobModalOpen(true);
      }
    } catch (loadError: any) {
      setError(loadError?.message || 'We could not load your job listings.');
    } finally {
      setLoadingListings(false);
    }
  }, [initialListingId]);

  useEffect(() => {
    if (!isOpen) return;
    setError('');
    setNotes('');
    setSentRequest(null);
    setCreatedForRequest(false);
    void loadListings();
  }, [isOpen, loadListings]);

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [isOpen]);

  const selectedListing = useMemo(
    () => listings.find((listing) => String(listing.id) === selectedListingId),
    [listings, selectedListingId],
  );
  const details = featureGroups(selectedListing);

  const sendRequest = async () => {
    if (!selectedListingId) {
      setError('Choose the job listing this request is for.');
      return;
    }
    setSending(true);
    setError('');
    try {
      const request = await hireRequestService.createHireRequest('', 'household', {
        househelp_profile_id: househelpId,
        listing_id: Number(selectedListingId),
        message: notes.trim(),
        publish_listing: !createdForRequest,
      });
      const normalized = (request?.data ?? request ?? {}) as Record<string, any>;
      onSent?.(normalized);
      if (createdForRequest) {
        setSentRequest(normalized);
      } else {
        onClose();
      }
    } catch (sendError: any) {
      setError(sendError?.message || 'We could not send this hire request.');
    } finally {
      setSending(false);
    }
  };

  const publishListing = async () => {
    setPublishing(true);
    setError('');
    try {
      await jobService.reopenJob(selectedListingId);
      onClose();
    } catch (publishError: any) {
      setError(publishError?.message || 'The request was sent, but we could not publish the listing.');
    } finally {
      setPublishing(false);
    }
  };

  if (!isOpen) return null;

  const content = (
    <>
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/65 backdrop-blur-sm sm:items-center sm:p-5" onClick={onClose}>
        <section onClick={(event) => event.stopPropagation()} className="max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl border border-purple-500/30 bg-white shadow-2xl dark:bg-[#13131a] sm:max-w-2xl sm:rounded-2xl">
          <header className="sticky top-0 z-10 flex items-center justify-between border-b border-purple-200 bg-white px-5 py-4 dark:border-purple-500/20 dark:bg-[#13131a]">
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Send hire request</h2>
              <p className="mt-0.5 text-xs text-gray-500">Choose the exact job details to send to {househelpName}.</p>
            </div>
            <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-2 text-gray-500 hover:bg-purple-500/10"><X className="h-5 w-5" /></button>
          </header>

          {sentRequest ? (
            <div className="space-y-5 p-5 sm:p-6">
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                <h3 className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Hire request sent</h3>
                <p className="mt-1 text-xs leading-5 text-gray-600 dark:text-gray-300">This listing is currently private and is only being used for the request sent to {househelpName}. Would you also like other househelps to find and apply to it?</p>
              </div>
              <FormError message={error} />
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={onClose} className="rounded-xl border border-purple-300 px-4 py-2.5 text-xs font-semibold text-purple-700 dark:text-purple-200">Keep private</button>
                <button type="button" onClick={() => void publishListing()} disabled={publishing} className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-60">{publishing ? 'Publishing…' : 'Publish listing'}</button>
              </div>
            </div>
          ) : (
            <div className="space-y-5 p-5 sm:p-6">
              <div>
                <label htmlFor="hire-listing" className="mb-2 block text-xs font-semibold text-gray-800 dark:text-gray-200">Job listing <span className="text-pink-500">*</span></label>
                {loadingListings ? (
                  <div className="flex items-center gap-2 rounded-xl border border-purple-200 px-4 py-3 text-xs text-gray-500 dark:border-purple-500/30"><Loader2 className="h-4 w-4 animate-spin" /> Loading your listings…</div>
                ) : listings.length > 0 ? (
                  <div className="relative">
                    <select id="hire-listing" value={selectedListingId} onChange={(event) => { setSelectedListingId(event.target.value); setCreatedForRequest(false); }} className="w-full appearance-none rounded-xl border border-purple-300 bg-white px-4 py-3 pr-10 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-purple-500 dark:border-purple-500/40 dark:bg-[#0d0d14] dark:text-white">
                      <option value="">Select a job listing…</option>
                      {listings.map((listing) => <option key={String(listing.id)} value={String(listing.id)}>{String(listing.title || `Job #${listing.id}`)}</option>)}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-gray-500" />
                  </div>
                ) : (
                  <p className="rounded-xl bg-purple-500/10 p-4 text-xs leading-5 text-gray-600 dark:text-gray-300">You do not have an active job listing yet. Create the job details first; the request will use exactly what you enter.</p>
                )}
              </div>

              {selectedListing && (
                <div className="rounded-2xl border border-purple-200 bg-purple-50/60 p-4 dark:border-purple-500/25 dark:bg-purple-500/5">
                  <div className="flex items-start justify-between gap-4">
                    <div><h3 className="text-sm font-semibold text-gray-900 dark:text-white">{String(selectedListing.title || 'Job listing')}</h3><p className="mt-1 text-xs leading-5 text-gray-600 dark:text-gray-300">{String(selectedListing.description || '')}</p></div>
                    <button type="button" onClick={() => { setEditingListing(selectedListing); setJobModalOpen(true); }} className="inline-flex shrink-0 items-center gap-1 rounded-full border border-purple-300 px-3 py-1.5 text-[11px] font-semibold text-purple-700 dark:text-purple-200"><Pencil className="h-3 w-3" /> Edit</button>
                  </div>
                  {details.length > 0 && <div className="mt-3 grid gap-2 sm:grid-cols-2">{details.map((group) => <p key={group.name} className="text-xs"><span className="font-semibold text-gray-700 dark:text-gray-300">{group.name}:</span> <span className="text-gray-500 dark:text-gray-400">{group.values.join(', ')}</span></p>)}</div>}
                </div>
              )}

              <button type="button" onClick={() => { setEditingListing(null); setJobModalOpen(true); }} className="inline-flex items-center gap-2 text-xs font-semibold text-purple-600 dark:text-purple-300"><Plus className="h-4 w-4" /> Create different job details</button>

              <div><label htmlFor="hire-notes" className="mb-2 block text-xs font-semibold text-gray-800 dark:text-gray-200">Message <span className="font-normal text-gray-400">(optional)</span></label><textarea id="hire-notes" value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} placeholder="Add anything specific you discussed with them…" className="w-full resize-none rounded-xl border border-purple-300 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500 dark:border-purple-500/40 dark:bg-[#0d0d14] dark:text-white" /></div>
              <FormError message={error} />
              <div className="grid grid-cols-2 gap-3"><button type="button" onClick={onClose} className="rounded-xl border border-purple-300 px-4 py-2.5 text-xs font-semibold text-purple-700 dark:text-purple-200">Cancel</button><button type="button" onClick={() => void sendRequest()} disabled={sending || !selectedListingId} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-50"><Briefcase className="h-4 w-4" /> {sending ? 'Sending…' : 'Send request'}</button></div>
            </div>
          )}
        </section>
      </div>

      <JobPostModal
        isOpen={jobModalOpen}
        onClose={() => setJobModalOpen(false)}
        job={editingListing}
        titleOverride={editingListing ? 'Adjust job details' : 'Create job details'}
        submitLabel={editingListing ? 'Use updated details' : 'Use these details'}
        onSaved={async (listing) => {
          const savedId = String(listing?.id || editingListing?.id || '');
          if (!editingListing) setCreatedForRequest(true);
          await loadListings(savedId);
        }}
      />
    </>
  );

  return createPortal(content, document.body);
}
