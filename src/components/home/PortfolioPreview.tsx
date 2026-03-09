'use client';

import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import SectionLabel from '@/components/ui/SectionLabel';
import GlassCard from '@/components/ui/GlassCard';
import { Link } from '@/i18n/routing';
import { ArrowRight } from 'lucide-react';

// Firebase 연동 전 플레이스홀더 데이터
const PLACEHOLDER_ITEMS = [
  {
    id: '1',
    title: '국제 MICE 컨퍼런스 2024',
    titleEn: 'International MICE Conference 2024',
    category: 'event',
    year: 2024,
    description: '글로벌 MICE 리더 500명이 참가한 국제 컨퍼런스',
    descriptionEn: 'International conference with 500 global MICE leaders',
  },
  {
    id: '2',
    title: '기업 인센티브 투어 제주',
    titleEn: 'Corporate Incentive Tour Jeju',
    category: 'event',
    year: 2024,
    description: '200명 규모 기업 포상관광 프로그램 기획 및 운영',
    descriptionEn: 'Planning and operation of corporate incentive program for 200 people',
  },
  {
    id: '3',
    title: '컨벤션 브랜딩 디자인',
    titleEn: 'Convention Branding Design',
    category: 'design',
    year: 2023,
    description: '대한민국 대표 컨벤션의 통합 브랜딩 디자인',
    descriptionEn: 'Integrated branding design for Korea\'s premier convention',
  },
];

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
          {PLACEHOLDER_ITEMS.map((item, i) => (
            <GlassCard key={item.id} className="overflow-hidden group">
              {/* 이미지 플레이스홀더 */}
              <div className="aspect-[4/3] bg-gradient-to-br from-brand-purple/20 to-brand-mint/20 flex items-center justify-center">
                <span className="text-4xl font-display italic text-text-dim">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <div className="p-5">
                <span className="text-xs font-semibold uppercase tracking-wider text-brand-mint">
                  {item.category} · {item.year}
                </span>
                <h3 className="text-lg font-semibold text-text-primary mt-2">
                  {locale === 'ko' ? item.title : item.titleEn}
                </h3>
                <p className="text-sm text-text-muted mt-1 line-clamp-2">
                  {locale === 'ko' ? item.description : item.descriptionEn}
                </p>
              </div>
            </GlassCard>
          ))}
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
