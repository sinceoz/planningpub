'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { usePubyAuth } from '@/hooks/puby/useAuth';
import { useExpenses } from '@/hooks/puby/useExpenses';
import { useProjects } from '@/hooks/puby/useProjects';
import { calculateTaxDeduction } from '@/lib/puby/tax';
import { formatCurrency } from '@/lib/puby/format';
import FileUpload, { type OcrResult } from './FileUpload';
import { notifyExpenseSubmitted } from '@/lib/puby/notifications';
import type { ExpenseFile, IncomeType, ExpenseStatus } from '@/types/puby';
import { Info } from 'lucide-react';

export default function LaborForm() {
  const t = useTranslations('puby.expense');
  const tl = useTranslations('puby.expense.laborForm');
  const tc = useTranslations('puby.common');
  const router = useRouter();
  const { pubyUser } = usePubyAuth();
  const { createExpense } = useExpenses();
  const { projects } = useProjects();

  const folderId = useMemo(() => {
    const now = new Date();
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return `puby/expenses/labor/${ym}/${Date.now()}`;
  }, []);

  const [projectId, setProjectId] = useState('');
  const [amount, setAmount] = useState(0);
  const [taxType, setTaxType] = useState<IncomeType>('business');
  const [name, setName] = useState('');
  const [residentId, setResidentId] = useState('');
  const [address, setAddress] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [workStart, setWorkStart] = useState('');
  const [workEnd, setWorkEnd] = useState('');
  const [workDescription, setWorkDescription] = useState('');
  const [files, setFiles] = useState<ExpenseFile[]>([]);
  const [notifyByEmail, setNotifyByEmail] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function handleOcrResult(result: OcrResult) {
    if (result.name) setName(result.name);
    if (result.residentId) setResidentId(result.residentId);
    if (result.address) setAddress(result.address);
    if (result.bankName) setBankName(result.bankName);
    if (result.accountNumber) setAccountNumber(result.accountNumber);
    if (result.accountHolder) setAccountHolder(result.accountHolder);
  }

  const taxCalc = calculateTaxDeduction(amount, taxType);

  async function handleSave(status: ExpenseStatus) {
    if (!pubyUser || !projectId) return;
    setSubmitting(true);
    try {
      const newId = await createExpense({
        type: 'labor',
        projectId,
        createdBy: pubyUser.uid,
        status,
        amount,
        taxDeduction: taxCalc.taxAmount,
        netAmount: taxCalc.netAmount,
        approvalHistory: [],
        notifyByEmail,
        files,
        laborDetails: {
          name, residentId, address, bankName, accountNumber, accountHolder,
          taxType,
          workPeriod: { start: workStart, end: workEnd },
          workDescription,
        },
      } as any);
      if (status === 'submitted') {
        const project = projects.find((p) => p.id === projectId);
        if (project) {
          notifyExpenseSubmitted({
            expenseId: newId,
            project,
            actorName: pubyUser.displayName,
            actorUid: pubyUser.uid,
            expenseTitle: name || '인건비',
          }).catch(() => {});
        }
      }
      router.push('/puby/expense');
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass = "w-full px-3 py-2 rounded-lg bg-surface-secondary border border-border-default focus:border-brand-purple focus:outline-none text-text-primary text-sm";
  const labelClass = "block text-sm text-text-muted mb-1";

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">{tl('title')}</h1>

      <div className="space-y-6">
        {/* Project + Amount */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>{t('project')}</label>
            <select value={projectId} onChange={(e) => setProjectId(e.target.value)} required className={inputClass}>
              <option value="">선택</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>{t('amount')}</label>
            <input type="number" value={amount || ''} onChange={(e) => setAmount(Number(e.target.value))} required min={0} className={inputClass} />
          </div>
        </div>

        {/* Tax type */}
        <div>
          <label className={labelClass}>{tl('taxType')}</label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="taxType" checked={taxType === 'business'} onChange={() => setTaxType('business')} className="accent-brand-purple" />
              <span className="text-sm text-text-primary">{tl('businessIncome')}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="taxType" checked={taxType === 'other'} onChange={() => setTaxType('other')} className="accent-brand-purple" />
              <span className="text-sm text-text-primary">{tl('otherIncome')}</span>
            </label>
            <div className="pt-2 border-t border-border-default">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="taxType" checked={taxType === 'daily_labor'} onChange={() => setTaxType('daily_labor')} className="accent-brand-purple" />
                <span className="text-sm text-text-primary">{tl('dailyLabor')}</span>
                <span className="inline-flex items-center gap-1 text-xs text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                  <Info className="w-3 h-3" />
                  {tl('dailyLaborNote')}
                </span>
              </label>
            </div>
          </div>
          {amount > 0 && (
            <div className="mt-3 p-3 bg-surface-secondary rounded-lg text-sm">
              <div className="flex justify-between"><span className="text-text-muted">{t('taxDeduction')}</span><span className="text-red-400">-{formatCurrency(taxCalc.taxAmount)}</span></div>
              <div className="flex justify-between mt-1"><span className="text-text-muted font-medium">{t('netAmount')}</span><span className="text-text-primary font-bold">{formatCurrency(taxCalc.netAmount)}</span></div>
            </div>
          )}
        </div>

        {/* Personal info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className={labelClass}>{tl('name')}</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} /></div>
          <div><label className={labelClass}>{tl('residentId')}</label><input type="text" value={residentId} onChange={(e) => setResidentId(e.target.value)} required className={inputClass} /></div>
        </div>
        <div><label className={labelClass}>{tl('address')}</label><input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} /></div>

        {/* Bank info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><label className={labelClass}>{tl('bankName')}</label><input type="text" value={bankName} onChange={(e) => setBankName(e.target.value)} required className={inputClass} /></div>
          <div><label className={labelClass}>{tl('accountNumber')}</label><input type="text" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} required className={inputClass} /></div>
          <div><label className={labelClass}>{tl('accountHolder')}</label><input type="text" value={accountHolder} onChange={(e) => setAccountHolder(e.target.value)} required className={inputClass} /></div>
        </div>

        {/* Work period */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className={labelClass}>{tl('workStart')}</label><input type="date" value={workStart} onChange={(e) => setWorkStart(e.target.value)} required className={inputClass} /></div>
          <div><label className={labelClass}>{tl('workEnd')}</label><input type="date" value={workEnd} onChange={(e) => setWorkEnd(e.target.value)} required className={inputClass} /></div>
        </div>
        <div><label className={labelClass}>{tl('workDescription')}</label><textarea value={workDescription} onChange={(e) => setWorkDescription(e.target.value)} required rows={3} className={inputClass} /></div>

        {/* Files */}
        <FileUpload files={files} onChange={setFiles} storagePath={folderId} ocrType="labor" onOcrResult={handleOcrResult} />

        {/* Notify */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={notifyByEmail} onChange={(e) => setNotifyByEmail(e.target.checked)} className="accent-brand-purple" />
          <span className="text-sm text-text-muted">{t('notifyByEmail')}</span>
        </label>

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={() => handleSave('draft')} disabled={submitting} className="px-6 py-2.5 rounded-lg border border-border-default text-text-primary hover:bg-surface-secondary transition-colors disabled:opacity-50">
            {t('saveDraft')}
          </button>
          <button onClick={() => handleSave('submitted')} disabled={submitting || !projectId || !amount} className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-brand-purple to-brand-mint text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50">
            {t('submit')}
          </button>
        </div>
      </div>
    </div>
  );
}
