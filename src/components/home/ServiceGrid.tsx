'use client';

import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import SectionLabel from '@/components/ui/SectionLabel';
import { SERVICES } from '@/lib/constants';
import {
  Calendar, Award, Users, Globe, Mic,
  Palette, Monitor, BarChart3, Megaphone, Lightbulb,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  Calendar, Award, Users, Globe, Mic,
  Palette, Monitor, BarChart3, Megaphone, Lightbulb,
};

export default function ServiceGrid() {
  const t = useTranslations('services');
  const locale = useLocale();

  return (
    <section className="py-24 px-6 bg-bg-card/50">
      <div className="max-w-6xl mx-auto">
        <SectionLabel>{t('label')}</SectionLabel>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-text-primary mt-4"
        >
          {t('title')}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-text-muted mt-3 mb-12"
        >
          {t('subtitle')}
        </motion.p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {SERVICES.map((svc, i) => {
            const Icon = ICON_MAP[svc.icon];
            return (
              <motion.div
                key={svc.icon}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group flex flex-col items-center gap-3 p-6 rounded-xl border border-border-default bg-bg-surface hover:bg-bg-surface-hover hover:border-border-hover hover:-translate-y-1 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-purple/10 flex items-center justify-center group-hover:bg-brand-mint/10 transition-colors">
                  <Icon size={22} className="text-brand-purple group-hover:text-brand-mint transition-colors" />
                </div>
                <span className="text-sm text-text-muted text-center group-hover:text-text-primary transition-colors">
                  {locale === 'ko' ? svc.labelKo : svc.labelEn}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
