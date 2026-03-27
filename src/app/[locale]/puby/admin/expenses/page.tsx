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
import type { PubyExpense, ExpenseStatus, ExpenseType, NotificationType } from '@/types/puby';
import { Check, X, ChevronDown, ChevronUp, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

const TYPE_LABELS: Record<string, string> = { labor: '인건비', vendor: '업체', card: '카드' };
const STATUS_LABELS: Record<string, string> = {
  submitted: '제출', manager_approved: '팀장승인', approved: '승인', rejected: '반려', completed: '완료',
};

function getExpenseLabel(exp: PubyExpense) {
  if (exp.type === 'labor') return exp.laborDetails?.name || '';
  if (exp.type === 'vendor') return exp.vendorDetails?.companyName || '';
  return exp.cardDetails?.storeName || '';
}

function getBankInfo(exp: PubyExpense) {
  if (exp.type === 'vendor' && exp.vendorDetails) {
    return { bankName: exp.vendorDetails.bankName, accountNumber: exp.vendorDetails.accountNumber, accountHolder: exp.vendorDetails.accountHolder };
  }
  if (exp.type === 'labor' && exp.laborDetails) {
    return { bankName: exp.laborDetails.bankName, accountNumber: exp.laborDetails.accountNumber, accountHolder: exp.laborDetails.accountHolder };
  }
  return { bankName: '', accountNumber: '', accountHolder: '' };
}

export default function ExpenseApprovalPage() {
  const t = useTranslations('puby.expense');
  const { pubyUser } = usePubyAuth();
  const { expenses, loading, updateExpense } = useExpenses();
  const { projects } = useProjects();

  const [filterStatus, setFilterStatus] = useState<string>('submitted');
  const [filterProject, setFilterProject] = useState('');
  const [filterType, setFilterType] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [expectedPaymentDate, setExpectedPaymentDate] = useState('');
  const [submitting, setSubmitting] = useState<string | null>(null);

  if (pubyUser?.role !== 'admin') return null;

  const projectNames = new Map(projects.map((p) => [p.id, p.name]));
  const projectMap = new Map(projects.map((p) => [p.id, p]));

  const filtered = expenses.filter((exp) => {
    if (exp.status === 'draft') return false;
    if (filterStatus && exp.status !== filterStatus) return false;
    if (filterProject && exp.projectId !== filterProject) return false;
    if (filterType && exp.type !== filterType) return false;
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

  function handleExportExcel() {
    // 참고 양식: *입금은행 | *입금계좌 | 고객관리성명 | *입금액 | 출금통장표시내용 | 입금통장표시내용 | 입금인코드 | 비고 | 업체사용key
    const rows = filtered.map((exp) => {
      const bank = getBankInfo(exp);
      return {
        '*입금은행': bank.bankName,
        '*입금계좌': bank.accountNumber,
        '고객관리성명': '',
        '*입금액': exp.type === 'labor' ? exp.netAmount : exp.amount,
        '출금통장표시내용': '',
        '입금통장표시내용': '',
        '입금인코드': '',
        '비고': '',
        '업체사용key': '',
      };
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    // Column widths
    ws['!cols'] = [
      { wch: 12 }, { wch: 20 }, { wch: 14 }, { wch: 14 },
      { wch: 16 }, { wch: 16 }, { wch: 12 }, { wch: 12 }, { wch: 14 },
    ];

    const today = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `지결_${filterStatus || '전체'}_${today}.xlsx`);
  }

  const selectClass = "px-3 py-1.5 rounded-lg bg-surface-secondary border border-border-default text-text-primary text-sm focus:outline-none focus:border-brand-purple";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">지결 승인</h1>
        <button
          onClick={handleExportExcel}
          disabled={filtered.length === 0}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border-default text-text-muted hover:text-text-primary text-sm transition-colors disabled:opacity-50"
        >
          <Download className="w-4 h-4" /> 엑셀 내보내기
        </button>
      </div>

      {/* 상태 탭 */}
      <div className="flex flex-wrap gap-2 mb-3">
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

      {/* 프로젝트/유형 필터 */}
      <div className="flex flex-wrap gap-2 mb-4">
        <select value={filterProject} onChange={(e) => setFilterProject(e.target.value)} className={selectClass}>
          <option value="">프로젝트: 전체</option>
          {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className={selectClass}>
          <option value="">유형: 전체</option>
          <option value="labor">인건비</option>
          <option value="vendor">업체</option>
          <option value="card">카드</option>
        </select>
        <span className="text-xs text-text-muted self-center">{filtered.length}건</span>
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
                  onClick={() => { setExpandedId(isExpanded ? null : exp.id); setRejectionReason(''); setExpectedPaymentDate(''); }}
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
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {exp.type === 'vendor' && exp.vendorDetails && (
                        <>
                          <div><span className="text-text-muted">상호:</span> <span className="text-text-primary">{exp.vendorDetails.companyName}</span></div>
                          <div><span className="text-text-muted">사업자번호:</span> <span className="text-text-primary">{exp.vendorDetails.businessNumber}</span></div>
                          <div><span className="text-text-muted">은행:</span> <span className="text-text-primary">{exp.vendorDetails.bankName} {exp.vendorDetails.accountNumber}</span></div>
                          <div><span className="text-text-muted">예금주:</span> <span className="text-text-primary">{exp.vendorDetails.accountHolder}</span></div>
                          {exp.vendorDetails.description && (
                            <div className="col-span-2"><span className="text-text-muted">비고:</span> <span className="text-text-primary">{exp.vendorDetails.description}</span></div>
                          )}
                        </>
                      )}
                      {exp.type === 'labor' && exp.laborDetails && (
                        <>
                          <div><span className="text-text-muted">성명:</span> <span className="text-text-primary">{exp.laborDetails.name}</span></div>
                          <div><span className="text-text-muted">주민번호:</span> <span className="text-text-primary">{exp.laborDetails.residentId}</span></div>
                          <div><span className="text-text-muted">은행:</span> <span className="text-text-primary">{exp.laborDetails.bankName} {exp.laborDetails.accountNumber}</span></div>
                          <div><span className="text-text-muted">예금주:</span> <span className="text-text-primary">{exp.laborDetails.accountHolder}</span></div>
                          <div><span className="text-text-muted">실지급액:</span> <span className="text-text-primary font-medium">{formatCurrency(exp.netAmount)}</span></div>
                        </>
                      )}
                      {exp.type === 'card' && exp.cardDetails && (
                        <>
                          <div><span className="text-text-muted">가맹점:</span> <span className="text-text-primary">{exp.cardDetails.storeName}</span></div>
                          <div><span className="text-text-muted">카드:</span> <span className="text-text-primary">****{exp.cardDetails.cardLastFour}</span></div>
                        </>
                      )}
                    </div>

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

                    <Link href={`/puby/expense/${exp.id}`} className="text-xs text-brand-purple hover:underline">
                      상세 보기 →
                    </Link>

                    {(isActionable || isCompleteActionable) && (
                      <div className="border-t border-border-default pt-3 space-y-2">
                        {isActionable && (
                          <div className="flex items-center gap-2">
                            <label className="text-sm text-text-muted shrink-0">{t('paymentDate')}</label>
                            <input
                              type="date"
                              value={expectedPaymentDate}
                              onChange={(e) => setExpectedPaymentDate(e.target.value)}
                              className="px-3 py-1.5 rounded-lg bg-surface-primary border border-border-default focus:border-brand-purple focus:outline-none text-text-primary text-sm"
                            />
                            <span className="text-xs text-text-muted">(선택)</span>
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
