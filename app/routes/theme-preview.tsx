import { useState } from 'react';
import { Link } from 'react-router';
import { ArrowUpRight, MapPin, MessageCircle, ShieldCheck } from 'lucide-react';
import { AppearanceSettings } from '~/components/settings/AppearanceSettings';
import { PurpleThemeWrapper } from '~/components/layout/PurpleThemeWrapper';
import { HiringCardModal } from '~/components/hiring/HiringCardModal';
import { ChangePlanModal } from '~/components/subscriptions/ChangePlanModal';
import { CreditBalanceCard } from '~/components/subscriptions/CreditBalanceCard';
import type { Subscription, SubscriptionPlan } from '~/types/payments';
import { Navigation } from '~/components/Navigation';
import { Footer } from '~/components/Footer';
import { useTheme } from '~/contexts/ThemeContext';

// A local design review surface; never available in a production build.
export function loader() { if (!import.meta.env.DEV) throw new Response('Not found', { status: 404 }); return null; }
export const meta = () => [{ title: 'Theme collections · HomeBit local preview' }, { name: 'robots', content: 'noindex' }];
const primary = 'inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:from-purple-700 hover:to-pink-700 disabled:opacity-50';

const previewPlan: SubscriptionPlan = { id: 'preview-quarterly', name: 'Quarterly', description: 'Quarterly membership', price_amount: 134900, billing_cycle: 'quarterly', profile_type: 'household', trial_days: 0, display_order: 1, is_active: true, max_profiles: 1, max_applications: 0, max_hires: 0, created_at: '2026-09-25', updated_at: '2026-09-25' };
const previewSubscription: Subscription = { id: 'preview-subscription', user_id: 'preview', profile_id: 'preview', profile_type: 'household', plan_id: 'preview-monthly', status: 'active', current_period_start: '2026-09-16', current_period_end: '2026-10-16', cancel_at_period_end: false, created_at: '2026-09-16', updated_at: '2026-09-16' };

export default function ThemePreview() {
  const [open, setOpen] = useState(false);
  const [billingOpen, setBillingOpen] = useState(false);
  const { themeCollection, theme } = useTheme();
  return <div className="flex min-h-screen flex-col">
    <Navigation />
    <PurpleThemeWrapper>
      <main className="mx-auto w-full max-w-6xl px-5 pb-16 pt-28 sm:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-purple-600 dark:text-purple-300">HomeBit / Local design preview</p>
            <h1 className="text-3xl font-semibold tracking-tight text-gray-950 dark:text-white">A little more you.</h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-gray-600 dark:text-gray-400">Two collections. The same HomeBit. Explore the quieter side with Refined, or keep the expressive energy of Vivid.</p>
          </div>
          <span className="rounded-full border border-purple-200 bg-white px-4 py-2 text-xs text-gray-600 dark:border-purple-700 dark:bg-[#13131a] dark:text-gray-300">{themeCollection === 'refined' ? 'Refined' : 'Vivid'} · {theme === 'dark' ? 'Dark' : 'Light'}</span>
        </div>
        <div className="grid items-start gap-7 lg:grid-cols-[1fr_1.15fr]">
          <AppearanceSettings localPreview />
          <div className="space-y-5">
            <section className="rounded-2xl border border-purple-200 bg-white p-6 shadow-light-glow-sm dark:border-purple-500/30 dark:bg-[#13131a] dark:shadow-glow-sm">
              <div className="mb-5 flex items-start justify-between gap-3">
                <div><p className="text-xs text-gray-500 dark:text-gray-400">Your household</p><h2 className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">Find the right help.</h2></div>
                <ShieldCheck className="h-6 w-6 text-purple-600 dark:text-purple-300"/>
              </div>
              <div className="rounded-xl border border-purple-100 p-4 dark:border-purple-500/30">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 font-semibold text-white">AK</span>
                  <div><h3 className="font-semibold text-gray-900 dark:text-white">Alex K.</h3><p className="mt-1 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400"><MapPin size={13}/>Nairobi · Household support</p></div>
                  <span className="ml-auto rounded-full bg-purple-100 px-3 py-1 text-xs text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">Available</span>
                </div>
                <p className="my-4 text-sm leading-relaxed text-gray-600 dark:text-gray-300">Reliable help for everyday life. Experienced in childcare, cooking and keeping a home running smoothly.</p>
                <button type="button" className={primary} onClick={() => setOpen(true)}>View hiring details <ArrowUpRight size={16}/></button>
              </div>
            </section>
            <section className="rounded-2xl border border-purple-200 bg-white p-6 dark:border-purple-500/30 dark:bg-[#13131a]">
              <h2 className="font-semibold text-gray-900 dark:text-white">Simple, considered details</h2>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Inputs, buttons and dialogs follow your collection.</p>
              <label htmlFor="preview-phone" className="mb-2 mt-5 block text-xs font-medium text-purple-700 dark:text-purple-300">Phone number</label>
              <input id="preview-phone" type="tel" inputMode="tel" placeholder="0712 345 678" className="auth-input"/>
              <div className="mt-4 flex flex-wrap items-center gap-3"><button type="button" className={primary} onClick={() => setOpen(true)}><MessageCircle size={16}/>Preview modal</button><button type="button" disabled className={primary}>Unavailable</button></div>
              <Link to="/forgot-password" className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-purple-600 dark:text-purple-300">View the real recovery page <ArrowUpRight size={14}/></Link>
            </section>
          </div>
        </div>
        <section aria-label="Signed-in workspace styles" className="mt-8">
          <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Inside your workspace</h2>
          <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">Check chat styling and the real subscription dialog with sample data.</p>
          <div className="grid gap-5 sm:grid-cols-2">
            <section aria-label="Inbox style sample" className="rounded-2xl border border-purple-200 bg-white p-6 dark:border-purple-500/30 dark:bg-[#13131a] shadow-[0_0_15px_rgba(168,85,247,0.15)] dark:shadow-[0_0_20px_rgba(168,85,247,0.3)]">
              <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Inbox</h3>
              <p className="rounded-2xl bg-purple-50 p-4 text-sm text-gray-700 dark:bg-[#0f0f16] dark:text-gray-200">Hello! Is tomorrow a good time to talk?</p>
              <p className="ml-8 mt-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 p-4 text-sm text-white">Yes, tomorrow works well. Thank you.</p>
              <label htmlFor="preview-chat" className="mb-2 mt-5 block text-xs text-gray-500 dark:text-gray-400">Message</label>
              <textarea id="preview-chat" placeholder="Write a message…" className="w-full resize-none rounded-2xl border border-purple-300/80 bg-purple-50/70 p-3 text-sm text-gray-900 dark:border-purple-500/40 dark:bg-[#0f0a16] dark:text-white" />
            </section>
            <section aria-label="Subscription style sample" className="space-y-4 rounded-2xl border border-purple-200 bg-white p-6 dark:border-purple-500/30 dark:bg-[#13131a]">
              <h3 className="font-semibold text-gray-900 dark:text-white">Subscriptions</h3>
              <CreditBalanceCard creditBalance={0} formatted="No credits available" />
              <button type="button" className={primary} onClick={() => setBillingOpen(true)}>Preview subscription dialog</button>
            </section>
          </div>
        </section>
        <p className="mt-8 text-xs text-gray-500 dark:text-gray-400">Sample content for design review. This preview saves appearance on this device only; no account settings, hires or payments are changed.</p>
      </main>
    </PurpleThemeWrapper>
    <Footer />
    <ChangePlanModal isOpen={billingOpen} onClose={() => setBillingOpen(false)} currentSubscription={previewSubscription} newPlan={previewPlan} startsAt={new Date('2026-10-16T00:00:00+03:00')} onConfirm={async () => setBillingOpen(false)} />
    <HiringCardModal open={open} onClose={() => setOpen(false)} eyebrow="Hire request details" title="Household support" initials="AK" status="Shortlisted" summary="I would love to help your household. Let's find a time to talk."
      fields={[{ label: 'Location', value: 'Nairobi' }, { label: 'Schedule', value: 'Full time' }, { label: 'Start', value: 'Flexible' }]}
      actions={<><button type="button" className="rounded-xl border border-purple-300 px-5 py-3 text-sm text-purple-700 dark:text-purple-300" onClick={() => setOpen(false)}>Close preview</button><button type="button" className={primary} onClick={() => setOpen(false)}><MessageCircle size={16}/>Chat</button></>}/>
  </div>;
}
