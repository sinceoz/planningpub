'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { COMPANY } from '@/lib/constants';
import { ExternalLink } from 'lucide-react';

export default function PHHero() {
  const t = useTranslations('planninghub');

  return (
    <section className="relative pt-32 pb-24 px-6 overflow-hidden">
      {/* 배경 */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] rounded-full bg-brand-mint/15 blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/3 w-[400px] h-[400px] rounded-full bg-brand-purple/20 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* 뱃지 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full border border-brand-mint/30 bg-brand-mint/10"
        >
          <span className="w-2 h-2 rounded-full bg-brand-mint animate-glow-pulse" />
          <span className="text-sm font-semibold text-brand-mint tracking-wider">
            {t('badge')}
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-4xl md:text-6xl font-bold text-text-primary leading-tight whitespace-pre-line"
        >
          {t('title')}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-lg text-text-muted max-w-2xl mx-auto"
        >
          {t('subtitle')}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <a
            href={COMPANY.planninghub}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-8 inline-flex items-center gap-2 px-8 py-4 text-base font-semibold bg-gradient-to-r from-brand-mint to-brand-purple text-white rounded-lg hover:shadow-[0_8px_30px_-8px_var(--color-brand-mint-glow)] hover:-translate-y-0.5 transition-all"
          >
            {t('cta.button')}
            <ExternalLink size={18} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
