'use client';

import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import SectionLabel from '@/components/ui/SectionLabel';
import { SERVICES } from '@/lib/constants';
import {
  Mic, Globe, Glasses, Users, Music,
  Palette, BookOpen, Monitor, Rocket,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  Mic, Globe, Glasses, Users, Music,
  Palette, BookOpen, Monitor, Rocket,
};

export default function ServiceGrid() {
  const t = useTranslations('services');
  const locale = useLocale();

  return (
    <section className="py-28 md:py-36 overflow-hidden relative">
      {/* Subtle ambient glow */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[400px] rounded-full bg-brand-purple/5 blur-[200px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 mb-10">
        <SectionLabel>{t('label')}</SectionLabel>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-bold text-text-primary mt-4 tracking-[-0.02em]"
        >
          {t('title')}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-text-muted mt-3 max-w-xl leading-relaxed"
        >
          {t('subtitle')}
        </motion.p>
      </div>

      {/* Horizontal scroll strip */}
      <div className="overflow-x-auto scrollbar-hide pl-6 md:pl-20 lg:pl-32 pb-4">
        <div className="flex gap-4 md:gap-5 pr-6 md:pr-20">
          {SERVICES.map((svc, i) => {
            const Icon = ICON_MAP[svc.icon];
            return (
              <motion.div
                key={svc.icon}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.06,
                  ease: [0.23, 1, 0.32, 1],
                }}
                className="group shrink-0 w-[200px] md:w-[220px] p-6 rounded-xl
                  border border-border-default bg-bg-surface/60 backdrop-blur-sm
                  hover:bg-bg-surface-hover hover:border-border-hover hover:-translate-y-1
                  transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-lg bg-brand-purple/10 flex items-center justify-center mb-4 group-hover:bg-brand-mint/10 transition-colors duration-300">
                  <Icon size={20} className="text-brand-purple group-hover:text-brand-mint transition-colors duration-300" />
                </div>
                <span className="text-sm font-medium text-text-muted group-hover:text-text-primary transition-colors duration-300 leading-snug">
                  {locale === 'ko' ? svc.labelKo : svc.labelEn}
                </span>
                {(locale === 'ko' ? svc.descKo : svc.descEn) && (
                  <p className="mt-2 text-xs text-text-dim leading-relaxed line-clamp-2">
                    {locale === 'ko' ? svc.descKo : svc.descEn}
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
