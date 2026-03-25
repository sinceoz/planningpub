'use client';

import { useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { usePubyAuth } from '@/hooks/puby/useAuth';
import { Lock, Mail } from 'lucide-react';

export default function LoginForm() {
  const t = useTranslations('puby.login');
  const { signIn } = usePubyAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await signIn(email, password);
    } catch {
      setError(t('error'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <p className="text-sm text-text-muted text-center mb-2">PLANNINGPUB 임직원을 위한 통합 ERP 시스템</p>
      <h1 className="text-2xl font-bold text-center mb-8">{t('title')}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('email')}
            required
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-surface-secondary border border-border-default focus:border-brand-purple focus:outline-none text-text-primary placeholder:text-text-muted"
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('password')}
            required
            minLength={8}
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-surface-secondary border border-border-default focus:border-brand-purple focus:outline-none text-text-primary placeholder:text-text-muted"
          />
        </div>
        {error && (
          <p className="text-red-400 text-sm text-center">{error}</p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-brand-purple to-brand-mint text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? '...' : t('submit')}
        </button>
      </form>
      <p className="mt-6 text-sm text-text-muted text-center">
        {t('noAccount')}
      </p>
    </div>
  );
}
