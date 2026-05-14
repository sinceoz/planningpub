'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import LanguageSwitcher from './LanguageSwitcher';
import MobileMenu from './MobileMenu';

const NAV_ITEMS = [
  { href: '/about', key: 'about' },
  { href: '/portfolio', key: 'portfolio' },
  { href: '/contact', key: 'contact' },
  { href: '/planninghub', key: 'planninghub' },
] as const;

export default function Navbar() {
  const t = useTranslations('nav');

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* 로고 */}
        <Link href="/" className="flex items-center">
          <img
            src="/logos/white22.png"
            alt="PlanningPub"
            className="h-7"
          />
        </Link>

        {/* 데스크톱 네비게이션 */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="text-sm text-text-muted hover:text-text-primary transition-colors"
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        {/* 우측 액션 */}
        <div className="hidden md:flex items-center gap-4">
          <LanguageSwitcher />
          <Link
            href="/contact"
            className="px-5 py-2 text-sm font-semibold bg-gradient-to-r from-brand-purple to-brand-mint text-white rounded-md hover:shadow-[0_8px_25px_-8px_var(--color-brand-mint-glow)] hover:-translate-y-0.5 transition-all"
          >
            {t('inquiry')}
          </Link>
        </div>

        {/* 모바일 메뉴 */}
        <MobileMenu />
      </div>
    </header>
  );
}
