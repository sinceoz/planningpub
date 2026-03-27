'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { usePubyAuth } from '@/hooks/puby/useAuth';
import { useExpenses } from '@/hooks/puby/useExpenses';
import { useProjects } from '@/hooks/puby/useProjects';
import { Timestamp } from 'firebase/firestore';
import FileUpload, { type OcrResult } from './FileUpload';
import { notifyExpenseSubmitted } from '@/lib/puby/notifications';
import { copyFilesToFolder } from '@/lib/puby/expenseFolder';
import type { ExpenseFile, ExpenseStatus } from '@/types/puby';

export default function CardForm() {
  const t = useTranslations('puby.expense');
  const tc = useTranslations('puby.expense.cardForm');
  const router = useRouter();
  const { pubyUser } = usePubyAuth();
  const { createExpense } = useExpenses();
  const { projects } = useProjects();

  const folderId = useMemo(() => {
    const now = new Date();
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return `puby/expenses/card/${ym}/${Date.now()}`;
  }, []);

  const [projectId, setProjectId] = useState('');
  const [amount, setAmount] = useState(0);
  const [storeName, setStoreName] = useState('');
  const [paymentDateTime, setPaymentDateTime] = useState('');
  const [cardLastFour, setCardLastFour] = useState('');
  const [description, setDescription] = useState('');
  const [reason, setReason] = useState('');
  const [files, setFiles] = useState<ExpenseFile[]>([]);
  const [extraFiles, setExtraFiles] = useState<ExpenseFile[]>([]);
  const [notifyByEmail, setNotifyByEmail] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function handleOcrResult(result: OcrResult) {
    if (result.storeName) setStoreName(result.storeName);
    if (result.amount) setAmount(result.amount);
    if (result.paymentDateTime) setPaymentDateTime(result.paymentDateTime);
    if (result.cardLastFour) setCardLastFour(result.cardLastFour);
    if (result.description) setDescription(result.description);
  }

  async function handleSave(status: ExpenseStatus) {
    if (!pubyUser || !projectId) return;
    setSubmitting(true);
    try {
      const newId = await createExpense({
        type: 'card', projectId, createdBy: pubyUser.uid, status,
        amount, netAmount: amount, approvalHistory: [], notifyByEmail, files, extraFiles,
        cardDetails: {
          storeName,
          paymentDateTime: paymentDateTime ? Timestamp.fromDate(new Date(paymentDateTime)) : Timestamp.now(),
          cardLastFour: cardLastFour || undefined,
          description, reason,
        },
      } as any);
      const project = projects.find((p) => p.id === projectId);
      if (status === 'submitted' && project) {
        notifyExpenseSubmitted({
          expenseId: newId, project, actorName: pubyUser.displayName,
          actorUid: pubyUser.uid, expenseTitle: storeName || '카드',
        }).catch(() => {});
      }

      if (project) {
        const now = new Date();
        copyFilesToFolder({
          id: newId, type: 'card', projectId, createdBy: pubyUser.uid, status, amount, netAmount: amount,
          approvalHistory: [], notifyByEmail, files, extraFiles,
          cardDetails: { storeName, paymentDateTime: Timestamp.fromDate(paymentDateTime ? new Date(paymentDateTime) : now), cardLastFour, description, reason },
          createdAt: { toDate: () => now } as any, updatedAt: { toDate: () => now } as any,
        } as any, project.name).catch(() => {});
      }

      router.push('/puby/expense');
    } finally { setSubmitting(false); }
  }

  const inputClass = "w-full px-3 py-2 rounded-lg bg-surface-secondary border border-border-default focus:border-brand-purple focus:outline-none text-text-primary text-sm";
  const labelClass = "block text-sm text-text-muted mb-1";

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">{tc('title')}</h1>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className={labelClass}>{t('project')}</label>
            <select value={projectId} onChange={(e) => setProjectId(e.target.value)} required className={inputClass}>
              <option value="">선택</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div><label className={labelClass}>{t('amount')}</label><input type="number" value={amount || ''} onChange={(e) => setAmount(Number(e.target.value))} required min={0} className={inputClass} /></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className={labelClass}>{tc('storeName')}</label><input type="text" value={storeName} onChange={(e) => setStoreName(e.target.value)} required className={inputClass} /></div>
          <div><label className={labelClass}>{tc('paymentDateTime')}</label><input type="datetime-local" value={paymentDateTime} onChange={(e) => setPaymentDateTime(e.target.value)} required className={inputClass} /></div>
        </div>
        <div><label className={labelClass}>{tc('cardLastFour')}</label><input type="text" value={cardLastFour} onChange={(e) => setCardLastFour(e.target.value)} maxLength={4} className={`${inputClass} max-w-[120px]`} placeholder="0000" /></div>
        <div><label className={labelClass}>{tc('description')}</label><input type="text" value={description} onChange={(e) => setDescription(e.target.value)} required className={inputClass} /></div>
        <div><label className={labelClass}>{tc('reason')}</label><textarea value={reason} onChange={(e) => setReason(e.target.value)} required rows={3} className={inputClass} /></div>
        <FileUpload files={files} onChange={setFiles} storagePath={folderId} ocrType="card" onOcrResult={handleOcrResult} />
        <div>
          <label className="block text-sm text-text-muted mb-2">기타 서류 (견적서, 계약서 등)</label>
          <FileUpload files={extraFiles} onChange={setExtraFiles} storagePath={`${folderId}/extra`} />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={notifyByEmail} onChange={(e) => setNotifyByEmail(e.target.checked)} className="accent-brand-purple" />
          <span className="text-sm text-text-muted">{t('notifyByEmail')}</span>
        </label>
        <div className="flex gap-3">
          <button onClick={() => handleSave('draft')} disabled={submitting} className="px-6 py-2.5 rounded-lg border border-border-default text-text-primary hover:bg-surface-secondary transition-colors disabled:opacity-50">{t('saveDraft')}</button>
          <button onClick={() => handleSave('submitted')} disabled={submitting || !projectId || !amount} className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-brand-purple to-brand-mint text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50">{t('submit')}</button>
        </div>
      </div>
    </div>
  );
}
