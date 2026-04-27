import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { SidePanel } from '~/components/SidePanel';
import { useNotifications } from '~/hooks/useNotifications';
import type { NotificationItem } from '~/types/notifications';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

function getNotificationBody(notification: NotificationItem) {
  return notification.message || notification.body || '';
}

function isHtmlBody(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return false;
  return /^<!doctype\s+html/i.test(trimmed)
    || /^<html[\s>]/i.test(trimmed)
    || /<body[\s>]/i.test(trimmed)
    || /<\/(?:div|p|table|section|article|main|h1|h2|h3)>/i.test(trimmed);
}

function htmlPreviewSrcDoc(html: string) {
  if (/^<!doctype\s+html/i.test(html.trim()) || /^<html[\s>]/i.test(html.trim())) {
    return html;
  }

  return `<!doctype html><html><head><meta charset="utf-8"><base target="_blank"></head><body>${html}</body></html>`;
}

function NotificationBodyPreview({ body, expanded }: { body: string; expanded: boolean }) {
  if (!isHtmlBody(body)) {
    return (
      <p className={`text-xs ${!expanded ? 'line-clamp-2' : 'whitespace-pre-wrap'} text-gray-600 dark:text-gray-300 leading-relaxed`}>
        {body}
      </p>
    );
  }

  return (
    <div className="mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-purple-500/20 dark:bg-white">
      <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-3 py-2 dark:border-gray-200">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">HTML preview</span>
        <span className="text-[10px] text-gray-400">{expanded ? 'Expanded' : 'Tap to expand'}</span>
      </div>
      <iframe
        title="Notification HTML preview"
        sandbox=""
        srcDoc={htmlPreviewSrcDoc(body)}
        className={`block w-full pointer-events-none bg-white ${expanded ? 'h-[420px]' : 'h-40'}`}
      />
    </div>
  );
}

export default function NotificationsModal({ isOpen, onClose }: Props) {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { items, markAllAsRead, markOneAsRead, loadMore, hasMore, loadingMore, totalCount, showingCount } = useNotifications({ 
    pollingMs: 15000, 
    pageSize: 20,
    search: debouncedSearch
  });
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  const toggle = (id: string) => setExpanded((s) => ({ ...s, [id]: !s[id] }));

  const formatTime = (iso?: string) => {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      return d.toLocaleString();
    } catch {
      return iso || '';
    }
  };

  const onMarkAll = async () => {
    await markAllAsRead();
  };

  const onClickItem = async (n: NotificationItem) => {
    if (!n.clicked && n.id) {
      await markOneAsRead(n.id);
    }
    toggle(n.id);
  };

  const onItemKeyDown = (event: KeyboardEvent<HTMLDivElement>, notification: NotificationItem) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    void onClickItem(notification);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onScroll = () => {
      const threshold = 120; // px from bottom
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - threshold) {
        if (hasMore && !loadingMore) {
          loadMore();
        }
      }
    };

    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, [hasMore, loadingMore, loadMore]);

  return (
    <SidePanel isOpen={isOpen} onClose={onClose} title="Notifications" scrollRef={scrollRef}>
      <div className="space-y-4">
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-purple-500/20 rounded-xl leading-5 bg-white dark:bg-purple-900/10 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 sm:text-xs transition-all"
            placeholder="Search notifications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between border-b border-gray-100 dark:border-purple-500/10 pb-4">
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Recent</h4>
            {totalCount > 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Showing {showingCount} of {totalCount} results
              </p>
            )}
          </div>
          <button onClick={onMarkAll} className="text-xs font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors">Mark all as read</button>
        </div>
        <ul className="divide-y divide-gray-100 dark:divide-purple-500/10">
          {items.length === 0 && (
            <li className="py-12 text-center">
              <div className="mx-auto w-12 h-12 bg-gray-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mb-3">
                <svg className="h-6 w-6 text-gray-400 dark:text-purple-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">You&apos;re all caught up. No notifications.</p>
            </li>
          )}
          {items.map((n) => (
            <li key={n.id}>
              <div
                className={`py-4 px-2 -mx-2 rounded-xl transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${!n.clicked ? 'bg-purple-50/60 dark:bg-purple-900/10' : 'hover:bg-gray-50 dark:hover:bg-purple-900/5'}`}
                onClick={() => onClickItem(n)}
                onKeyDown={(event) => onItemKeyDown(event, n)}
                role="button"
                tabIndex={0}
              >
                <div className="flex items-start justify-between">
                  <div className="pr-3 min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {!n.clicked && <span className="flex-shrink-0 w-2 h-2 bg-purple-600 rounded-full" />}
                      <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{n.title || 'Notification'}</p>
                    </div>
                    <NotificationBodyPreview body={getNotificationBody(n)} expanded={Boolean(expanded[n.id])} />
                  </div>
                  <div className="flex-shrink-0 text-[10px] font-medium text-gray-400 dark:text-gray-500 ml-2 whitespace-nowrap">{formatTime(n.created_at || n.createdAt)}</div>
                </div>
              </div>
            </li>
          ))}
          {(loadingMore || hasMore) && (
            <li className="py-4 text-center text-xs text-gray-500 dark:text-gray-400">
              {loadingMore ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                  Loading more...
                </span>
              ) : (
                <span className="opacity-70">Scroll to load more</span>
              )}
            </li>
          )}
        </ul>
      </div>
    </SidePanel>
  );
}
