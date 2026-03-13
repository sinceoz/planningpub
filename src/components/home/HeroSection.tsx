'use client';

import { useTranslations } from 'next-intl';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { useRef } from 'react';

export default function HeroSection() {
  const t = useTranslations('hero');
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-end overflow-hidden"
    >
      {/* ── Background Image Layer ── */}
      <motion.div className="absolute inset-0 -top-20" style={{ y: bgY }}>
        <motion.img
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1.05, opacity: 1 }}
          transition={{ duration: 2.4, ease: 'easeOut' }}
          src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1920&q=80"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover opacity-[0.12]"
          draggable={false}
        />
      </motion.div>

      {/* ── Gradient Overlays ── */}
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-dark)] via-[var(--color-bg-dark)]/92 to-[var(--color-bg-dark)]/50" />
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-bg-dark)]/70 via-transparent to-transparent" />

      {/* ── Ambient Glow ── */}
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] rounded-full bg-brand-purple/8 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] rounded-full bg-brand-mint/5 blur-[120px] pointer-events-none" />

      {/* ── Accumulation Lines — visual metaphor ── */}
      <div className="absolute right-6 md:right-12 lg:right-20 top-[30%] flex flex-col gap-5 items-end pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 0.06 + i * 0.035 }}
            transition={{
              delay: 1.4 + i * 0.15,
              duration: 0.9,
              ease: [0.23, 1, 0.32, 1],
            }}
            className="h-[1px] origin-right"
            style={{
              width: `${40 + i * 24}px`,
              background:
                'linear-gradient(90deg, transparent 0%, var(--color-brand-mint) 100%)',
            }}
          />
        ))}
      </div>

      {/* ── Grid Pattern (subtle) ── */}
      <div
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-20 pb-16 md:pb-24 pt-44 md:pt-52">
        <div className="max-w-4xl">
          {/* — Headline 1: "행사는 소비되고," — ephemeral, blurs in */}
          <motion.p
            initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
            animate={{ opacity: 0.45, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="text-[1.7rem] md:text-[2.8rem] lg:text-[3.4rem] font-medium text-text-primary leading-snug tracking-[-0.02em]"
          >
            {t('headline1')}
          </motion.p>

          {/* — Headline 2-3: "플랫폼은 / 축적된다" — permanent, bold gradient */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, delay: 0.55, ease: [0.23, 1, 0.32, 1] }}
            className="mt-1 md:mt-2"
          >
            <span className="hero-gradient-text block text-[2.8rem] md:text-[4.5rem] lg:text-[5.8rem] font-bold leading-[1.05] tracking-[-0.03em]">
              {t('headline2')}
            </span>
            <span className="hero-gradient-text block text-[2.8rem] md:text-[4.5rem] lg:text-[5.8rem] font-bold leading-[1.05] tracking-[-0.03em]">
              {t('headline3')}
            </span>
          </motion.h1>

          {/* — Gradient Divider — draws left to right */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.9, delay: 1.1, ease: [0.23, 1, 0.32, 1] }}
            className="h-[1px] w-20 md:w-36 my-7 md:my-9 origin-left"
            style={{
              background:
                'linear-gradient(90deg, var(--color-brand-purple), var(--color-brand-mint))',
            }}
          />

          {/* — Body: problem statement */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.35 }}
            className="text-[0.95rem] md:text-[1.1rem] text-text-dim max-w-xl leading-[1.8] tracking-[-0.01em]"
          >
            {t('body1')}
          </motion.p>

          {/* — Body: manifesto answer */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.6 }}
            className="mt-5 max-w-xl"
          >
            <p className="text-[0.95rem] md:text-[1.1rem] text-text-muted leading-[1.8] tracking-[-0.01em] whitespace-pre-line">
              {t('body2')}
            </p>
            <p className="text-[0.95rem] md:text-[1.1rem] text-text-primary leading-[1.8] tracking-[-0.01em] mt-3 font-semibold">
              {t('body3')}
            </p>
          </motion.div>

          {/* — CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.9 }}
            className="mt-9 md:mt-11 flex flex-col sm:flex-row items-start gap-3"
          >
            <Link
              href="/contact"
              className="group inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold rounded-lg transition-all
                bg-gradient-to-r from-brand-purple to-brand-mint text-white
                hover:shadow-[0_8px_32px_-6px_var(--color-brand-mint-glow)] hover:-translate-y-0.5"
            >
              {t('cta')}
              <ArrowRight
                size={15}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold rounded-lg transition-all
                border border-border-default text-text-muted
                hover:border-border-hover hover:text-text-primary"
            >
              {t('portfolioCta')}
            </Link>
          </motion.div>
        </div>

        {/* ── Stats Bar — "축적" 증거 ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 2.2 }}
          className="mt-14 md:mt-20 pt-6 border-t border-white/[0.06]"
        >
          <div className="flex gap-8 md:gap-14">
            <div>
              <p className="text-xl md:text-2xl font-bold hero-gradient-text">
                {t('stat1Value')}
              </p>
              <p className="text-[0.65rem] md:text-xs text-text-dim mt-1 tracking-[0.15em] uppercase">
                {t('stat1Label')}
              </p>
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold hero-gradient-text">
                {t('stat2Value')}
              </p>
              <p className="text-[0.65rem] md:text-xs text-text-dim mt-1 tracking-[0.15em] uppercase">
                {t('stat2Label')}
              </p>
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold hero-gradient-text">
                {t('stat3Value')}
              </p>
              <p className="text-[0.65rem] md:text-xs text-text-dim mt-1 tracking-[0.15em] uppercase">
                {t('stat3Label')}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Scroll Hint ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.0 }}
        className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown size={18} className="text-text-dim/60" />
        </motion.div>
      </motion.div>
    </section>
  );
}
