import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router';
import { X } from 'lucide-react';
import { useAuth } from '~/contexts/useAuth';
import { getStoredUserId } from '~/utils/authStorage';
import { tourService, type TourEventType } from '~/services/grpc/authServices';

type TourPoint = { title: string; body: string; selector: string };

// Bump whenever anchors or copy materially changes so a corrected walkthrough
// is not hidden by a completion key written by an older version.
const TOUR_VERSION = 2;
const tours: Array<{ match: (path: string) => boolean; id: string; points: TourPoint[] }> = [
  {
    id: 'home', match: (path) => path === '/', points: [
      { title: 'Your Homebit home', body: 'This page brings your best matches and next actions together.', selector: '[data-tour="home-heading"]' },
      { title: 'Search and filters', body: 'Use filters to narrow results by location, work type, schedule, and other needs.', selector: '[data-tour="discovery-filters"]' },
      { title: 'Profile cards', body: 'Open a card to see the full profile before you shortlist, apply, or chat.', selector: '[data-tour="marketplace-card"]' },
      { title: 'Hiring', body: 'Applications, requests, contracts, and work history stay together under Hiring.', selector: '[data-tour="nav-hiring"]' },
      { title: 'Messages', body: 'Inbox contains job-scoped conversations and unread messages.', selector: '[data-tour="nav-inbox"]' },
    ],
  },
  {
    id: 'profile', match: (path) => path.includes('profile'), points: [
      { title: 'Your profile', body: 'This is what the marketplace uses to understand your household or experience.', selector: 'main h1, main h2' },
      { title: 'Completion checklist', body: 'Complete the remaining items here to unlock the strongest matches.', selector: '[data-tour="profile-completion"]' },
      { title: 'Profile choices', body: 'Keep your exact household facts, skills, and preferences current.', selector: '[data-tour="profile-choices"]' },
      { title: 'Verification and trust', body: 'Identity and reference information is handled separately from your public display name.', selector: '[data-tour="profile-verification"]' },
      { title: 'Save and continue', body: 'Save each section before moving on; your completion checklist updates from the server.', selector: '[data-tour="profile-account"]' },
    ],
  },
  {
    id: 'hiring', match: (path) => path.includes('hiring'), points: [
      { title: 'Hiring stages', body: 'Each tab is one stage of the same application or request.', selector: '[data-tour="hiring-tabs"]' },
      { title: 'Attention badges', body: 'A badge means that record changed since you last opened it.', selector: '[data-tour="hiring-attention"], [data-tour="hiring-tabs"]' },
      { title: 'Open a card', body: 'A card keeps the job, person, history, and available next actions together.', selector: 'main [role="button"]' },
      { title: 'Chat in context', body: 'Use Chat here so the conversation remains attached to the correct job.', selector: '[data-tour="hiring-chat"]' },
      { title: 'Contracts and reviews', body: 'After approval, use the contract and history stages here; reviews become available when work ends.', selector: '[data-tour="hiring-tabs"]' },
    ],
  },
  {
    id: 'inbox', match: (path) => path.startsWith('/inbox'), points: [
      { title: 'Your conversations', body: 'Unread conversations appear in this list.', selector: '[data-tour="inbox-conversations"]' },
      { title: 'Job context', body: 'The job banner keeps each conversation tied to the correct listing.', selector: '[data-tour="inbox-job-context"]' },
      { title: 'Messages', body: 'New messages update live and reconcile after a network interruption.', selector: '[data-tour="inbox-messages"]' },
      { title: 'Compose', body: 'Write a message, add an emoji, or use the hiring details without leaving the thread.', selector: '[data-tour="inbox-compose"]' },
      { title: 'Unread status', body: 'Opening a conversation clears its unread state and synchronises the navigation badge.', selector: '[data-tour="inbox-conversations"]' },
    ],
  },
  {
    id: 'subscriptions', match: (path) => path.includes('subscription') || path === '/plans', points: [
      { title: 'Choose a plan', body: 'Prices and trial availability on this page come directly from the server.', selector: '[data-tour="subscription-heading"]' },
      { title: 'Trial eligibility', body: 'If a free trial is available and unused, no M-Pesa payment is taken today.', selector: '[data-tour="subscription-trial"], [data-tour="subscription-plan"]' },
      { title: 'Confirm the amount', body: 'If payment is required, the displayed amount is the exact M-Pesa request.', selector: '[data-tour="subscription-plan"]' },
      { title: 'Immediate access', body: 'After activation, Homebit refreshes access in this session—no logout is needed.', selector: '[data-tour="subscription-status"], [data-tour="subscription-plan"]' },
      { title: 'Manage access', body: 'Return here to see the active period, receipts, plan changes, and cancellation controls.', selector: '[data-tour="subscription-management"], [data-tour="subscription-plan"]' },
    ],
  },
];

export default function GuidedRouteTour() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const tour = useMemo(() => tours.find((candidate) => candidate.match(pathname)), [pathname]);
  const [index, setIndex] = useState(-1);
  const [target, setTarget] = useState<DOMRect | null>(null);
  const authUser = user as { user_id?: string; id?: string; user?: { user_id?: string; id?: string } } | null;
  const userId = authUser?.user_id || authUser?.id || authUser?.user?.user_id || authUser?.user?.id || getStoredUserId() || '';
  const storageKey = tour && userId ? `homebit:tour:v${TOUR_VERSION}:${userId}:${tour.id}` : '';
  const recordTourEvent = useCallback((eventType: TourEventType, stepIndex: number) => {
    if (!tour || !userId) return Promise.resolve();
    return tourService.recordEvent({
      userId,
      tourId: tour.id,
      tourVersion: TOUR_VERSION,
      eventType,
      stepIndex,
      totalSteps: tour.points.length,
      pagePath: pathname,
    }).catch(() => undefined);
  }, [pathname, tour, userId]);

  useEffect(() => {
    if (!tour || !storageKey) { setIndex(-1); return; }
    setIndex(-1);
    const cachedValue = window.localStorage.getItem(storageKey);
    if (cachedValue) {
      // Local storage is the instant UX guard; this best-effort idempotent
      // write repairs backend state after an earlier offline/error session.
      let cached: { status?: string; lastStep?: number } = {};
      try { cached = JSON.parse(cachedValue); } catch { cached = { status: cachedValue }; }
      const cachedStatus = cached.status === 'complete' ? 'completed' : cached.status;
      const eventType: TourEventType = cachedStatus === 'completed' || cachedStatus === 'skipped'
        ? cachedStatus
        : 'step_viewed';
      const cachedStep = Math.min(Math.max(cached.lastStep ?? (eventType === 'completed' ? tour.points.length - 1 : 0), 0), tour.points.length - 1);
      void recordTourEvent(eventType, cachedStep);
      return;
    }

    let cancelled = false;
    void tourService.getProgress(userId, tour.id, TOUR_VERSION)
      .then((progress) => {
        if (cancelled) return;
        if (progress?.seen) {
          window.localStorage.setItem(storageKey, JSON.stringify({
            status: progress.status || 'started',
            lastStep: progress.last_step ?? 0,
            syncedAt: new Date().toISOString(),
          }));
          return;
        }
        // Write the browser marker before rendering. If the tab refreshes or
        // closes during the tour it must not auto-launch again immediately.
        window.localStorage.setItem(storageKey, JSON.stringify({ status: 'started', lastStep: 0 }));
        setIndex(0);
        void recordTourEvent('started', 0);
      })
      .catch(() => {
        if (cancelled) return;
        // Offline/backend failure still gets a non-annoying browser fallback.
        window.localStorage.setItem(storageKey, JSON.stringify({ status: 'started', lastStep: 0 }));
        setIndex(0);
      });
    return () => { cancelled = true; };
  }, [recordTourEvent, storageKey, tour, userId]);

  useEffect(() => {
    const replay = () => {
      if (!tour) return;
      setIndex(0);
      void recordTourEvent('started', 0);
    };
    window.addEventListener('homebit:start-tour', replay);
    return () => window.removeEventListener('homebit:start-tour', replay);
  }, [recordTourEvent, tour]);

  useEffect(() => {
    if (!tour || index < 0) return;
    void recordTourEvent('step_viewed', index);
    if (storageKey) {
      window.localStorage.setItem(storageKey, JSON.stringify({ status: 'started', lastStep: index }));
    }
  }, [index, recordTourEvent, storageKey, tour]);

  useEffect(() => {
    if (!tour || index < 0) { setTarget(null); return; }
    const update = () => {
      const element = Array.from(document.querySelectorAll<HTMLElement>(tour.points[index]?.selector || ''))
        .find((candidate) => {
          const rect = candidate.getBoundingClientRect();
          const style = window.getComputedStyle(candidate);
          return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
        });
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTarget(element?.getBoundingClientRect() || null);
    };
    const timer = window.setTimeout(update, 100);
    window.addEventListener('resize', update);
    return () => { window.clearTimeout(timer); window.removeEventListener('resize', update); };
  }, [index, tour]);

  if (!tour || index < 0 || !tour.points[index]) return null;
  const point = tour.points[index];
  const finish = (status: 'completed' | 'skipped') => {
    if (storageKey) window.localStorage.setItem(storageKey, JSON.stringify({ status, lastStep: index }));
    void recordTourEvent(status, index);
    setIndex(-1);
  };
  const top = target ? Math.min(window.innerHeight - 220, Math.max(16, target.bottom + 12)) : window.innerHeight / 2 - 100;
  const left = target ? Math.min(window.innerWidth - 336, Math.max(16, target.left)) : Math.max(16, window.innerWidth / 2 - 160);

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none" aria-live="polite">
      {target && <div className="fixed rounded-xl ring-4 ring-purple-500 ring-offset-4 ring-offset-white/70 dark:ring-offset-black/60" style={{ top: target.top, left: target.left, width: target.width, height: target.height }} />}
      <section role="dialog" aria-label="Page tour" className="pointer-events-auto fixed w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-purple-300 bg-white p-4 shadow-2xl dark:border-purple-500/50 dark:bg-[#171220]" style={{ top, left }}>
        <div className="flex items-start justify-between gap-3">
          <div><p className="text-[11px] font-bold uppercase tracking-wide text-purple-600">Quick tour · {index + 1}/{tour.points.length}</p><h2 className="mt-1 text-sm font-bold text-gray-900 dark:text-white">{point.title}</h2></div>
          <button type="button" onClick={() => finish('skipped')} aria-label="Skip tour" className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10"><X className="h-4 w-4" /></button>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-gray-600 dark:text-gray-300">{point.body}</p>
        <div className="mt-4 flex items-center justify-between">
          <button type="button" onClick={() => finish('skipped')} className="text-xs font-semibold text-gray-500">Skip</button>
          <div className="flex gap-2">
            {index > 0 && <button type="button" onClick={() => setIndex(index - 1)} className="rounded-xl border border-purple-200 px-3 py-1.5 text-xs font-semibold text-purple-700 dark:text-purple-200">Back</button>}
            <button type="button" onClick={() => index + 1 < tour.points.length ? setIndex(index + 1) : finish('completed')} className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md shadow-purple-500/25 transition-all hover:from-purple-700 hover:to-pink-700 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#171220]">{index + 1 < tour.points.length ? 'Next' : 'Done'}</button>
          </div>
        </div>
      </section>
    </div>
  );
}
