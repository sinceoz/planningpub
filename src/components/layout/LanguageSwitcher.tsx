'use client';

import { usePathname, useRouter } from '@/i18n/routing';
import { useLocale } from 'next-intl';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const toggle = () => {
    const next = locale === 'ko' ? 'en' : 'ko';
    router.replace(pathname, { locale: next });
  };

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold tracking-wider border border-border-default rounded-full hover:border-border-hover transition-colors cursor-pointer"
    >
      <span className={locale === 'ko' ? 'text-brand-mint' : 'text-text-muted'}>KO</span>
      <span className="text-text-dim">/</span>
      <span className={locale === 'en' ? 'text-brand-mint' : 'text-text-muted'}>EN</span>
    </button>
  );
}
