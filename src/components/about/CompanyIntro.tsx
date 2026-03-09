'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import SectionLabel from '@/components/ui/SectionLabel';
import GlassCard from '@/components/ui/GlassCard';
import { Target, Eye } from 'lucide-react';

export default function CompanyIntro() {
  const t = useTranslations('about');

  return (
    <section className="pt-32 pb-24 px-6">
      <div className="max-w-5xl mx-auto">
        <SectionLabel>{t('label')}</SectionLabel>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold text-text-primary mt-4 whitespace-pre-line leading-tight"
        >
          {t('title')}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-6 text-lg text-text-muted leading-relaxed max-w-3xl"
        >
          {t('intro')}
        </motion.p>

        {/* 미션 & 비전 */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
          <GlassCard className="p-8">
            <div className="w-12 h-12 rounded-xl bg-brand-purple/10 flex items-center justify-center mb-5">
              <Target size={24} className="text-brand-purple" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-mint">
              {t('mission.label')}
            </span>
            <h3 className="text-xl font-semibold text-text-primary mt-2 mb-3">{t('mission.title')}</h3>
            <p className="text-text-muted leading-relaxed">{t('mission.desc')}</p>
          </GlassCard>

          <GlassCard className="p-8">
            <div className="w-12 h-12 rounded-xl bg-brand-mint/10 flex items-center justify-center mb-5">
              <Eye size={24} className="text-brand-mint" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-mint">
              {t('vision.label')}
            </span>
            <h3 className="text-xl font-semibold text-text-primary mt-2 mb-3">{t('vision.title')}</h3>
            <p className="text-text-muted leading-relaxed">{t('vision.desc')}</p>
          </GlassCard>
        </div>
      </div>
    </section>
  );
}
