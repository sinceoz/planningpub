'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { ArrowRight } from 'lucide-react';

export default function CTASection() {
  const t = useTranslations('cta');

  return (
    <section className="py-24 px-6 relative overflow-hidden">
      {/* 배경 그라디언트 */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-brand-purple/15 blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-bold text-text-primary leading-tight whitespace-pre-line"
        >
          {t('title')}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-5 text-text-muted text-lg"
        >
          {t('subtitle')}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <Link
            href="/contact"
            className="group mt-10 inline-flex items-center gap-2 px-8 py-4 text-base font-semibold bg-gradient-to-r from-brand-purple to-brand-mint text-white rounded-lg hover:shadow-[0_8px_30px_-8px_var(--color-brand-mint-glow)] hover:-translate-y-0.5 transition-all"
          >
            {t('button')}
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
