'use client';

import type { ExpenseStatus } from '@/types/puby';
import { useTranslations } from 'next-intl';

const STATUS_STYLES: Record<ExpenseStatus, string> = {
  draft: 'bg-gray-500/10 text-gray-400',
  submitted: 'bg-blue-500/10 text-blue-400',
  manager_approved: 'bg-amber-500/10 text-amber-400',
  approved: 'bg-green-500/10 text-green-400',
  rejected: 'bg-red-500/10 text-red-400',
  completed: 'bg-emerald-500/10 text-emerald-400',
};

export default function StatusBadge({ status }: { status: ExpenseStatus }) {
  const t = useTranslations('puby.expense.statuses');
  return (
    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLES[status] || ''}`}>
      {t(status)}
    </span>
  );
}
