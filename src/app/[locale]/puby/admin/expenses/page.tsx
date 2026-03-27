'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { usePubyAuth } from '@/hooks/puby/useAuth';
import { useExpenses } from '@/hooks/puby/useExpenses';
import { useProjects } from '@/hooks/puby/useProjects';
import StatusBadge from '@/components/puby/expense/StatusBadge';
import { formatCurrency } from '@/lib/puby/format';
import { Timestamp } from 'firebase/firestore';
import { notifyExpenseStatusChange } from '@/lib/puby/notifications';
import type { PubyExpense, ExpenseStatus, NotificationType } from '@/types/puby';
import { Check, X, ChevronDown, ChevronUp } from 'lucide-react';

const TYPE_LABELS: Record<string, string> = { labor: '인건비', vendor: '업체', card: '카드' };

function getExpenseLabel(exp: PubyExpense) {
  if (exp.type === 'labor') return exp.laborDetails?.name || '';
  if (exp.type === 'vendor') return exp.vendorDetails?.companyName || '';
  return exp.cardDetails?.storeName || '';
}

export default function ExpenseApprovalPage() {
  const t = useTranslations('puby.expense');
  const { pubyUser } = usePubyAuth();
  const { expenses, loading, updateExpense } = useExpenses();
  const { projects } = useProjects();
  const [filterStatus, setFilterStatus] = useState<string>('submitted');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [expectedPaymentDate, setExpectedPaymentDate] = useState('');
  const [submitting, setSubmitting] = useState<string | null>(null);

  if (pubyUser?.role !== 'admin') return null;

  const projectNames = new Map(projects.map((p) => [p.id, p.name]));
  const projectMap = new Map(projects.map((p) => [p.id, p]));

  const filtered = expenses.filter((exp) => {
    if (filterStatus && exp.status !== filterStatus) return false;
    if (exp.status === 'draft') return false;
    return true;
  });

  async function handleAction(exp: PubyExpense, action: string, newStatus: ExpenseStatus) {
    if (!pubyUser) return;
    setSubmitting(exp.id);
    try {
      const entry = { action, by: pubyUser.uid, role: pubyUser.role, at: Timestamp.now() };
      await updateExpense(exp.id, {
        status: newStatus,
        approvalHistory: [...exp.approvalHistory, entry],
        ...(action === 'reject' ? { rejectionReason } : {}),
        ...(action === 'approve' && expectedPaymentDate ? { expectedPaymentDate } : {}),
      });

      const notifTypeMap: Record<string, NotificationType> = {
        approve: 'expense_approved',
        reject: 'expense_rejected',
        complete: 'expense_completed',
        manager_approve: 'expense_manager_approved',
      };
      const notifType = notifTypeMap[action];
      if (notifType && exp.createdBy !== pubyUser.uid) {
        notifyExpenseStatusChange({
          expenseId: exp.id,
          targetUserId: exp.createdBy,
          type: notifType,
          actorName: pubyUser.displayName,
          expenseTitle: getExpenseLabel(exp) || exp.type,
        }).catch(() => {});
      }

      setExpandedId(null);
      setRejectionReason('');
      setExpectedPaymentDate('');
    } finally {
      setSubmitting(null);
    }
  }

  function canApprove(exp: PubyExpense) {
    const project = projectMap.get(exp.projectId);
    return (
      (exp.status === 'submitted' && project?.approvalFlow === 'direct') ||
      (exp.status === 'submitted' && (!project?.approvalFlow || !project?.managerId)) ||
      exp.status === 'manager_approved'
    );
  }

  const selectClass = "px-3 py-1.5 rounded-lg bg-surface-secondary border border-border-default text-text-primary text-sm focus:outline-none focus:border-brand-purple";

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">지결 승인</h1>

      <div className="flex gap-2 mb-4">
        {(['submitted', 'manager_approved', 'approved', 'rejected', 'completed', ''] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              filterStatus === s
                ? 'bg-brand-purple text-white'
                : 'bg-surface-secondary text-text-muted hover:text-text-primary'
            }`}
          >
            {s ? t(`statuses.${s}`) : '전체'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center text-text-muted py-12">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-text-muted py-12">해당하는 결의가 없습니다.</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((exp) => {
            const isExpanded = expandedId === exp.id;
            const isActionable = canApprove(exp);
            const isCompleteActionable = exp.status === 'approved';
            const busy = submitting === exp.id;

            return (
              <div key={exp.id} className="bg-surface-secondary rounded-lg overflow-hidden">
                <div
                  className="flex items-center gap-3 p-4 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : exp.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-text-primary truncate">
                        {getExpenseLabel(exp) || projectNames.get(exp.projectId) || '-'}
                      </span>
                      <span className="text-xs text-text-muted">{TYPE_LABELS[exp.type]}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
                      <span>{projectNames.get(exp.projectId)}</span>
                      <span>{exp.createdAt?.toDate?.()?.toISOString().slice(0, 10)}</span>
                      {exp.expectedPaymentDate && (
                        <span className="text-brand-mint">입금예정: {exp.expectedPaymentDate}</span>
                      )}
                    </div>
                  </div>
                  <span className="text-sm font-medium text-text-primary whitespace-nowrap">
                    {formatCurrency(exp.amount)}
                  </span>
                  <StatusBadge status={exp.status} />
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
                </div>

                {isExpanded && (
                  <div className="border-t border-border-default p-4 space-y-3">
                    {/* 상세 정보 */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {exp.type === 'vendor' && exp.vendorDetails && (
                        <>
                          <div><span className="text-text-muted">상호:</span> <span className="text-text-primary">{exp.vendorDetails.companyName}</span></div>
                          <div><span className="text-text-muted">사업자번호:</span> <span className="text-text-primary">{exp.vendorDetails.businessNumber}</span></div>
                          <div><span className="text-text-muted">은행:</span> <span className="text-text-primary">{exp.vendorDetails.bankName} {exp.vendorDetails.accountNumber}</span></div>
                          <div><span className="text-text-muted">예금주:</span> <span className="text-text-primary">{exp.vendorDetails.accountHolder}</span></div>
                        </>
                      )}
                      {exp.type === 'labor' && exp.laborDetails && (
                        <>
                          <div><span className="text-text-muted">성명:</span> <span className="text-text-primary">{exp.laborDetails.name}</span></div>
                          <div><span className="text-text-muted">은행:</span> <span className="text-text-primary">{exp.laborDetails.bankName} {exp.laborDetails.accountNumber}</span></div>
                          <div><span className="text-text-muted">예금주:</span> <span className="text-text-primary">{exp.laborDetails.accountHolder}</span></div>
                        </>
                      )}
                      {exp.type === 'card' && exp.cardDetails && (
                        <>
                          <div><span className="text-text-muted">가맹점:</span> <span className="text-text-primary">{exp.cardDetails.storeName}</span></div>
                          <div><span className="text-text-muted">카드:</span> <span className="text-text-primary">****{exp.cardDetails.cardLastFour}</span></div>
                        </>
                      )}
                    </div>

                    {/* 첨부파일 */}
                    {exp.files?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {exp.files.map((f, i) => (
                          <a key={i} href={f.url} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-brand-purple hover:underline bg-brand-purple/5 px-2 py-1 rounded">
                            {f.name}
                          </a>
                        ))}
                      </div>
                    )}

                    {/* 상세 페이지 링크 */}
                    <Link href={`/puby/expense/${exp.id}`} className="text-xs text-brand-purple hover:underline">
                      상세 보기 →
                    </Link>

                    {/* 승인/반려 액션 */}
                    {(isActionable || isCompleteActionable) && (
                      <div className="border-t border-border-default pt-3 space-y-2">
                        {isActionable && (
                          <div className="flex items-center gap-2">
                            <label className="text-sm text-text-muted">{t('paymentDate')}</label>
                            <input
                              type="date"
                              value={expectedPaymentDate}
                              onChange={(e) => setExpectedPaymentDate(e.target.value)}
                              className="px-3 py-1.5 rounded-lg bg-surface-primary border border-border-default focus:border-brand-purple focus:outline-none text-text-primary text-sm"
                            />
                          </div>
                        )}
                        <div className="flex gap-2">
                          {isActionable && (
                            <>
                              <button
                                onClick={() => handleAction(exp, 'approve', 'approved')}
                                disabled={busy}
                                className="flex items-center gap-1 px-4 py-2 rounded-lg bg-green-500 text-white text-sm font-medium hover:bg-green-600 disabled:opacity-50"
                              >
                                <Check className="w-3.5 h-3.5" /> {t('approve')}
                              </button>
                              <button
                                onClick={() => handleAction(exp, 'reject', 'rejected')}
                                disabled={busy || !rejectionReason}
                                className="flex items-center gap-1 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 text-sm font-medium hover:bg-red-500/20 disabled:opacity-50"
                              >
                                <X className="w-3.5 h-3.5" /> {t('reject')}
                              </button>
                              <input
                                type="text"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="반려 사유"
                                className="flex-1 px-3 py-1.5 rounded-lg bg-surface-primary border border-border-default text-text-primary text-sm focus:outline-none focus:border-red-400"
                              />
                            </>
                          )}
                          {isCompleteActionable && (
                            <button
                              onClick={() => handleAction(exp, 'complete', 'completed')}
                              disabled={busy}
                              className="px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 disabled:opacity-50"
                            >
                              {t('complete')}
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 반려 사유 표시 */}
                    {exp.status === 'rejected' && exp.rejectionReason && (
                      <div className="text-sm text-red-400 bg-red-500/5 p-2 rounded">
                        반려 사유: {exp.rejectionReason}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
