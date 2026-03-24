'use client';
import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { usePubyAuth } from '@/hooks/puby/useAuth';
import { useRouter } from '@/i18n/routing';

export default function AdminPage() {
  const t = useTranslations('puby.sidebar');
  const { pubyUser } = usePubyAuth();
  const router = useRouter();

  useEffect(() => {
    if (pubyUser && pubyUser.role !== 'admin') {
      router.push('/puby/dashboard');
    }
  }, [pubyUser, router]);

  if (pubyUser?.role !== 'admin') return null;

  return <h1 className="text-2xl font-bold">{t('employees')}</h1>;
}
