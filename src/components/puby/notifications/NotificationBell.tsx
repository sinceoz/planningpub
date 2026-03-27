'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Bell } from 'lucide-react';
import { useNotifications } from '@/hooks/puby/useNotifications';
import NotificationItem from './NotificationItem';

export default function NotificationBell() {
  const t = useTranslations('puby.notifications');
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative p-2 text-text-muted hover:text-text-primary transition-colors rounded-lg hover:bg-surface-secondary"
        aria-label={t('title')}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto bg-surface-primary border border-border-default rounded-xl shadow-lg z-50">
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-border-default">
            <span className="text-sm font-medium text-text-primary">{t('title')}</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-brand-purple hover:underline"
              >
                {t('markAllRead')}
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-text-muted">
              {t('noNotifications')}
            </p>
          ) : (
            <div className="p-1">
              {notifications.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onRead={markAsRead}
                  onClose={() => setOpen(false)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
