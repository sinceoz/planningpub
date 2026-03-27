'use client';

import { useTranslations } from 'next-intl';
import type { PubyProject } from '@/types/puby';

interface Props {
  total: number;
  byProject: Record<string, number>;
  projects: PubyProject[];
}

export default function MonthlyExpenseSummary({ total, byProject, projects }: Props) {
  const t = useTranslations('puby.dashboard');

  const sorted = Object.entries(byProject).sort((a, b) => b[1] - a[1]);
  const projectMap = Object.fromEntries(projects.map((p) => [p.id, p.name]));

  return (
    <div className="bg-surface-primary border border-border-default rounded-xl p-4">
      <h3 className="text-sm font-medium text-text-primary mb-3">{t('monthlyExpense')}</h3>

      <div className="mb-4">
        <p className="text-xs text-text-muted">{t('totalExpense')}</p>
        <p className="text-2xl font-bold text-text-primary">{total.toLocaleString()}원</p>
      </div>

      {sorted.length > 0 && (
        <>
          <p className="text-xs text-text-muted mb-2">{t('byProject')}</p>
          <ul className="space-y-1.5">
            {sorted.map(([pid, amount]) => {
              const pct = total > 0 ? (amount / total) * 100 : 0;
              return (
                <li key={pid}>
                  <div className="flex items-center justify-between text-sm mb-0.5">
                    <span className="text-text-primary truncate">{projectMap[pid] || pid}</span>
                    <span className="text-text-muted shrink-0 ml-2">{amount.toLocaleString()}원</span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-purple rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
