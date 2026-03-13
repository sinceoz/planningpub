'use client';

import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import SectionLabel from '@/components/ui/SectionLabel';
import GlassCard from '@/components/ui/GlassCard';
import { Link } from '@/i18n/routing';
import { ArrowRight, Calendar, MapPin } from 'lucide-react';
import { PORTFOLIO_DATA } from '@/lib/portfolio-data';

// featured 항목 중 최신 3개를 대표 프로젝트로 표시
const FEATURED_ITEMS = PORTFOLIO_DATA
  .filter((item) => item.featured)
  .sort((a, b) => b.year - a.year)
  .slice(0, 3);

export default function PortfolioPreview() {
  const t = useTranslations('portfolioPreview');
  const locale = useLocale();

  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-12">
          <div>
            <SectionLabel>{t('label')}</SectionLabel>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-text-primary mt-4"
            >
              {t('title')}
            </motion.h2>
          </div>
          <Link
            href="/portfolio"
            className="hidden md:flex items-center gap-2 text-sm text-brand-mint hover:gap-3 transition-all"
          >
            {t('viewAll')} <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURED_ITEMS.map((item) => {
            const title = locale === 'ko' ? item.title : item.titleEn;
            const venue = locale === 'ko' ? (item.venue || '') : (item.venueEn || '');
            return (
              <GlassCard key={item.id} className="overflow-hidden group">
                {/* Thumbnail */}
                {(item.thumbnail || item.images[0]) && (
                  <div className="aspect-[16/9] overflow-hidden bg-bg-dark">
                    <img
                      src={item.thumbnail || item.images[0]}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <div className="p-5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-brand-mint">
                    {item.year}
                  </span>
                  <h3 className="text-lg font-semibold text-text-primary mt-2 leading-snug">
                    {title}
                  </h3>
                  <div className="mt-3 flex flex-col gap-1.5 text-sm text-text-muted">
                    {item.date && (
                      <div className="flex items-center gap-2">
                        <Calendar size={13} className="text-text-dim shrink-0" />
                        <span>{item.date}</span>
                      </div>
                    )}
                    {venue && (
                      <div className="flex items-center gap-2">
                        <MapPin size={13} className="text-text-dim shrink-0" />
                        <span className="line-clamp-1">{venue}</span>
                      </div>
                    )}
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 text-sm text-brand-mint"
          >
            {t('viewAll')} <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
