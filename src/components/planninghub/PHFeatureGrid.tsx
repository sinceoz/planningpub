'use client';

import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import SectionLabel from '@/components/ui/SectionLabel';
import { PH_FEATURES } from '@/lib/constants';
import {
  Wand2, Search, MapPin, Handshake,
  MessageCircle, Database, Calculator, ShieldCheck,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  Wand2, Search, MapPin, Handshake,
  MessageCircle, Database, Calculator, ShieldCheck,
};

export default function PHFeatureGrid() {
  const t = useTranslations('planninghub');
  const locale = useLocale();

  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionLabel>{t('features')}</SectionLabel>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PH_FEATURES.map((feat, i) => {
            const Icon = ICON_MAP[feat.icon];
            const isMint = feat.color === 'mint';
            return (
              <motion.div
                key={feat.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group relative p-6 rounded-xl border border-border-default bg-bg-surface hover:bg-bg-surface-hover hover:border-border-hover hover:-translate-y-1 transition-all overflow-hidden gradient-border"
              >
                <div className={`w-11 h-11 rounded-lg ${isMint ? 'bg-brand-mint/10' : 'bg-brand-purple/10'} flex items-center justify-center mb-4`}>
                  <Icon size={22} className={isMint ? 'text-brand-mint' : 'text-brand-purple'} />
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-1">{feat.name}</h3>
                <p className="text-sm text-text-muted">
                  {locale === 'ko' ? feat.descKo : feat.descEn}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
