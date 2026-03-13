'use client';

import { useLocale, useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Calendar, MapPin } from 'lucide-react';
import type { PortfolioItem } from '@/types';

interface PortfolioCardProps {
  item: PortfolioItem;
  index: number;
  onClick: () => void;
}

function parseOrganizer(org: string) {
  const parts = org.split(' / ');
  return { host: parts[0] || '', manager: parts[1] || '' };
}

export default function PortfolioCard({ item, index, onClick }: PortfolioCardProps) {
  const locale = useLocale();
  const t = useTranslations('portfolio');

  const title = locale === 'ko' ? item.title : item.titleEn;
  const venue = locale === 'ko' ? (item.venue || '') : (item.venueEn || '');
  const orgStr = locale === 'ko' ? (item.organizer || '') : (item.organizerEn || '');
  const { host, manager } = parseOrganizer(orgStr);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className="group relative overflow-hidden rounded-xl border border-border-default bg-bg-surface hover:border-brand-mint/30 hover:bg-bg-surface-hover transition-all cursor-pointer"
    >
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

      <div className="p-5 md:p-6">
        {/* Year badge */}
        <span className="inline-block text-xs font-semibold text-brand-mint tracking-wider mb-3">
          {item.year}
        </span>

        {/* Title */}
        <h3 className="text-base md:text-lg font-semibold text-text-primary group-hover:text-brand-mint transition-colors leading-snug">
          {title}
        </h3>

        {/* Meta */}
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

        {/* Organizer */}
        {(host || manager) && (
          <div className="mt-3 pt-3 border-t border-border-default text-xs text-text-dim space-y-1">
            {host && (
              <div>
                <span className="text-text-dim/70">{t('host')}</span>{' '}
                <span className="text-text-muted">{host}</span>
              </div>
            )}
            {manager && (
              <div>
                <span className="text-text-dim/70">{t('manager')}</span>{' '}
                <span className="text-text-muted">{manager}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
