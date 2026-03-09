'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { ArrowRight, ChevronDown } from 'lucide-react';

export default function HeroSection() {
  const t = useTranslations('hero');

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* 그라디언트 배경 */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-brand-purple/20 blur-[120px] animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-brand-mint/15 blur-[120px] animate-float [animation-delay:3s]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-brand-purple/10 blur-[80px]" />
      </div>

      {/* 그리드 패턴 */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* 뱃지 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full border border-brand-purple/30 bg-brand-purple/10"
        >
          <span className="w-2 h-2 rounded-full bg-brand-mint animate-glow-pulse" />
          <span className="text-sm font-semibold text-brand-purple-light tracking-wider">
            {t('badge')}
          </span>
        </motion.div>

        {/* 타이틀 */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight"
        >
          <span className="text-text-primary">{t('title1')}</span>
          <br />
          <span className="font-display italic gradient-text">{t('title2')}</span>
        </motion.h1>

        {/* 서브타이틀 */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-6 text-lg md:text-xl text-text-muted max-w-2xl mx-auto leading-relaxed"
        >
          {t('subtitle')}
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/contact"
            className="group px-8 py-4 text-base font-semibold bg-gradient-to-r from-brand-purple to-brand-mint text-white rounded-lg hover:shadow-[0_8px_30px_-8px_var(--color-brand-mint-glow)] hover:-translate-y-0.5 transition-all flex items-center gap-2"
          >
            {t('cta')}
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/about"
            className="px-8 py-4 text-base font-semibold border border-border-default text-text-primary rounded-lg hover:border-border-hover hover:bg-bg-surface transition-all"
          >
            {t('learnMore')}
          </Link>
        </motion.div>
      </div>

      {/* 스크롤 힌트 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown size={24} className="text-text-dim" />
        </motion.div>
      </motion.div>
    </section>
  );
}
