'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { COMPANY, SOCIAL_LINKS } from '@/lib/constants';
import { Instagram, Youtube, Linkedin } from 'lucide-react';

export default function Footer() {
  const t = useTranslations('footer');

  return (
    <footer className="border-t border-border-default bg-bg-dark">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 회사 정보 */}
          <div>
            <Link href="/" className="inline-block">
              <img
                src="/logos/white22.png"
                alt="PlanningPub"
                className="h-8"
              />
            </Link>
            <p className="mt-3 text-sm text-text-muted leading-relaxed">
              {COMPANY.address}
            </p>
            <p className="mt-1 text-sm text-text-muted">
              T. {COMPANY.phone} / F. {COMPANY.fax}
            </p>
            <p className="mt-1 text-sm text-text-muted">
              {COMPANY.email}
            </p>
          </div>

          {/* 메뉴 */}
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-text-primary mb-2">Menu</h3>
            <Link href="/about" className="text-sm text-text-muted hover:text-brand-mint transition-colors">About Us</Link>
            <Link href="/portfolio" className="text-sm text-text-muted hover:text-brand-mint transition-colors">Portfolio</Link>
            <Link href="/contact" className="text-sm text-text-muted hover:text-brand-mint transition-colors">Contact</Link>
            <Link href="/planninghub" className="text-sm text-text-muted hover:text-brand-mint transition-colors">PlanningHUB</Link>
          </div>

          {/* SNS */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-4">Follow Us</h3>
            <div className="flex gap-3">
              <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" className="p-2 border border-border-default rounded-lg hover:border-brand-mint hover:text-brand-mint transition-colors">
                <Instagram size={18} />
              </a>
              <a href={SOCIAL_LINKS.youtube} target="_blank" rel="noopener noreferrer" className="p-2 border border-border-default rounded-lg hover:border-brand-mint hover:text-brand-mint transition-colors">
                <Youtube size={18} />
              </a>
              <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 border border-border-default rounded-lg hover:border-brand-mint hover:text-brand-mint transition-colors">
                <Linkedin size={18} />
              </a>
            </div>
          </div>
        </div>

        {/* 하단 */}
        <div className="mt-10 pt-6 border-t border-border-default flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-text-dim">{t('copyright')}</p>
          <div className="flex gap-4">
            <span className="text-xs text-text-dim hover:text-text-muted cursor-pointer transition-colors">{t('privacy')}</span>
            <span className="text-xs text-text-dim hover:text-text-muted cursor-pointer transition-colors">{t('terms')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
