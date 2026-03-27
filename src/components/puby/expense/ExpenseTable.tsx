'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useExpenses } from '@/hooks/puby/useExpenses';
import { useProjects } from '@/hooks/puby/useProjects';
import { usePubyAuth } from '@/hooks/puby/useAuth';
import StatusBadge from './StatusBadge';
import { formatCurrency } from '@/lib/puby/format';
import { exportExpensesToCsv } from '@/lib/puby/csv';
import { Download, Plus } from 'lucide-react';
import type { ExpenseType, ExpenseStatus } from '@/types/puby';

const TYPE_LABELS: Record<string, string> = { labor: '인건비', vendor: '업체', card: '카드' };

export default function ExpenseTable() {
  const t = useTranslations('puby.expense');
  const { pubyUser } = usePubyAuth();
  const { projects } = useProjects();

  const [filterProject, setFilterProject] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');

  const isAdmin = pubyUser?.role === 'admin';
  const isManager = pubyUser?.role === 'manager';

  const { expenses, loading } = useExpenses({
    filterByUser: !isAdmin && !isManager,
    ...(filterProject && { projectId: filterProject }),
    ...(filterStatus && { status: filterStatus as ExpenseStatus }),
    ...(filterType && { type: filterType as ExpenseType }),
  });

  const projectNames = new Map(projects.map((p) => [p.id, p.name]));
  const selectClass = "px-3 py-1.5 rounded-lg bg-surface-secondary border border-border-default text-text-primary text-sm focus:outline-none focus:border-brand-purple";

  function handleExport() {
    const userNames = new Map<string, string>();
    exportExpensesToCsv(expenses, projectNames, userNames);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('list')}</h1>
        <div className="flex gap-2">
          <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border-default text-text-muted hover:text-text-primary text-sm transition-colors">
            <Download className="w-4 h-4" />{t('exportCsv')}
          </button>
          <Link href="/puby/expense/new/labor" className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-brand-purple to-brand-mint text-white text-sm font-semibold hover:shadow-lg transition-all">
            <Plus className="w-4 h-4" />{t('newExpense')}
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <select value={filterProject} onChange={(e) => setFilterProject(e.target.value)} className={selectClass}>
          <option value="">{t('filterProject')}: {t('filterAll')}</option>
          {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={selectClass}>
          <option value="">{t('filterStatus')}: {t('filterAll')}</option>
          {(['draft', 'submitted', 'manager_approved', 'approved', 'rejected', 'completed'] as const).map((s) => (
            <option key={s} value={s}>{t(`statuses.${s}`)}</option>
          ))}
        </select>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className={selectClass}>
          <option value="">{t('filterType')}: {t('filterAll')}</option>
          <option value="labor">{t('labor')}</option>
          <option value="vendor">{t('vendor')}</option>
          <option value="card">{t('card')}</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center text-text-muted py-12">Loading...</div>
      ) : expenses.length === 0 ? (
        <div className="text-center text-text-muted py-12">{t('noExpenses')}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-default text-text-muted text-left">
                <th className="py-3 px-3">{t('date')}</th>
                <th className="py-3 px-3">{t('project')}</th>
                <th className="py-3 px-3">{t('filterType')}</th>
                <th className="py-3 px-3 text-right">{t('amount')}</th>
                <th className="py-3 px-3">{t('status')}</th>
                <th className="py-3 px-3">{t('paymentDate')}</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((exp) => (
                <tr key={exp.id} className="border-b border-border-default hover:bg-surface-secondary/30 transition-colors">
                  <td className="py-3 px-3 text-text-muted">{exp.createdAt?.toDate?.()?.toISOString().slice(0, 10) || ''}</td>
                  <td className="py-3 px-3">
                    <Link href={`/puby/expense/${exp.id}`} className="text-text-primary hover:text-brand-purple transition-colors">
                      {projectNames.get(exp.projectId) || '-'}
                    </Link>
                  </td>
                  <td className="py-3 px-3 text-text-muted">{TYPE_LABELS[exp.type] || exp.type}</td>
                  <td className="py-3 px-3 text-right text-text-primary font-medium">{formatCurrency(exp.amount)}</td>
                  <td className="py-3 px-3"><StatusBadge status={exp.status} /></td>
                  <td className="py-3 px-3 text-text-muted text-sm">{exp.expectedPaymentDate || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
