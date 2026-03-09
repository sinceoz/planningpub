'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { COMPANY } from '@/lib/constants';
import { ExternalLink } from 'lucide-react';

export default function PHCTASection() {
  const t = useTranslations('planninghub.cta');

  return (
    <section className="py-24 px-6 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-brand-mint/15 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-text-primary"
        >
          {t('title')}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-4 text-text-muted"
        >
          {t('subtitle')}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <a
            href={COMPANY.planninghub}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-8 inline-flex items-center gap-2 px-8 py-4 text-base font-semibold bg-gradient-to-r from-brand-mint to-brand-purple text-white rounded-lg hover:shadow-[0_8px_30px_-8px_var(--color-brand-mint-glow)] hover:-translate-y-0.5 transition-all"
          >
            {t('button')}
            <ExternalLink size={18} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
