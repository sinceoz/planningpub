'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useProjects } from '@/hooks/puby/useProjects';
import StatusBadge from '@/components/puby/expense/StatusBadge';
import ApprovalActions from '@/components/puby/expense/ApprovalActions';
import { formatCurrency } from '@/lib/puby/format';
import { calculateTaxDeduction } from '@/lib/puby/tax';
import type { PubyExpense } from '@/types/puby';

const TYPE_LABELS: Record<string, string> = { labor: '인건비', vendor: '업체', card: '카드' };

export default function ExpenseDetailPage() {
  const t = useTranslations('puby.expense');
  const params = useParams();
  const id = params.id as string;
  const [expense, setExpense] = useState<PubyExpense | null>(null);
  const [loading, setLoading] = useState(true);
  const { projects } = useProjects();

  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(doc(db, 'puby_expenses', id), (snap) => {
      if (snap.exists()) setExpense({ id: snap.id, ...snap.data() } as PubyExpense);
      setLoading(false);
    });
    return unsub;
  }, [id]);

  if (loading) return <div className="text-center text-text-muted py-12">Loading...</div>;
  if (!expense) return <div className="text-center text-red-400 py-12">결의서를 찾을 수 없습니다.</div>;

  const project = projects.find((p) => p.id === expense.projectId) || null;
  const isLabor = expense.type === 'labor' && expense.laborDetails;
  const taxCalc = isLabor ? calculateTaxDeduction(expense.amount, expense.laborDetails!.taxType) : null;

  const rowClass = "flex justify-between py-2 border-b border-border-default";
  const labelStyle = "text-text-muted text-sm";
  const valueStyle = "text-text-primary text-sm font-medium";

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{TYPE_LABELS[expense.type]} {t('title')}</h1>
        <StatusBadge status={expense.status} />
      </div>

      <div className="space-y-1">
        <div className={rowClass}><span className={labelStyle}>{t('project')}</span><span className={valueStyle}>{project?.name || '-'}</span></div>
        <div className={rowClass}><span className={labelStyle}>{t('amount')}</span><span className={valueStyle}>{formatCurrency(expense.amount)}</span></div>
        {taxCalc && (
          <>
            <div className={rowClass}><span className={labelStyle}>{t('taxDeduction')}</span><span className="text-red-400 text-sm">-{formatCurrency(taxCalc.taxAmount)}</span></div>
            <div className={rowClass}><span className={labelStyle}>{t('netAmount')}</span><span className="text-text-primary text-sm font-bold">{formatCurrency(taxCalc.netAmount)}</span></div>
          </>
        )}
      </div>

      {/* Type-specific details */}
      {expense.laborDetails && (
        <div className="mt-6 p-4 bg-surface-secondary rounded-lg space-y-1">
          <h3 className="text-sm font-medium text-text-primary mb-2">인건비 상세</h3>
          <div className={rowClass}><span className={labelStyle}>성명</span><span className={valueStyle}>{expense.laborDetails.name}</span></div>
          <div className={rowClass}><span className={labelStyle}>은행</span><span className={valueStyle}>{expense.laborDetails.bankName} {expense.laborDetails.accountNumber}</span></div>
          <div className={rowClass}><span className={labelStyle}>근무기간</span><span className={valueStyle}>{expense.laborDetails.workPeriod.start} ~ {expense.laborDetails.workPeriod.end}</span></div>
          <div className={rowClass}><span className={labelStyle}>업무내용</span><span className={valueStyle}>{expense.laborDetails.workDescription}</span></div>
        </div>
      )}

      {expense.vendorDetails && (
        <div className="mt-6 p-4 bg-surface-secondary rounded-lg space-y-1">
          <h3 className="text-sm font-medium text-text-primary mb-2">업체 상세</h3>
          <div className={rowClass}><span className={labelStyle}>상호</span><span className={valueStyle}>{expense.vendorDetails.companyName}</span></div>
          <div className={rowClass}><span className={labelStyle}>사업자번호</span><span className={valueStyle}>{expense.vendorDetails.businessNumber}</span></div>
          <div className={rowClass}><span className={labelStyle}>은행</span><span className={valueStyle}>{expense.vendorDetails.bankName} {expense.vendorDetails.accountNumber}</span></div>
        </div>
      )}

      {expense.cardDetails && (
        <div className="mt-6 p-4 bg-surface-secondary rounded-lg space-y-1">
          <h3 className="text-sm font-medium text-text-primary mb-2">카드 상세</h3>
          <div className={rowClass}><span className={labelStyle}>사용처</span><span className={valueStyle}>{expense.cardDetails.storeName}</span></div>
          <div className={rowClass}><span className={labelStyle}>사용사유</span><span className={valueStyle}>{expense.cardDetails.reason}</span></div>
        </div>
      )}

      {/* Files */}
      {expense.files.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-text-primary mb-2">증빙 서류</h3>
          <div className="space-y-1">
            {expense.files.map((f, i) => (
              <a key={i} href={f.url} target="_blank" rel="noopener noreferrer" className="block text-sm text-brand-purple hover:underline">{f.name}</a>
            ))}
          </div>
        </div>
      )}

      {expense.extraFiles && expense.extraFiles.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-text-primary mb-2">기타 서류</h3>
          <div className="space-y-1">
            {expense.extraFiles.map((f, i) => (
              <a key={i} href={f.url} target="_blank" rel="noopener noreferrer" className="block text-sm text-brand-purple hover:underline">{f.name}</a>
            ))}
          </div>
        </div>
      )}

      {/* Rejection reason */}
      {expense.rejectionReason && (
        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <h3 className="text-sm font-medium text-red-400 mb-1">{t('rejectionReason')}</h3>
          <p className="text-sm text-text-primary">{expense.rejectionReason}</p>
        </div>
      )}

      {/* Approval history */}
      {expense.approvalHistory.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-text-primary mb-2">{t('approvalHistory')}</h3>
          <div className="space-y-2">
            {expense.approvalHistory.map((entry, i) => (
              <div key={i} className="text-xs text-text-muted">
                <span className="font-medium">{entry.action}</span> by {entry.role} — {entry.at?.toDate?.()?.toLocaleString('ko-KR') || ''}
                {entry.comment && <span className="block ml-4 text-text-muted">{entry.comment}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      <ApprovalActions expense={expense} project={project} />
    </div>
  );
}
