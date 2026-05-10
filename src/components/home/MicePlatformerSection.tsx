'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import SectionLabel from '@/components/ui/SectionLabel';
import { Layers, ListChecks, FolderTree, Database } from 'lucide-react';

const CARDS = [
  { key: 'platform', Icon: Layers, accent: 'purple', span: 'md:col-span-2' },
  { key: 'communication', Icon: ListChecks, accent: 'mint', span: '' },
  { key: 'archive', Icon: FolderTree, accent: 'purple', span: '' },
  { key: 'data', Icon: Database, accent: 'mint', span: 'md:col-span-2' },
] as const;

export default function MicePlatformerSection() {
  const t = useTranslations('micePlatformer');

  return (
    <section className="py-28 md:py-36 px-6 md:px-12 lg:px-20 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-brand-mint/5 blur-[200px] pointer-events-none" />

      <div className="max-w-7xl mx-auto">
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

        {/* Bento grid: first card spans 2 cols, middle 2 are 1 col each, last spans 2 cols */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-5">
          {CARDS.map((card, i) => {
            const isAccentPurple = card.accent === 'purple';
            return (
              <motion.div
                key={card.key}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.1,
                  ease: [0.23, 1, 0.32, 1],
                }}
                className={`group relative overflow-hidden rounded-xl
                  bg-bg-surface border border-border-default backdrop-blur-xl
                  hover:bg-bg-surface-hover hover:border-border-hover hover:-translate-y-1
                  transition-all duration-400 hover:shadow-glass-hover
                  ${card.span} ${card.span ? 'p-8 md:p-10' : 'p-8'}`}
              >
                {/* Gradient top border on hover */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-brand-purple to-brand-mint opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-colors duration-300 ${
                  isAccentPurple
                    ? 'bg-brand-purple/10 group-hover:bg-brand-purple/20'
                    : 'bg-brand-mint/10 group-hover:bg-brand-mint/20'
                }`}>
                  <card.Icon size={24} className={`transition-colors duration-300 ${
                    isAccentPurple ? 'text-brand-purple' : 'text-brand-mint'
                  }`} />
                </div>

                <h3 className="text-xl md:text-2xl font-semibold text-text-primary mb-2 tracking-[-0.01em]">
                  {t(`cards.${card.key}.title`)}
                </h3>
                <p className="text-text-muted leading-[1.8] max-w-lg">
                  {t(`cards.${card.key}.desc`)}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
