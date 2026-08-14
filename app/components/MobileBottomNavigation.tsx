import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router';
import {
  ArrowRightOnRectangleIcon,
  BellIcon,
  BookmarkIcon,
  BriefcaseIcon,
  ChatBubbleLeftRightIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  Cog6ToothIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  EllipsisHorizontalIcon,
  HomeIcon,
  NewspaperIcon,
  UserCircleIcon,
  WrenchScrewdriverIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

import ThemeToggle from '~/components/ui/ThemeToggle';
import { PWAInstallMenuButton } from '~/components/PWAInstallPrompt';
import { useBodyScrollLock } from '~/hooks/useBodyScrollLock';

type NavigationItem = { name: string; href: string; count?: number };

interface MobileBottomNavigationProps {
  user: boolean;
  homeHref: string;
  authenticatedItems: NavigationItem[];
  profileHref: string;
  profileLabel: string;
  unreadNotifications: number;
  canSeeAdmin: boolean;
  adminUrl: string;
  onOpenNotifications: () => void;
  onLogout: () => void;
}

const guestItems = [
  { name: 'Home', href: '/', icon: HomeIcon },
  { name: 'Services', href: '/services', icon: WrenchScrewdriverIcon },
  { name: 'Blog', href: '/blog', icon: NewspaperIcon },
  { name: 'Pricing', href: '/pricing', icon: CurrencyDollarIcon },
];

const authenticatedIcon = (name: string) => {
  if (name === 'Saved') return BookmarkIcon;
  if (name === 'Inbox') return ChatBubbleOvalLeftEllipsisIcon;
  if (name === 'Hiring') return BriefcaseIcon;
  return NewspaperIcon;
};

export function MobileBottomNavigation({
  user,
  homeHref,
  authenticatedItems,
  profileHref,
  profileLabel,
  unreadNotifications,
  canSeeAdmin,
  adminUrl,
  onOpenNotifications,
  onLogout,
}: MobileBottomNavigationProps) {
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  useBodyScrollLock(moreOpen);

  useEffect(() => {
    document.body.classList.add('hb-has-mobile-bottom-nav');
    const isTextEntry = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      return target.matches("textarea, input:not([type='checkbox']):not([type='radio']):not([type='button']):not([type='submit']), [contenteditable='true'], [role='textbox']");
    };
    const handleFocusIn = (event: FocusEvent) => {
      if (!isTextEntry(event.target)) return;
      document.body.classList.add('hb-mobile-keyboard-open');
      setMoreOpen(false);
    };
    const handleFocusOut = () => {
      // Let focus move between form fields without flashing the navigation.
      window.setTimeout(() => {
        if (!isTextEntry(document.activeElement)) {
          document.body.classList.remove('hb-mobile-keyboard-open');
        }
      }, 0);
    };

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);
    return () => {
      document.body.classList.remove('hb-has-mobile-bottom-nav', 'hb-mobile-keyboard-open');
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  useEffect(() => setMoreOpen(false), [location.pathname]);

  const primaryItems: Array<NavigationItem & { icon: typeof HomeIcon }> = user
    ? [
        { name: 'Home', href: homeHref, icon: HomeIcon, count: 0 },
        ...authenticatedItems.filter((item) => item.name !== 'Blog').slice(0, 3).map((item) => ({
          ...item,
          icon: authenticatedIcon(item.name),
        })),
      ]
    : guestItems;

  const isActive = (href: string) => href === '/'
    ? location.pathname === '/'
    : location.pathname === href || location.pathname.startsWith(`${href}/`);
  const activeHref = primaryItems
    .filter((item) => isActive(item.href))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  return (
    <>
      {moreOpen && (
        <div className="lg:hidden">
          <button type="button" aria-label="Close more navigation" onClick={() => setMoreOpen(false)} className="fixed inset-0 z-40 bg-black/55 backdrop-blur-sm" />
          <section className="hb-mobile-more-sheet fixed inset-x-3 bottom-[calc(5.8rem+env(safe-area-inset-bottom,0px))] z-50 mx-auto max-w-lg overflow-y-auto overscroll-contain rounded-3xl border border-purple-300/50 bg-white p-4 shadow-2xl shadow-purple-900/30 dark:border-purple-500/30 dark:bg-[#13131a]">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-500">Navigation</p>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">More from HomeBit</h2>
              </div>
              <button type="button" onClick={() => setMoreOpen(false)} className="rounded-full border border-purple-200 p-2 text-gray-500 dark:border-purple-500/30 dark:text-gray-300" aria-label="Close">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {user ? (
                <>
                  <SheetLink to={profileHref} icon={UserCircleIcon} label={profileLabel} />
                  <SheetLink to="/settings" icon={Cog6ToothIcon} label="Settings" />
                  <SheetLink to="/subscriptions" icon={CreditCardIcon} label="Subscriptions" />
                  <SheetLink to="/blog" icon={NewspaperIcon} label="Blog" />
                  <button type="button" onClick={() => { setMoreOpen(false); onOpenNotifications(); }} className="hb-mobile-sheet-link relative">
                    <BellIcon className="h-5 w-5" /> Notifications
                    {unreadNotifications > 0 && <Badge count={unreadNotifications} />}
                  </button>
                  {canSeeAdmin && (
                    <a href={adminUrl} target="_blank" rel="noopener noreferrer" className="hb-mobile-sheet-link">
                      <Cog6ToothIcon className="h-5 w-5" /> Admin
                    </a>
                  )}
                </>
              ) : (
                <>
                  <SheetLink to="/about" icon={UserCircleIcon} label="About" />
                  <SheetLink to="/contact" icon={ChatBubbleLeftRightIcon} label="Contact" />
                  <SheetLink to="/login" icon={UserCircleIcon} label="Log in" />
                  <SheetLink to="/signup" icon={ArrowRightOnRectangleIcon} label="Sign up" accent />
                </>
              )}
            </div>

            <div className="mt-3 border-t border-purple-200/70 pt-3 dark:border-purple-500/20">
              <button type="button" onClick={() => { setMoreOpen(false); window.dispatchEvent(new Event('open-support-chat')); }} className="hb-mobile-sheet-link w-full">
                <ChatBubbleLeftRightIcon className="h-5 w-5" /> Help & support
              </button>
              <PWAInstallMenuButton />
              <div className="mt-1 flex items-center justify-between rounded-2xl px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
                <span>Theme</span><ThemeToggle size="sm" dropdownPlacement="up" />
              </div>
              {user && (
                <button type="button" onClick={() => { setMoreOpen(false); onLogout(); }} className="flex w-full items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30">
                  <ArrowRightOnRectangleIcon className="h-5 w-5" /> Log out
                </button>
              )}
            </div>
          </section>
        </div>
      )}

      <nav aria-label="Mobile navigation" className="hb-mobile-bottom-navigation fixed inset-x-0 bottom-0 z-50 border-t border-purple-200/70 bg-white/95 px-2 pb-[calc(env(safe-area-inset-bottom,0px)+0.5rem)] pt-2 backdrop-blur-xl dark:border-purple-500/20 dark:bg-[#101017]/95 lg:hidden">
        <div className="mx-auto flex max-w-lg items-stretch gap-1 rounded-[1.4rem] border border-purple-200/70 bg-white/90 p-1.5 shadow-[0_-8px_30px_rgba(147,51,234,0.14)] dark:border-purple-500/20 dark:bg-[#171721]">
          {primaryItems.map((item) => {
            const Icon = item.icon;
            const active = !moreOpen && item.href === activeHref;
            return (
              <Link key={item.name} to={item.href} prefetch="intent" className={`relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-[10px] font-semibold transition ${active ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25' : 'text-gray-500 dark:text-gray-400'}`}>
                <Icon className="h-5 w-5" />
                <span className="max-w-full truncate">{item.name}</span>
                {(item.count || 0) > 0 && <Badge count={item.count || 0} />}
              </Link>
            );
          })}
          <button type="button" onClick={() => setMoreOpen((open) => !open)} className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-[10px] font-semibold transition ${moreOpen || !activeHref ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25' : 'text-gray-500 dark:text-gray-400'}`} aria-expanded={moreOpen}>
            <EllipsisHorizontalIcon className="h-5 w-5" />
            <span>More</span>
          </button>
        </div>
      </nav>
    </>
  );
}

function SheetLink({ to, icon: Icon, label, accent = false }: { to: string; icon: typeof HomeIcon; label: string; accent?: boolean }) {
  return <Link to={to} className={`hb-mobile-sheet-link ${accent ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : ''}`}><Icon className="h-5 w-5" />{label}</Link>;
}

function Badge({ count }: { count: number }) {
  return <span className="absolute right-1.5 top-1 rounded-full bg-pink-500 px-1.5 text-[9px] font-bold leading-4 text-white">{count > 99 ? '99+' : count}</span>;
}
