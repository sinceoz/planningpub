'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { usePubyAuth } from '@/hooks/puby/useAuth';
import { useExpenses } from '@/hooks/puby/useExpenses';
import { Timestamp } from 'firebase/firestore';
import type { PubyExpense, PubyProject } from '@/types/puby';

interface ApprovalActionsProps {
  expense: PubyExpense;
  project: PubyProject | null;
}

export default function ApprovalActions({ expense, project }: ApprovalActionsProps) {
  const t = useTranslations('puby.expense');
  const { pubyUser } = usePubyAuth();
  const { updateExpense } = useExpenses();
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!pubyUser) return null;

  const isAdmin = pubyUser.role === 'admin';
  const isManager = pubyUser.role === 'manager' && project?.managerId === pubyUser.uid;
  const isOwner = expense.createdBy === pubyUser.uid;

  const canManagerApprove = isManager && expense.status === 'submitted' && project?.approvalFlow === 'two_step';
  const canAdminApprove = isAdmin && (
    (expense.status === 'submitted' && project?.approvalFlow === 'direct') ||
    (expense.status === 'submitted' && (!project?.approvalFlow || !project?.managerId)) ||
    expense.status === 'manager_approved'
  );
  const canComplete = isAdmin && expense.status === 'approved';
  const canReject = (canManagerApprove || canAdminApprove) && !showRejectForm;

  async function handleAction(action: string, newStatus: string) {
    setSubmitting(true);
    try {
      const entry = { action, by: pubyUser!.uid, role: pubyUser!.role, at: Timestamp.now() };
      await updateExpense(expense.id, {
        status: newStatus as any,
        approvalHistory: [...expense.approvalHistory, entry],
        ...(action === 'reject' ? { rejectionReason } : {}),
      });
    } finally { setSubmitting(false); }
  }

  if (!canManagerApprove && !canAdminApprove && !canComplete && !canReject) return null;

  return (
    <div className="border-t border-border-default pt-4 mt-6">
      <div className="flex flex-wrap gap-2">
        {canManagerApprove && (
          <button onClick={() => handleAction('manager_approve', 'manager_approved')} disabled={submitting}
            className="px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition-colors disabled:opacity-50">
            {t('approve')} (1차)
          </button>
        )}
        {canAdminApprove && (
          <button onClick={() => handleAction('approve', 'approved')} disabled={submitting}
            className="px-4 py-2 rounded-lg bg-green-500 text-white text-sm font-medium hover:bg-green-600 transition-colors disabled:opacity-50">
            {t('approve')}
          </button>
        )}
        {canComplete && (
          <button onClick={() => handleAction('complete', 'completed')} disabled={submitting}
            className="px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50">
            {t('complete')}
          </button>
        )}
        {canReject && (
          <button onClick={() => setShowRejectForm(true)}
            className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors">
            {t('reject')}
          </button>
        )}
      </div>

      {showRejectForm && (
        <div className="mt-3 space-y-2">
          <textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)}
            placeholder={t('rejectionReason')} rows={2}
            className="w-full px-3 py-2 rounded-lg bg-surface-secondary border border-border-default focus:border-red-400 focus:outline-none text-text-primary text-sm" />
          <div className="flex gap-2">
            <button onClick={() => handleAction('reject', 'rejected')} disabled={submitting || !rejectionReason}
              className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium disabled:opacity-50">
              {t('reject')}
            </button>
            <button onClick={() => setShowRejectForm(false)} className="px-4 py-2 rounded-lg border border-border-default text-text-muted text-sm">
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
