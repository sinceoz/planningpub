'use client';

import { useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { usePubyAuth } from '@/hooks/puby/useAuth';
import { useExpenses } from '@/hooks/puby/useExpenses';
import { useProjects } from '@/hooks/puby/useProjects';
import FileUpload, { type OcrResult } from './FileUpload';
import { notifyExpenseSubmitted } from '@/lib/puby/notifications';
import { getVendorCache, saveVendorCache } from '@/lib/puby/documentCache';
import type { ExpenseFile, ExpenseStatus } from '@/types/puby';

export default function VendorForm() {
  const t = useTranslations('puby.expense');
  const tv = useTranslations('puby.expense.vendorForm');
  const router = useRouter();
  const { pubyUser } = usePubyAuth();
  const { createExpense } = useExpenses();
  const { projects } = useProjects();

  const folderId = useMemo(() => {
    const now = new Date();
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return `puby/expenses/vendor/${ym}/${Date.now()}`;
  }, []);

  const [projectId, setProjectId] = useState('');
  const [amount, setAmount] = useState(0);
  const [companyName, setCompanyName] = useState('');
  const [businessNumber, setBusinessNumber] = useState('');
  const [representative, setRepresentative] = useState('');
  const [address, setAddress] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<ExpenseFile[]>([]);
  const [extraFiles, setExtraFiles] = useState<ExpenseFile[]>([]);
  const [notifyByEmail, setNotifyByEmail] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cacheLoaded, setCacheLoaded] = useState(false);

  const handleOcrResult = useCallback(async (result: OcrResult) => {
    if (result.companyName) setCompanyName(result.companyName);
    if (result.businessNumber) setBusinessNumber(result.businessNumber);
    if (result.representative) setRepresentative(result.representative);
    if (result.address) setAddress(result.address);
    if (result.bankName) setBankName(result.bankName);
    if (result.accountNumber) setAccountNumber(result.accountNumber);
    if (result.accountHolder) setAccountHolder(result.accountHolder);
    if (result.amount) setAmount(result.amount);
    if (result.description) setDescription(result.description);

    // 사업자등록번호로 기존 거래처 문서 캐시 조회
    if (result.businessNumber && !cacheLoaded) {
      try {
        const cached = await getVendorCache(result.businessNumber);
        if (cached?.files?.length) {
          setCacheLoaded(true);
          setFiles((prev) => {
            const existingUrls = new Set(prev.map((f) => f.url));
            const newFiles = cached.files.filter((f) => !existingUrls.has(f.url));
            return newFiles.length > 0 ? [...prev, ...newFiles] : prev;
          });
        }
      } catch {}
    }
  }, [cacheLoaded]);

  async function handleSave(status: ExpenseStatus) {
    if (!pubyUser || !projectId) return;
    setSubmitting(true);
    try {
      const newId = await createExpense({
        type: 'vendor', projectId, createdBy: pubyUser.uid, status,
        amount, netAmount: amount, approvalHistory: [], notifyByEmail, files, extraFiles,
        vendorDetails: { businessNumber, companyName, representative, address, bankName, accountNumber, accountHolder, description },
      } as any);

      // 거래처 문서 캐시 저장
      if (businessNumber && files.length > 0) {
        saveVendorCache(businessNumber, companyName, files).catch(() => {});
      }

      if (status === 'submitted') {
        const project = projects.find((p) => p.id === projectId);
        if (project) {
          notifyExpenseSubmitted({
            expenseId: newId,
            project,
            actorName: pubyUser.displayName,
            actorUid: pubyUser.uid,
            expenseTitle: companyName || '업체비',
          }).catch(() => {});
        }
      }
      router.push('/puby/expense');
    } finally { setSubmitting(false); }
  }

  const inputClass = "w-full px-3 py-2 rounded-lg bg-surface-secondary border border-border-default focus:border-brand-purple focus:outline-none text-text-primary text-sm";
  const labelClass = "block text-sm text-text-muted mb-1";

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">{tv('title')}</h1>
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
          <div><label className={labelClass}>{tv('companyName')}</label><input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required className={inputClass} /></div>
          <div><label className={labelClass}>{tv('businessNumber')}</label><input type="text" value={businessNumber} onChange={(e) => setBusinessNumber(e.target.value)} required className={inputClass} /></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className={labelClass}>{tv('representative')}</label><input type="text" value={representative} onChange={(e) => setRepresentative(e.target.value)} className={inputClass} /></div>
          <div><label className={labelClass}>{tv('address')}</label><input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} /></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><label className={labelClass}>{tv('bankName')}</label><input type="text" value={bankName} onChange={(e) => setBankName(e.target.value)} required className={inputClass} /></div>
          <div><label className={labelClass}>{tv('accountNumber')}</label><input type="text" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} required className={inputClass} /></div>
          <div><label className={labelClass}>{tv('accountHolder')}</label><input type="text" value={accountHolder} onChange={(e) => setAccountHolder(e.target.value)} required className={inputClass} /></div>
        </div>
        <div><label className={labelClass}>{tv('description')}</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={inputClass} /></div>
        <div>
          <label className="block text-sm text-text-muted mb-1">증빙 서류</label>
          <p className="text-xs text-text-dim mb-2">사업자등록증, 통장사본, 세금계산서만 업로드해 주세요. 업로드 시 자동으로 OCR 분석됩니다.</p>
          <FileUpload files={files} onChange={setFiles} storagePath={folderId} ocrType="vendor" onOcrResult={handleOcrResult} />
          {cacheLoaded && (
            <p className="text-xs text-brand-mint mt-1">기존 거래처 서류가 자동으로 불러와졌습니다.</p>
          )}
        </div>
        <div>
          <label className="block text-sm text-text-muted mb-1">기타 서류</label>
          <p className="text-xs text-text-dim mb-2">계약서, 견적서 등 참고파일을 업로드해 주세요.</p>
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
