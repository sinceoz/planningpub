'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { ArrowRight } from 'lucide-react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PORTFOLIO_DATA } from '@/lib/portfolio-data';
import type { PortfolioItem } from '@/types';
import SectionLabel from '@/components/ui/SectionLabel';

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80',
  'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&q=80',
  'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1200&q=80',
  'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200&q=80',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80',
  'https://images.unsplash.com/photo-1560439514-4e9645039924?w=1200&q=80',
];

function shuffle<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const CARD_COUNT = 10;
const IMAGE_ROTATE_INTERVAL = 4000;

/** Cross-dissolve image slideshow — two images overlap for smooth blend */
function RotatingImage({ images, alt }: { images: string[]; alt: string }) {
  const [current, setCurrent] = useState(0);
  const [next, setNext] = useState(1);
  const [showNext, setShowNext] = useState(false);

  useEffect(() => {
    if (images.length < 2) return;

    const timer = setInterval(() => {
      setShowNext(true);
      // After dissolve completes, swap current to next and prepare the one after
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % images.length);
        setNext((prev) => (prev + 1) % images.length);
        setShowNext(false);
      }, 1000); // dissolve duration
    }, IMAGE_ROTATE_INTERVAL);

    return () => clearInterval(timer);
  }, [images.length]);

  if (images.length === 0) return null;
  if (images.length === 1) {
    return (
      <img src={images[0]} alt={alt} className="absolute inset-0 w-full h-full object-cover" />
    );
  }

  return (
    <>
      <img
        src={images[current % images.length]}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <img
        src={images[next % images.length]}
        alt=""
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
        style={{ opacity: showNext ? 1 : 0 }}
      />
    </>
  );
}

export default function PortfolioShowcase() {
  const t = useTranslations('portfolioShowcase');
  const locale = useLocale();
  const sectionRef = useRef<HTMLElement>(null);

  const [showcaseItems, setShowcaseItems] = useState<PortfolioItem[]>(() => {
    const featured = PORTFOLIO_DATA.filter((item) => item.featured);
    return shuffle(featured).slice(0, CARD_COUNT);
  });

  useEffect(() => {
    const load = async () => {
      try {
        const q = query(collection(db, 'portfolios'), orderBy('order'));
        const snapshot = await Promise.race([
          getDocs(q),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000)),
        ]);
        if (!snapshot.empty) {
          const allItems = snapshot.docs.map((d) => ({
            ...d.data(),
            id: d.id,
          })) as PortfolioItem[];
          const featured = allItems.filter((item) => item.featured);
          if (featured.length > 0) {
            setShowcaseItems(shuffle(featured).slice(0, CARD_COUNT));
          }
        }
      } catch {
        // Firebase not configured or timeout — keep static data
      }
    };
    load();
  }, []);

  const getImages = useCallback(
    (item: PortfolioItem, i: number) => {
      const allImages = [
        ...(item.thumbnail ? [item.thumbnail] : []),
        ...item.images,
      ].filter(Boolean);
      if (allImages.length > 0) return allImages;
      return [PLACEHOLDER_IMAGES[i % PLACEHOLDER_IMAGES.length]];
    },
    [],
  );

  // 가로 스크롤할 카드 전환 횟수 (view-all 포함)
  const totalSlides = showcaseItems.length + 1;

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  // 세로 스크롤 → 가로 이동 (vw 단위, 화면 너비 기준)
  const maxOffset = -(totalSlides - 1) * 100; // -1000 (vw)
  const xRaw = useTransform(scrollYProgress, [0, 1], [0, maxOffset]);

  // spring 감속: 한 틱당 이동량을 줄이고 부드럽게
  const xSmooth = useSpring(xRaw, { stiffness: 50, damping: 25, mass: 1.5 });

  // 숫자 → vw 단위 (컨테이너 너비가 아닌 뷰포트 기준)
  const x = useTransform(xSmooth, (v) => `${v}vw`);

  // 프로그레스 바
  const progress = useTransform(xSmooth, [0, maxOffset], [0, 1]);

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ height: `${totalSlides * 100}vh` }}
    >
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col">
        {/* Header */}
        <div className="shrink-0 max-w-7xl w-full mx-auto px-6 md:px-12 lg:px-20 pt-20 pb-8">
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

        {/* Horizontal scrolling card strip */}
        <div className="flex-1 min-h-0 flex items-center">
          <motion.div
            style={{ x }}
            className="flex h-[60vh] md:h-[68vh]"
          >
            {showcaseItems.map((item, i) => {
              const title = locale === 'ko' ? item.title : item.titleEn;
              const images = getImages(item, i);

              return (
                <div
                  key={item.id}
                  className="shrink-0 w-screen px-4 md:px-8 lg:px-12 flex items-center justify-center"
                >
                  <div className="group w-full max-w-6xl h-full flex flex-col md:flex-row gap-5 md:gap-10 items-center">
                    {/* Image — 가로 16:9 */}
                    <div className="md:flex-[3] min-w-0 w-full aspect-[16/9] md:aspect-auto md:h-full overflow-hidden rounded-xl relative bg-bg-surface">
                      <RotatingImage images={images} alt={title} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      <span className="absolute top-4 left-4 text-xs font-bold tracking-[0.15em] uppercase text-brand-mint bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full">
                        {item.year}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="md:flex-[1.2] shrink-0 flex flex-col justify-center px-2">
                      <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-text-primary leading-snug">
                        {title}
                      </h3>
                      {item.organizer && (
                        <p className="mt-3 text-sm text-text-dim line-clamp-2">
                          {locale === 'ko' ? item.organizer : item.organizerEn}
                        </p>
                      )}
                      {item.venue && (
                        <p className="mt-1 text-sm text-text-dim">
                          {locale === 'ko' ? item.venue : item.venueEn}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Final "View All" card */}
            <div className="shrink-0 w-screen px-4 md:px-8 lg:px-12 flex items-center justify-center">
              <Link href="/portfolio" className="group block">
                <div className="w-[280px] md:w-[360px] aspect-[16/10] rounded-2xl border border-border-default hover:border-brand-mint/50 transition-colors flex flex-col items-center justify-center gap-6 bg-bg-surface/50 hover:bg-bg-surface">
                  <div className="w-16 h-16 rounded-full border border-brand-mint/40 flex items-center justify-center group-hover:bg-brand-mint/10 transition-colors">
                    <ArrowRight size={24} className="text-brand-mint" />
                  </div>
                  <div className="text-center px-6">
                    <span className="text-lg font-semibold text-text-muted group-hover:text-text-primary transition-colors">
                      {t('viewAll')}
                    </span>
                    <p className="mt-2 text-sm text-text-dim">
                      {t('viewAllSub')}
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Progress bar */}
        <div className="shrink-0 max-w-7xl w-full mx-auto px-6 md:px-12 lg:px-20 pb-8">
          <div className="h-[2px] bg-white/[0.06] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-brand-purple to-brand-mint origin-left"
              style={{ scaleX: progress }}
            />
          </div>
          <div className="mt-4 text-center md:hidden">
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-2 text-sm text-brand-mint"
            >
              {t('viewAll')} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
