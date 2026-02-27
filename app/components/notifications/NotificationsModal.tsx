import React, { useState } from 'react';
import { Modal } from '~/components/Modal';
import { useNotifications, NotificationItem } from '~/hooks/useNotifications';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationsModal({ isOpen, onClose }: Props) {
  const { items, markAllAsRead, markOneAsRead } = useNotifications({ pollingMs: 15000, pageSize: 20 });
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Notifications">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-base font-semibold">Recent</h4>
          <button onClick={onMarkAll} className="text-sm text-purple-600 hover:text-purple-700">Mark all as read</button>
        </div>
        <ul className="divide-y divide-gray-200">
          {items.length === 0 && (
            <li className="py-6 text-sm text-gray-500">You're all caught up. No notifications.</li>
          )}
          {items.map((n) => (
            <li key={n.id} className={`py-3 cursor-pointer ${!n.clicked ? 'bg-purple-50/60' : ''}`} onClick={() => onClickItem(n)}>
              <div className="flex items-start justify-between">
                <div className="pr-3 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{n.title || 'Notification'}</p>
                  <p className={`mt-1 text-sm ${!expanded[n.id] ? 'line-clamp-2' : ''} text-gray-700`}>{n.message || n.body || ''}</p>
                </div>
                <div className="flex-shrink-0 text-xs text-gray-500 ml-2">{formatTime(n.created_at || n.createdAt)}</div>
              </div>
              {expanded[n.id] && (
                <div className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{n.message || n.body || ''}</div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  );
}
