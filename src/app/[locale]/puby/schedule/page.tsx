'use client';
import { useTranslations } from 'next-intl';
export default function TeamBoardPage() {
  const t = useTranslations('puby.sidebar');
  return <h1 className="text-2xl font-bold">{t('teamBoard')}</h1>;
}
