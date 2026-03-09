'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import SectionLabel from '@/components/ui/SectionLabel';
import GlassCard from '@/components/ui/GlassCard';
import { Layers, MessageCircle, Archive, BarChart3 } from 'lucide-react';

const ICONS = [Layers, MessageCircle, Archive, BarChart3];
const CARD_KEYS = ['platform', 'communication', 'archive', 'data'] as const;
const COLORS = ['brand-purple', 'brand-mint', 'brand-purple', 'brand-mint'];

export default function MicePlatformerSection() {
  const t = useTranslations('micePlatformer');

  return (
    <section className="py-24 px-6">
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
          className="text-text-muted mt-3 max-w-xl"
        >
          {t('subtitle')}
        </motion.p>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          {CARD_KEYS.map((key, i) => {
            const Icon = ICONS[i];
            const color = COLORS[i];
            return (
              <GlassCard key={key} className="p-8">
                <div className={`w-12 h-12 rounded-xl bg-${color}/10 flex items-center justify-center mb-5`}>
                  <Icon size={24} className={`text-${color}`} />
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  {t(`cards.${key}.title`)}
                </h3>
                <p className="text-text-muted leading-relaxed">
                  {t(`cards.${key}.desc`)}
                </p>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
