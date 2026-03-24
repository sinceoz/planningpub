'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { User, Lock } from 'lucide-react';

interface InviteFormProps {
  token: string;
  locale: string;
}

export default function InviteForm({ token, locale }: InviteFormProps) {
  const t = useTranslations('puby.invite');
  const [inviteData, setInviteData] = useState<{
    email: string; role: string; department: string; position: string;
  } | null>(null);
  const [error, setError] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function validate() {
      try {
        const res = await fetch(`/api/puby/invite/validate?token=${token}`);
        if (!res.ok) {
          const data = await res.json();
          setError(data.error === 'used' ? t('used') : data.error === 'expired' ? t('expired') : t('invalid'));
          return;
        }
        setInviteData(await res.json());
      } catch {
        setError(t('invalid'));
      } finally {
        setLoading(false);
      }
    }
    validate();
  }, [token, t]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password !== passwordConfirm) return;
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/puby/invite/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, displayName, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error === 'used' ? t('used') : data.error === 'expired' ? t('expired') : t('invalid'));
        return;
      }

      setSucceeded(true);
    } catch {
      setError(t('invalid'));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="text-center text-text-muted">Loading...</div>;

  if (succeeded) {
    return (
      <div className="w-full max-w-sm mx-auto text-center">
        <p className="text-lg text-green-400 mb-4">{t('success')}</p>
        <a href={`/${locale}/puby`} className="text-brand-purple hover:underline">
          로그인하기
        </a>
      </div>
    );
  }

  if (error && !inviteData) {
    return <div className="text-center text-red-400 text-lg">{error}</div>;
  }
  if (!inviteData) return null;

  return (
    <div className="w-full max-w-sm mx-auto">
      <h1 className="text-2xl font-bold text-center mb-2">{t('title')}</h1>
      <p className="text-center text-text-muted mb-8">{inviteData.email}</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder={t('displayName')}
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
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            placeholder={t('passwordConfirm')}
            required
            minLength={8}
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-surface-secondary border border-border-default focus:border-brand-purple focus:outline-none text-text-primary placeholder:text-text-muted"
          />
        </div>
        {password && passwordConfirm && password !== passwordConfirm && (
          <p className="text-red-400 text-sm">비밀번호가 일치하지 않습니다.</p>
        )}
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        <button
          type="submit"
          disabled={submitting || password !== passwordConfirm}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-brand-purple to-brand-mint text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? '...' : t('submit')}
        </button>
      </form>
    </div>
  );
}
