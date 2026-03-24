'use client';
import { useTranslations } from 'next-intl';
export default function ProjectsPage() {
  const t = useTranslations('puby.sidebar');
  return <h1 className="text-2xl font-bold">{t('projects')}</h1>;
}
