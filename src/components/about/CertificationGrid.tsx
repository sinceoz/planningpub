'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import SectionLabel from '@/components/ui/SectionLabel';

const PARTNERS = [
  '한국관광공사',
  '한국청소년활동진흥원',
  '소상공인시장진흥공단',
  '한국정신문화재단',
  'N15 PARTNERS',
  '우리다문화장학재단',
  '인공지능산업융합사업단',
  '연합뉴스',
  '한국청소년정책연구원',
  '가재울청소년센터',
  '경상북도콘텐츠진흥원',
  '오산교육재단',
  '경남창조경제혁신센터',
  '경기도마을공동체지원센터',
  '한국국학진흥원',
  '아동권리보장원',
  '경기도사회적경제원',
  '재외동포청',
  '미주한인상공회의소 총연합회',
];

export default function CertificationGrid() {
  const t = useTranslations('about.certification');

  return (
    <section className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <SectionLabel>{t('label')}</SectionLabel>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-text-primary mt-4 mb-12"
        >
          {t('title')}
        </motion.h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {PARTNERS.map((name, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center justify-center px-4 py-5 rounded-xl border border-border-default bg-bg-surface hover:bg-bg-surface-hover hover:border-brand-mint/20 transition-colors"
            >
              <span className="text-sm text-text-muted text-center leading-snug">
                {name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
