'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import SectionLabel from '@/components/ui/SectionLabel';
import { Shield } from 'lucide-react';

// 인증/파트너 플레이스홀더 (실제 로고 이미지로 교체 필요)
const CERTIFICATIONS = [
  'MICE Alliance',
  'PCO 인증',
  'Korea MICE Bureau',
  'ICCA Member',
  'ISO 9001',
  'Seoul Tourism Organization',
  'MICE Korea',
  'Convention Bureau',
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

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {CERTIFICATIONS.map((cert, i) => (
            <motion.div
              key={cert}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="flex flex-col items-center gap-3 p-6 rounded-xl border border-border-default bg-bg-surface hover:bg-bg-surface-hover transition-colors"
            >
              <Shield size={28} className="text-text-dim" />
              <span className="text-xs text-text-muted text-center">{cert}</span>
            </motion.div>
          ))}
        </div>
        <p className="mt-6 text-sm text-text-dim text-center">
          * 실제 인증 및 파트너 로고로 교체 예정
        </p>
      </div>
    </section>
  );
}
