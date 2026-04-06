'use client';

import { useTranslations } from 'next-intl';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';

function CountUp({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const duration = 1800;
    const start = performance.now();
    const raf = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(raf);
      else setCount(target);
    };
    requestAnimationFrame(raf);
  }, [inView, target]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

export default function HeroSection() {
  const t = useTranslations('hero');
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '10%']);
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-end overflow-hidden"
    >
      {/* ── Background: Hero Video ── */}
      <motion.div
        className="absolute inset-0 -top-20"
        style={{ y: bgY, scale: bgScale, opacity: bgOpacity }}
        aria-hidden="true"
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="w-full h-full object-cover opacity-70"
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
      </motion.div>

      {/* ── Gradient Overlays ── */}
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-dark)] via-[var(--color-bg-dark)]/70 to-[var(--color-bg-dark)]/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-bg-dark)]/60 via-transparent to-transparent" />

      {/* ── Ambient Glow ── */}
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] rounded-full bg-brand-purple/10 blur-[160px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] rounded-full bg-brand-mint/6 blur-[120px] pointer-events-none" />

      {/* ── Logo Icon — brand watermark ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 0.06, scale: 1 }}
        transition={{ duration: 2, delay: 1.2, ease: 'easeOut' }}
        className="absolute right-[-5%] md:right-[2%] lg:right-[5%] top-[20%] md:top-[18%] pointer-events-none select-none"
        aria-hidden="true"
      >
        <img
          src="/logos/logoonly.svg"
          alt=""
          aria-hidden="true"
          className="w-[320px] md:w-[480px] lg:w-[600px]"
          draggable={false}
        />
      </motion.div>

      {/* ── Content ── */}
      <motion.div
        style={{ y: contentY }}
        className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-20 pb-16 md:pb-24 pt-44 md:pt-52"
      >
        <div className="max-w-5xl">
          {/* — Headline 1: fades in blurred */}
          <motion.p
            initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
            animate={{ opacity: 0.45, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="text-[1.7rem] md:text-[2.8rem] lg:text-[3.2rem] font-medium text-text-primary leading-snug tracking-[-0.02em]"
          >
            {t('headline1')}
          </motion.p>

          {/* — Headline 2-3: massive gradient text */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, delay: 0.55, ease: [0.23, 1, 0.32, 1] }}
            className="mt-1 md:mt-2"
          >
            <span className="hero-gradient-text block text-[3.6rem] md:text-[6rem] lg:text-[7.5rem] font-bold leading-[1.02] tracking-[-0.04em]">
              {t('headline2')}
            </span>
            <span className="hero-gradient-text block text-[3.6rem] md:text-[6rem] lg:text-[7.5rem] font-bold leading-[1.02] tracking-[-0.04em]">
              {t('headline3')}
            </span>
          </motion.h1>

          {/* — Gradient Divider */}
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

          {/* — Body */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.35 }}
            className="text-[0.95rem] md:text-[1.1rem] text-text-dim max-w-xl leading-[1.8] tracking-[-0.01em]"
          >
            {t('body1')}
          </motion.p>

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
              className="group inline-flex items-center gap-3 px-8 py-4 text-base font-semibold rounded-lg transition-all
                bg-gradient-to-r from-brand-purple to-brand-mint text-white
                hover:shadow-[0_8px_32px_-6px_var(--color-brand-mint-glow)] hover:-translate-y-0.5
                active:scale-[0.98]"
            >
              {t('cta')}
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold rounded-lg transition-all
                border border-border-default text-text-muted
                hover:border-border-hover hover:text-text-primary
                active:scale-[0.98]"
            >
              {t('portfolioCta')}
            </Link>
          </motion.div>
        </div>

        {/* ── Stats — large countup numbers ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2.1 }}
          className="mt-16 md:mt-24 pt-8 border-t border-white/[0.06]"
        >
          <div className="flex gap-10 md:gap-20 lg:gap-28">
            {[
              { target: 47, suffix: '+', label: 'stat1Label' },
              { target: 38, suffix: '개국', label: 'stat2Label' },
              { target: 97, suffix: '만+', label: 'stat3Label' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 2.1 + i * 0.12 }}
              >
                <p className="text-[2.2rem] md:text-[3rem] lg:text-[3.5rem] font-bold hero-gradient-text leading-none tabular-nums">
                  <CountUp target={stat.target} suffix={stat.suffix} />
                </p>
                <p className="text-[0.65rem] md:text-xs text-text-dim mt-2 tracking-[0.15em] uppercase">
                  {t(stat.label)}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* ── Scroll Hint ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.0 }}
        className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1"
      >
        <span className="text-[0.6rem] tracking-[0.2em] text-text-dim/50 uppercase">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown size={16} className="text-text-dim/50" />
        </motion.div>
      </motion.div>
    </section>
  );
}
