'use client';
import { useTranslations } from 'next-intl';
export default function DashboardPage() {
  const t = useTranslations('puby.dashboard');
  return <h1 className="text-2xl font-bold">{t('title')}</h1>;
}
