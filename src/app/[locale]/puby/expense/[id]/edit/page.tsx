'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/routing';
import { doc, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { usePubyAuth } from '@/hooks/puby/useAuth';
import { useExpenses } from '@/hooks/puby/useExpenses';
import { useProjects } from '@/hooks/puby/useProjects';
import { calculateTaxDeduction } from '@/lib/puby/tax';
import { formatCurrency } from '@/lib/puby/format';
import FileUpload from '@/components/puby/expense/FileUpload';
import type { PubyExpense, ExpenseFile, ExpenseStatus, IncomeType } from '@/types/puby';

export default function ExpenseEditPage() {
  const t = useTranslations('puby.expense');
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { pubyUser } = usePubyAuth();
  const { updateExpense } = useExpenses();
  const { projects } = useProjects();

  const [expense, setExpense] = useState<PubyExpense | null>(null);
  const [loading, setLoading] = useState(true);

  // Common fields
  const [projectId, setProjectId] = useState('');
  const [amount, setAmount] = useState(0);
  const [files, setFiles] = useState<ExpenseFile[]>([]);
  const [extraFiles, setExtraFiles] = useState<ExpenseFile[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Vendor fields
  const [companyName, setCompanyName] = useState('');
  const [businessNumber, setBusinessNumber] = useState('');
  const [representative, setRepresentative] = useState('');
  const [address, setAddress] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [description, setDescription] = useState('');

  // Labor fields
  const [name, setName] = useState('');
  const [residentId, setResidentId] = useState('');
  const [laborAddress, setLaborAddress] = useState('');
  const [laborBankName, setLaborBankName] = useState('');
  const [laborAccountNumber, setLaborAccountNumber] = useState('');
  const [laborAccountHolder, setLaborAccountHolder] = useState('');
  const [taxType, setTaxType] = useState<IncomeType>('business');
  const [workStart, setWorkStart] = useState('');
  const [workEnd, setWorkEnd] = useState('');
  const [workDescription, setWorkDescription] = useState('');

  // Card fields
  const [storeName, setStoreName] = useState('');
  const [paymentDateTime, setPaymentDateTime] = useState('');
  const [cardLastFour, setCardLastFour] = useState('');
  const [cardDescription, setCardDescription] = useState('');
  const [reason, setReason] = useState('');

  const folderId = useMemo(() => `puby/expenses/edit/${id}`, [id]);

  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(doc(db, 'puby_expenses', id), (snap) => {
      if (snap.exists()) {
        const data = { id: snap.id, ...snap.data() } as PubyExpense;
        setExpense(data);
        setProjectId(data.projectId);
        setAmount(data.amount);
        setFiles(data.files || []);
        setExtraFiles(data.extraFiles || []);

        if (data.vendorDetails) {
          setCompanyName(data.vendorDetails.companyName);
          setBusinessNumber(data.vendorDetails.businessNumber);
          setRepresentative(data.vendorDetails.representative);
          setAddress(data.vendorDetails.address);
          setBankName(data.vendorDetails.bankName);
          setAccountNumber(data.vendorDetails.accountNumber);
          setAccountHolder(data.vendorDetails.accountHolder);
          setDescription(data.vendorDetails.description);
        }
        if (data.laborDetails) {
          setName(data.laborDetails.name);
          setResidentId(data.laborDetails.residentId);
          setLaborAddress(data.laborDetails.address);
          setLaborBankName(data.laborDetails.bankName);
          setLaborAccountNumber(data.laborDetails.accountNumber);
          setLaborAccountHolder(data.laborDetails.accountHolder);
          setTaxType(data.laborDetails.taxType);
          setWorkStart(data.laborDetails.workPeriod.start);
          setWorkEnd(data.laborDetails.workPeriod.end);
          setWorkDescription(data.laborDetails.workDescription);
        }
        if (data.cardDetails) {
          setStoreName(data.cardDetails.storeName);
          setPaymentDateTime(data.cardDetails.paymentDateTime?.toDate?.()?.toISOString().slice(0, 16) || '');
          setCardLastFour(data.cardDetails.cardLastFour || '');
          setCardDescription(data.cardDetails.description);
          setReason(data.cardDetails.reason);
        }
      }
      setLoading(false);
    });
    return unsub;
  }, [id]);

  if (loading) return <div className="text-center text-text-muted py-12">Loading...</div>;
  if (!expense) return <div className="text-center text-red-400 py-12">결의서를 찾을 수 없습니다.</div>;

  const canEdit = expense.createdBy === pubyUser?.uid && ['draft', 'submitted', 'rejected'].includes(expense.status);
  if (!canEdit) return <div className="text-center text-red-400 py-12">수정할 수 없는 결의서입니다.</div>;

  const taxCalc = expense.type === 'labor' ? calculateTaxDeduction(amount, taxType) : null;

  async function handleSave(status: ExpenseStatus) {
    if (!expense) return;
    setSubmitting(true);
    try {
      const update: any = {
        projectId,
        amount,
        netAmount: taxCalc ? taxCalc.netAmount : amount,
        ...(taxCalc ? { taxDeduction: taxCalc.taxAmount } : {}),
        status,
        files,
        extraFiles,
      };

      if (expense.type === 'vendor') {
        update.vendorDetails = { businessNumber, companyName, representative, address, bankName, accountNumber, accountHolder, description };
      }
      if (expense.type === 'labor') {
        update.laborDetails = {
          name, residentId, address: laborAddress, bankName: laborBankName,
          accountNumber: laborAccountNumber, accountHolder: laborAccountHolder,
          taxType, workPeriod: { start: workStart, end: workEnd }, workDescription,
        };
      }
      if (expense.type === 'card') {
        update.cardDetails = {
          storeName, description: cardDescription, reason,
          paymentDateTime: paymentDateTime ? Timestamp.fromDate(new Date(paymentDateTime)) : Timestamp.now(),
          cardLastFour: cardLastFour || undefined,
        };
      }

      // If re-submitting a rejected expense, reset rejection
      if (expense.status === 'rejected' && status === 'submitted') {
        update.rejectionReason = '';
      }

      await updateExpense(expense.id, update);
      router.push('/puby/expense');
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass = "w-full px-3 py-2 rounded-lg bg-surface-secondary border border-border-default focus:border-brand-purple focus:outline-none text-text-primary text-sm";
  const labelClass = "block text-sm text-text-muted mb-1";

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">결의서 수정</h1>

      <div className="space-y-6">
        {/* Project + Amount */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>{t('project')}</label>
            <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className={inputClass}>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>{t('amount')}</label>
            <input type="number" value={amount || ''} onChange={(e) => setAmount(Number(e.target.value))} className={inputClass} />
          </div>
        </div>

        {taxCalc && amount > 0 && (
          <div className="p-3 bg-surface-secondary rounded-lg text-sm">
            <div className="flex justify-between"><span className="text-text-muted">{t('taxDeduction')}</span><span className="text-red-400">-{formatCurrency(taxCalc.taxAmount)}</span></div>
            <div className="flex justify-between mt-1"><span className="text-text-muted font-medium">{t('netAmount')}</span><span className="text-text-primary font-bold">{formatCurrency(taxCalc.netAmount)}</span></div>
          </div>
        )}

        {/* Vendor fields */}
        {expense.type === 'vendor' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className={labelClass}>상호</label><input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>사업자번호</label><input type="text" value={businessNumber} onChange={(e) => setBusinessNumber(e.target.value)} className={inputClass} /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className={labelClass}>대표자</label><input type="text" value={representative} onChange={(e) => setRepresentative(e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>주소</label><input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><label className={labelClass}>은행명</label><input type="text" value={bankName} onChange={(e) => setBankName(e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>계좌번호</label><input type="text" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>예금주</label><input type="text" value={accountHolder} onChange={(e) => setAccountHolder(e.target.value)} className={inputClass} /></div>
            </div>
            <div><label className={labelClass}>비고</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={inputClass} /></div>
          </>
        )}

        {/* Labor fields */}
        {expense.type === 'labor' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className={labelClass}>성명</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>주민번호</label><input type="text" value={residentId} onChange={(e) => setResidentId(e.target.value)} className={inputClass} /></div>
            </div>
            <div><label className={labelClass}>주소</label><input type="text" value={laborAddress} onChange={(e) => setLaborAddress(e.target.value)} className={inputClass} /></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><label className={labelClass}>은행명</label><input type="text" value={laborBankName} onChange={(e) => setLaborBankName(e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>계좌번호</label><input type="text" value={laborAccountNumber} onChange={(e) => setLaborAccountNumber(e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>예금주</label><input type="text" value={laborAccountHolder} onChange={(e) => setLaborAccountHolder(e.target.value)} className={inputClass} /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className={labelClass}>근무 시작일</label><input type="date" value={workStart} onChange={(e) => setWorkStart(e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>근무 종료일</label><input type="date" value={workEnd} onChange={(e) => setWorkEnd(e.target.value)} className={inputClass} /></div>
            </div>
            <div><label className={labelClass}>업무내용</label><textarea value={workDescription} onChange={(e) => setWorkDescription(e.target.value)} rows={3} className={inputClass} /></div>
          </>
        )}

        {/* Card fields */}
        {expense.type === 'card' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className={labelClass}>사용처</label><input type="text" value={storeName} onChange={(e) => setStoreName(e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>결제일시</label><input type="datetime-local" value={paymentDateTime} onChange={(e) => setPaymentDateTime(e.target.value)} className={inputClass} /></div>
            </div>
            <div><label className={labelClass}>카드 뒤 4자리</label><input type="text" value={cardLastFour} onChange={(e) => setCardLastFour(e.target.value)} maxLength={4} className={`${inputClass} max-w-[120px]`} /></div>
            <div><label className={labelClass}>내용</label><input type="text" value={cardDescription} onChange={(e) => setCardDescription(e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>사용사유</label><textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} className={inputClass} /></div>
          </>
        )}

        {/* Files */}
        <div>
          <label className="block text-sm text-text-muted mb-2">증빙 서류</label>
          <FileUpload files={files} onChange={setFiles} storagePath={folderId} />
        </div>
        <div>
          <label className="block text-sm text-text-muted mb-2">기타 서류 (견적서, 계약서 등)</label>
          <FileUpload files={extraFiles} onChange={setExtraFiles} storagePath={`${folderId}/extra`} />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={() => handleSave('draft')} disabled={submitting}
            className="px-6 py-2.5 rounded-lg border border-border-default text-text-primary hover:bg-surface-secondary transition-colors disabled:opacity-50">
            {t('saveDraft')}
          </button>
          <button onClick={() => handleSave('submitted')} disabled={submitting || !projectId || !amount}
            className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-brand-purple to-brand-mint text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50">
            {t('submit')}
          </button>
        </div>
      </div>
    </div>
  );
}
