import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router';
import { X } from 'lucide-react';
import { useAuth } from '~/contexts/useAuth';
import { getStoredUserId } from '~/utils/authStorage';

type TourPoint = { title: string; body: string; selector: string };

const TOUR_VERSION = 1;
const tours: Array<{ match: (path: string) => boolean; id: string; points: TourPoint[] }> = [
  {
    id: 'home', match: (path) => path === '/', points: [
      { title: 'Your Homebit home', body: 'This page brings your best matches and next actions together.', selector: 'main h1, main h2' },
      { title: 'Search and filters', body: 'Use filters to narrow results by location, work type, schedule, and other needs.', selector: 'main input, main button' },
      { title: 'Profile cards', body: 'Open a card to see the full profile before you shortlist, apply, or chat.', selector: 'main a[href*="profile"], main [role="button"]' },
      { title: 'Hiring', body: 'Applications, requests, contracts, and work history stay together under Hiring.', selector: 'a[href*="hiring"]' },
      { title: 'Messages', body: 'Inbox contains job-scoped conversations and unread messages.', selector: 'a[href*="inbox"]' },
    ],
  },
  {
    id: 'profile', match: (path) => path.includes('profile'), points: [
      { title: 'Your profile', body: 'This is what the marketplace uses to understand your household or experience.', selector: 'main h1, main h2' },
      { title: 'Completion checklist', body: 'Complete the remaining items here to unlock the strongest matches.', selector: '[class*="completion"], main section' },
      { title: 'Profile choices', body: 'Keep your exact household facts, skills, and preferences current.', selector: 'a[href*="onboarding/features"], button' },
      { title: 'Verification and trust', body: 'Identity and reference information is handled separately from your public display name.', selector: 'main [class*="verification"], main section' },
      { title: 'Save and continue', body: 'Save each section before moving on; your completion checklist updates from the server.', selector: 'main button[type="submit"], main button' },
    ],
  },
  {
    id: 'hiring', match: (path) => path.includes('hiring'), points: [
      { title: 'Hiring stages', body: 'Each tab is one stage of the same application or request.', selector: '[role="tablist"], nav' },
      { title: 'Attention badges', body: 'A badge means that record changed since you last opened it.', selector: 'main [class*="badge"], main button' },
      { title: 'Open a card', body: 'A card keeps the job, person, history, and available next actions together.', selector: 'main [role="button"]' },
      { title: 'Chat in context', body: 'Use Chat here so the conversation remains attached to the correct job.', selector: 'main button' },
      { title: 'Contracts and reviews', body: 'After approval, follow the contract action shown; reviews become available when work ends.', selector: 'main' },
    ],
  },
  {
    id: 'inbox', match: (path) => path.startsWith('/inbox'), points: [
      { title: 'Your conversations', body: 'Unread conversations appear in this list.', selector: 'main aside, main [role="list"]' },
      { title: 'Job context', body: 'The job banner keeps each conversation tied to the correct listing.', selector: 'main [class*="banner"], main header' },
      { title: 'Messages', body: 'New messages update live and reconcile after a network interruption.', selector: 'main [class*="message"], main section' },
      { title: 'Compose', body: 'Write a message, add an emoji, or use the hiring details without leaving the thread.', selector: 'main textarea, main input' },
      { title: 'Unread status', body: 'Opening a conversation clears its unread state and synchronises the navigation badge.', selector: 'main aside, main' },
    ],
  },
  {
    id: 'subscriptions', match: (path) => path.includes('subscription') || path === '/plans', points: [
      { title: 'Choose a plan', body: 'Prices and trial availability on this page come directly from the server.', selector: 'main h1' },
      { title: 'Trial eligibility', body: 'If a free trial is available and unused, no M-Pesa payment is taken today.', selector: 'main [class*="green"], main p' },
      { title: 'Confirm the amount', body: 'If payment is required, the displayed amount is the exact M-Pesa request.', selector: 'main [class*="plan"], main section' },
      { title: 'Immediate access', body: 'After activation, Homebit refreshes access in this session—no logout is needed.', selector: 'main' },
      { title: 'Manage access', body: 'Return here to see the active period, receipts, plan changes, and cancellation controls.', selector: 'main nav, main section' },
    ],
  },
];

export default function GuidedRouteTour() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const tour = useMemo(() => tours.find((candidate) => candidate.match(pathname)), [pathname]);
  const [index, setIndex] = useState(-1);
  const [target, setTarget] = useState<DOMRect | null>(null);
  const userId = ((user as any)?.user?.user_id || (user as any)?.user?.id || getStoredUserId() || '') as string;
  const storageKey = tour && userId ? `homebit:tour:v${TOUR_VERSION}:${userId}:${tour.id}` : '';

  useEffect(() => {
    if (!tour || !storageKey) { setIndex(-1); return; }
    setIndex(window.localStorage.getItem(storageKey) ? -1 : 0);
  }, [storageKey, tour]);

  useEffect(() => {
    const replay = () => { if (tour) setIndex(0); };
    window.addEventListener('homebit:start-tour', replay);
    return () => window.removeEventListener('homebit:start-tour', replay);
  }, [tour]);

  useEffect(() => {
    if (!tour || index < 0) { setTarget(null); return; }
    const update = () => {
      const element = document.querySelector(tour.points[index]?.selector);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTarget(element?.getBoundingClientRect() || null);
    };
    const timer = window.setTimeout(update, 100);
    window.addEventListener('resize', update);
    return () => { window.clearTimeout(timer); window.removeEventListener('resize', update); };
  }, [index, tour]);

  if (!tour || index < 0 || !tour.points[index]) return null;
  const point = tour.points[index];
  const finish = () => { if (storageKey) window.localStorage.setItem(storageKey, 'complete'); setIndex(-1); };
  const top = target ? Math.min(window.innerHeight - 220, Math.max(16, target.bottom + 12)) : window.innerHeight / 2 - 100;
  const left = target ? Math.min(window.innerWidth - 336, Math.max(16, target.left)) : Math.max(16, window.innerWidth / 2 - 160);

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none" aria-live="polite">
      {target && <div className="fixed rounded-xl ring-4 ring-purple-500 ring-offset-4 ring-offset-white/70 dark:ring-offset-black/60" style={{ top: target.top, left: target.left, width: target.width, height: target.height }} />}
      <section role="dialog" aria-label="Page tour" className="pointer-events-auto fixed w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-purple-300 bg-white p-4 shadow-2xl dark:border-purple-500/50 dark:bg-[#171220]" style={{ top, left }}>
        <div className="flex items-start justify-between gap-3">
          <div><p className="text-[11px] font-bold uppercase tracking-wide text-purple-600">Quick tour · {index + 1}/{tour.points.length}</p><h2 className="mt-1 text-sm font-bold text-gray-900 dark:text-white">{point.title}</h2></div>
          <button type="button" onClick={finish} aria-label="Skip tour" className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10"><X className="h-4 w-4" /></button>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-gray-600 dark:text-gray-300">{point.body}</p>
        <div className="mt-4 flex items-center justify-between">
          <button type="button" onClick={finish} className="text-xs font-semibold text-gray-500">Skip</button>
          <div className="flex gap-2">
            {index > 0 && <button type="button" onClick={() => setIndex(index - 1)} className="rounded-xl border border-purple-200 px-3 py-1.5 text-xs font-semibold text-purple-700 dark:text-purple-200">Back</button>}
            <button type="button" onClick={() => index + 1 < tour.points.length ? setIndex(index + 1) : finish()} className="rounded-xl bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white">{index + 1 < tour.points.length ? 'Next' : 'Done'}</button>
          </div>
        </div>
      </section>
    </div>
  );
}
