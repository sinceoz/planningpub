'use client';

import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import type { PortfolioItem } from '@/types';
import Image from 'next/image';

interface PortfolioCardProps {
  item: PortfolioItem;
  index: number;
}

export default function PortfolioCard({ item, index }: PortfolioCardProps) {
  const locale = useLocale();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      className="group relative overflow-hidden rounded-xl border border-border-default bg-bg-surface hover:border-border-hover transition-all gradient-border"
    >
      {/* 이미지 */}
      <div className="aspect-[4/3] relative overflow-hidden bg-gradient-to-br from-brand-purple/20 to-brand-mint/20">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={locale === 'ko' ? item.title : item.titleEn}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl font-display italic text-text-dim">
              {String(index + 1).padStart(2, '0')}
            </span>
          </div>
        )}
        {/* 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-dark/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* 정보 */}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-mint">
            {item.category}
          </span>
          <span className="text-xs text-text-dim">· {item.year}</span>
        </div>
        <h3 className="text-lg font-semibold text-text-primary group-hover:text-brand-mint transition-colors">
          {locale === 'ko' ? item.title : item.titleEn}
        </h3>
        <p className="text-sm text-text-muted mt-1 line-clamp-2">
          {locale === 'ko' ? item.description : item.descriptionEn}
        </p>
      </div>
    </motion.div>
  );
}
