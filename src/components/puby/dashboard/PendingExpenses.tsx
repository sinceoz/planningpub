'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Clock } from 'lucide-react';
import Link from 'next/link';
import type { PubyExpense } from '@/types/puby';

interface Props {
  expenses: PubyExpense[];
  title: string;
}

const typeLabels: Record<string, string> = {
  labor: '인건비',
  vendor: '업체',
  card: '카드',
};

export default function PendingExpenses({ expenses, title }: Props) {
  const t = useTranslations('puby.dashboard');
  const te = useTranslations('puby.expense');
  const locale = useLocale();

  return (
    <div className="bg-surface-primary border border-border-default rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-text-primary">{title}</h3>
        {expenses.length > 0 && (
          <span className="text-xs font-medium text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
            {expenses.length}
          </span>
        )}
      </div>

      {expenses.length === 0 ? (
        <p className="text-sm text-text-muted py-4 text-center">{t('noPending')}</p>
      ) : (
        <ul className="space-y-2">
          {expenses.slice(0, 5).map((e) => (
            <li key={e.id}>
              <Link
                href={`/${locale}/puby/expense/${e.id}`}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-surface-secondary transition-colors"
              >
                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="text-sm text-text-primary truncate flex-1">
                  {e.type === 'labor' ? e.laborDetails?.name
                    : e.type === 'vendor' ? e.vendorDetails?.companyName
                    : e.cardDetails?.storeName}
                </span>
                <span className="text-xs text-text-muted shrink-0">
                  {typeLabels[e.type]}
                </span>
                <span className="text-xs font-medium text-text-primary shrink-0">
                  {e.amount.toLocaleString()}원
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {expenses.length > 5 && (
        <Link href={`/${locale}/puby/expense`} className="block text-center text-xs text-brand-purple mt-3 hover:underline">
          {t('viewAll')}
        </Link>
      )}
    </div>
  );
}
