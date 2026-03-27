'use client';

import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import {
  FileText, CheckCircle, XCircle, CircleDot, UserCheck,
} from 'lucide-react';
import type { PubyNotification, NotificationType } from '@/types/puby';
import { Timestamp } from 'firebase/firestore';

const iconMap: Record<NotificationType, typeof FileText> = {
  expense_submitted: FileText,
  expense_approved: CheckCircle,
  expense_rejected: XCircle,
  expense_completed: CircleDot,
  expense_manager_approved: UserCheck,
  invite: FileText,
};

const colorMap: Record<NotificationType, string> = {
  expense_submitted: 'text-blue-400',
  expense_approved: 'text-green-400',
  expense_rejected: 'text-red-400',
  expense_completed: 'text-brand-mint',
  expense_manager_approved: 'text-yellow-400',
  invite: 'text-brand-purple',
};

function timeAgo(ts: Timestamp): string {
  const now = Date.now();
  const diff = now - ts.toMillis();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return '방금';
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}

interface Props {
  notification: PubyNotification;
  onRead: (id: string) => void;
  onClose: () => void;
}

export default function NotificationItem({ notification, onRead, onClose }: Props) {
  const router = useRouter();
  const locale = useLocale();
  const Icon = iconMap[notification.type] || FileText;
  const iconColor = colorMap[notification.type] || 'text-text-muted';

  function handleClick() {
    if (!notification.read) {
      onRead(notification.id);
    }
    if (notification.relatedId) {
      router.push(`/${locale}/puby/expense/${notification.relatedId}`);
      onClose();
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`w-full flex items-start gap-3 px-3 py-2.5 text-left transition-colors rounded-lg hover:bg-surface-secondary ${
        !notification.read ? 'bg-surface-secondary/50' : ''
      }`}
    >
      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${iconColor}`} />
      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-tight ${!notification.read ? 'font-medium text-text-primary' : 'text-text-muted'}`}>
          {notification.title}
        </p>
        <p className="text-xs text-text-muted mt-0.5 truncate">
          {notification.message}
        </p>
        <p className="text-xs text-text-muted/60 mt-1">
          {timeAgo(notification.createdAt)}
        </p>
      </div>
      {!notification.read && (
        <span className="w-2 h-2 rounded-full bg-brand-purple shrink-0 mt-1.5" />
      )}
    </button>
  );
}
