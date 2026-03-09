'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import { BUDGET_OPTIONS } from '@/lib/constants';

export default function ContactForm() {
  const t = useTranslations('contact.form');
  const locale = useLocale();
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('sending');

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      organization: '',
      email: formData.get('email') as string,
      projectName: formData.get('projectName') as string,
      date: formData.get('date') as string,
      details: formData.get('details') as string,
      budget: formData.get('budget') as string,
    };

    // name에서 이름/소속 분리
    const nameParts = data.name.split('/').map((s) => s.trim());
    if (nameParts.length > 1) {
      data.name = nameParts[0];
      data.organization = nameParts[1];
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const inputClass = 'w-full px-4 py-3 text-sm bg-bg-card border border-border-default rounded-lg text-text-primary placeholder:text-text-dim focus:outline-none focus:border-brand-purple transition-colors';

  if (status === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-16 glass rounded-xl"
      >
        <div className="text-5xl mb-4">✓</div>
        <p className="text-xl font-semibold text-brand-mint">{t('success')}</p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm text-text-muted mb-2">{t('name')}</label>
          <input name="name" required placeholder="홍길동 / (주)플래닝펍" className={inputClass} />
        </div>
        <div>
          <label className="block text-sm text-text-muted mb-2">{t('email')}</label>
          <input name="email" type="email" required placeholder="email@example.com" className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm text-text-muted mb-2">{t('projectName')}</label>
          <input name="projectName" placeholder="2025 글로벌 컨퍼런스" className={inputClass} />
        </div>
        <div>
          <label className="block text-sm text-text-muted mb-2">{t('date')}</label>
          <input name="date" type="date" className={inputClass} />
        </div>
      </div>

      <div>
        <label className="block text-sm text-text-muted mb-2">{t('budget')}</label>
        <select name="budget" className={`${inputClass} cursor-pointer`} defaultValue="">
          <option value="" disabled>{t('budgetPlaceholder')}</option>
          {BUDGET_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {locale === 'ko' ? opt.labelKo : opt.labelEn}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm text-text-muted mb-2">{t('details')}</label>
        <textarea
          name="details"
          required
          rows={5}
          placeholder="프로젝트에 대해 자세히 알려주세요..."
          className={`${inputClass} resize-none`}
        />
      </div>

      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full py-4 text-base font-semibold bg-gradient-to-r from-brand-purple to-brand-mint text-white rounded-lg flex items-center justify-center gap-2 hover:shadow-[0_8px_25px_-8px_var(--color-brand-mint-glow)] transition-all disabled:opacity-50 cursor-pointer"
      >
        {status === 'sending' ? t('sending') : (
          <>
            <Send size={18} />
            {t('submit')}
          </>
        )}
      </button>

      {status === 'error' && (
        <p className="text-sm text-error text-center">{t('error')}</p>
      )}
    </form>
  );
}
