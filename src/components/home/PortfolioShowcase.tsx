'use client';

import { useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { ArrowRight } from 'lucide-react';
import { PORTFOLIO_DATA } from '@/lib/portfolio-data';
import SectionLabel from '@/components/ui/SectionLabel';

// Placeholder event images for cards without thumbnails
const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80',
  'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&q=80',
  'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1200&q=80',
  'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200&q=80',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80',
  'https://images.unsplash.com/photo-1560439514-4e9645039924?w=1200&q=80',
];

const SHOWCASE_ITEMS = PORTFOLIO_DATA.filter((item) => item.featured)
  .sort((a, b) => b.year - a.year)
  .slice(0, 5);

export default function PortfolioShowcase() {
  const t = useTranslations('portfolioShowcase');
  const locale = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  // Translate the card strip from right to left as user scrolls
  const x = useTransform(scrollYProgress, [0, 1], ['10%', '-30%']);

  return (
    <section
      ref={containerRef}
      className="py-24 overflow-hidden relative"
    >
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[500px] rounded-full bg-brand-purple/5 blur-[200px] pointer-events-none" />

      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 mb-12">
        <div className="flex items-end justify-between">
          <div>
            <SectionLabel>{t('label')}</SectionLabel>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-text-primary mt-4"
            >
              {t('title')}
            </motion.h2>
          </div>
          <Link
            href="/portfolio"
            className="hidden md:flex items-center gap-2 text-sm text-brand-mint hover:gap-3 transition-all"
          >
            {t('viewAll')} <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Scrolling card strip */}
      <div className="overflow-visible pl-6 md:pl-20 lg:pl-32">
        <motion.div
          style={{ x }}
          className="flex gap-5 md:gap-6"
        >
          {SHOWCASE_ITEMS.map((item, i) => {
            const title = locale === 'ko' ? item.title : item.titleEn;
            const imgSrc = item.thumbnail || item.images[0] || PLACEHOLDER_IMAGES[i % PLACEHOLDER_IMAGES.length];

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.7, delay: i * 0.08, ease: [0.23, 1, 0.32, 1] }}
                className="shrink-0 w-[80vw] md:w-[55vw] lg:w-[45vw] xl:w-[38vw] group"
              >
                {/* Image */}
                <div className="aspect-[16/10] overflow-hidden rounded-xl relative bg-bg-surface">
                  <img
                    src={imgSrc}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  {/* overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  {/* Year badge */}
                  <span className="absolute top-4 left-4 text-xs font-bold tracking-[0.15em] uppercase text-brand-mint bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full">
                    {item.year}
                  </span>
                </div>

                {/* Info */}
                <div className="mt-4 px-1">
                  <h3 className="text-lg md:text-xl font-semibold text-text-primary leading-snug line-clamp-2 group-hover:text-brand-mint transition-colors">
                    {title}
                  </h3>
                  {item.organizer && (
                    <p className="mt-1.5 text-sm text-text-dim line-clamp-1">
                      {item.organizer}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}

          {/* Final "View All" card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: SHOWCASE_ITEMS.length * 0.08 }}
            className="shrink-0 w-[60vw] md:w-[35vw] lg:w-[28vw] xl:w-[22vw]"
          >
            <Link href="/portfolio" className="group block h-full">
              <div className="aspect-[16/10] rounded-xl border border-border-default hover:border-brand-mint/50 transition-colors flex flex-col items-center justify-center gap-4 bg-bg-surface/50 hover:bg-bg-surface">
                <div className="w-12 h-12 rounded-full border border-brand-mint/40 flex items-center justify-center group-hover:bg-brand-mint/10 transition-colors">
                  <ArrowRight size={20} className="text-brand-mint" />
                </div>
                <span className="text-sm font-semibold text-text-muted group-hover:text-text-primary transition-colors text-center px-4">
                  {t('viewAll')}
                </span>
              </div>
              <p className="mt-4 px-1 text-lg font-semibold text-text-dim">
                {t('viewAllSub')}
              </p>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Mobile view all link */}
      <div className="mt-8 text-center md:hidden">
        <Link
          href="/portfolio"
          className="inline-flex items-center gap-2 text-sm text-brand-mint"
        >
          {t('viewAll')} <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}
