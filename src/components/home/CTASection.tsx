'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { ArrowRight, Mail } from 'lucide-react';

export default function CTASection() {
  const t = useTranslations('cta');

  return (
    <section className="py-28 px-6 relative overflow-hidden">
      {/* 배경 그라디언트 */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] rounded-full bg-brand-purple/18 blur-[160px]" />
        <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[500px] h-[300px] rounded-full bg-brand-mint/8 blur-[120px]" />
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
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          {/* Primary CTA */}
          <Link
            href="/contact"
            className="group inline-flex items-center gap-2 px-8 py-4 text-base font-semibold bg-gradient-to-r from-brand-purple to-brand-mint text-white rounded-lg hover:shadow-[0_8px_30px_-8px_var(--color-brand-mint-glow)] hover:-translate-y-0.5 transition-all"
          >
            {t('button')}
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* KakaoTalk button */}
          <a
            href="https://pf.kakao.com/_xfxnxkxl"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 px-8 py-4 text-base font-semibold rounded-lg transition-all border border-[#FEE500]/40 text-[#FEE500] hover:bg-[#FEE500]/10 hover:border-[#FEE500]/70 hover:-translate-y-0.5"
          >
            {/* KakaoTalk icon */}
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M9 1.5C4.86 1.5 1.5 4.186 1.5 7.5c0 2.118 1.282 3.977 3.207 5.082L4 15l3.36-1.875A8.53 8.53 0 009 13.5c4.14 0 7.5-2.686 7.5-6S13.14 1.5 9 1.5z" />
            </svg>
            {t('kakaoButton')}
          </a>
        </motion.div>

        {/* Email link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.35 }}
          className="mt-6"
        >
          <a
            href="mailto:hello@planningpub.com"
            className="inline-flex items-center gap-1.5 text-sm text-text-dim hover:text-text-muted transition-colors"
          >
            <Mail size={14} />
            hello@planningpub.com
          </a>
        </motion.div>
      </div>
    </section>
  );
}
