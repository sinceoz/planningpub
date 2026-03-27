'use client';

import { useTranslations, useLocale } from 'next-intl';
import { FileText, CheckCircle, XCircle, CircleDot, Send } from 'lucide-react';
import Link from 'next/link';
import { Timestamp } from 'firebase/firestore';
import type { PubyExpense, ExpenseStatus } from '@/types/puby';

const statusIcons: Record<ExpenseStatus, typeof FileText> = {
  draft: FileText,
  submitted: Send,
  manager_approved: CheckCircle,
  approved: CheckCircle,
  rejected: XCircle,
  completed: CircleDot,
};

const statusColors: Record<ExpenseStatus, string> = {
  draft: 'text-text-muted',
  submitted: 'text-blue-400',
  manager_approved: 'text-yellow-400',
  approved: 'text-green-400',
  rejected: 'text-red-400',
  completed: 'text-brand-mint',
};

function relativeTime(ts: Timestamp): string {
  const diff = Date.now() - ts.toMillis();
  const min = Math.floor(diff / 60000);
  if (min < 1) return '방금';
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  return `${Math.floor(hr / 24)}일 전`;
}

interface Props {
  expenses: PubyExpense[];
}

export default function RecentActivity({ expenses }: Props) {
  const t = useTranslations('puby.dashboard');
  const te = useTranslations('puby.expense.statuses');
  const locale = useLocale();

  return (
    <div className="bg-surface-primary border border-border-default rounded-xl p-4">
      <h3 className="text-sm font-medium text-text-primary mb-3">{t('recentActivity')}</h3>

      {expenses.length === 0 ? (
        <p className="text-sm text-text-muted py-4 text-center">{t('noActivity')}</p>
      ) : (
        <ul className="space-y-2">
          {expenses.map((e) => {
            const Icon = statusIcons[e.status];
            const color = statusColors[e.status];
            const label = e.type === 'labor' ? e.laborDetails?.name
              : e.type === 'vendor' ? e.vendorDetails?.companyName
              : e.cardDetails?.storeName;

            return (
              <li key={e.id}>
                <Link
                  href={`/${locale}/puby/expense/${e.id}`}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-surface-secondary transition-colors"
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${color}`} />
                  <span className="text-sm text-text-primary truncate flex-1">{label || e.type}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${color} bg-surface-secondary`}>
                    {te(e.status)}
                  </span>
                  <span className="text-xs text-text-muted shrink-0">{relativeTime(e.updatedAt)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
