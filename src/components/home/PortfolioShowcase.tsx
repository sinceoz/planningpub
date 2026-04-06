'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { ArrowRight } from 'lucide-react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PORTFOLIO_DATA } from '@/lib/portfolio-data';
import type { PortfolioItem } from '@/types';
import SectionLabel from '@/components/ui/SectionLabel';
import PortfolioModal from '@/components/portfolio/PortfolioModal';

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

/** Cross-dissolve image slideshow */
function RotatingImage({ images, alt }: { images: string[]; alt: string }) {
  const [current, setCurrent] = useState(0);
  const [next, setNext] = useState(1);
  const [showNext, setShowNext] = useState(false);

  useEffect(() => {
    if (images.length < 2) return;
    const timer = setInterval(() => {
      setShowNext(true);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % images.length);
        setNext((prev) => (prev + 1) % images.length);
        setShowNext(false);
      }, 1000);
    }, IMAGE_ROTATE_INTERVAL);
    return () => clearInterval(timer);
  }, [images.length]);

  if (images.length === 0) return null;
  if (images.length === 1) {
    return <img src={images[0]} alt={alt} className="absolute inset-0 w-full h-full object-cover" />;
  }

  return (
    <>
      <img src={images[current % images.length]} alt={alt} className="absolute inset-0 w-full h-full object-cover" />
      <img
        src={images[next % images.length]}
        alt=""
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
        style={{ opacity: showNext ? 1 : 0 }}
      />
    </>
  );
}

/** 3D tilt card — mouse position drives perspective rotation */
function TiltCard({
  children,
  onClick,
  className = '',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)');

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateY = ((x - centerX) / centerX) * 8;
    const rotateX = ((centerY - y) / centerY) * 8;
    setTransform(`perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`);
  };

  const handleMouseLeave = () => {
    setTransform('perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)');
  };

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`transition-transform duration-300 ease-out cursor-pointer ${className}`}
      style={{ transform, transformStyle: 'preserve-3d' }}
    >
      {children}
    </div>
  );
}

/** 컨테이너 너비에 맞춰 글씨 크기를 자동 축소하는 타이틀 */
function AutoFitTitle({ title }: { title: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const [fontSize, setFontSize] = useState(28);

  useEffect(() => {
    const container = containerRef.current;
    const text = textRef.current;
    if (!container || !text) return;
    const maxSize = 28;
    const minSize = 15;
    let size = maxSize;
    text.style.fontSize = `${size}px`;
    while (text.scrollWidth > container.clientWidth && size > minSize) {
      size -= 0.5;
      text.style.fontSize = `${size}px`;
    }
    setFontSize(size);
  }, [title]);

  return (
    <div ref={containerRef} className="overflow-hidden">
      <h3 ref={textRef} className="font-bold text-white whitespace-nowrap" style={{ fontSize: `${fontSize}px` }}>
        {title}
      </h3>
    </div>
  );
}

export default function PortfolioShowcase() {
  const t = useTranslations('portfolioShowcase');
  const locale = useLocale();
  const sectionRef = useRef<HTMLElement>(null);
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);

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

  const totalSlides = showcaseItems.length + 1;

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  // 정사각형 카드: 높이 62vh = 너비 62vh → vw 환산은 화면비에 따라 다름
  // vh 단위로 이동해야 정사각형 카드 크기와 정확히 일치
  const cardSize = 64; // vh (카드 62vh + gap 2vh)
  const maxOffset = -(totalSlides - 1) * cardSize;
  const xRaw = useTransform(scrollYProgress, [0, 1], [0, maxOffset]);
  const x = useTransform(xRaw, (v) => `${v}vh`);
  const progress = useTransform(xRaw, [0, maxOffset], [0, 1]);

  return (
    <>
      <section
        ref={sectionRef}
        className="relative"
        style={{ height: `${Math.round(totalSlides * cardSize)}vh` }}
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
              className="flex h-[55vh] md:h-[62vh] pl-6 md:pl-12 lg:pl-20 gap-3 md:gap-4"
            >
              {showcaseItems.map((item, i) => {
                const title = locale === 'ko' ? item.title : item.titleEn;
                const images = getImages(item, i);

                return (
                  <TiltCard
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className="shrink-0 aspect-square h-full"
                  >
                    <div className="w-full h-full overflow-hidden rounded-xl relative bg-bg-surface shadow-lg">
                      <RotatingImage images={images} alt={title} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                      {/* Year badge */}
                      <span className="absolute top-4 left-4 text-xs font-bold tracking-[0.15em] uppercase text-brand-mint bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full">
                        {item.year}
                      </span>
                      {/* Info overlay */}
                      <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-md rounded-lg px-5 py-4">
                        <AutoFitTitle title={title} />
                        <div className="mt-2 flex flex-col gap-0.5 text-xs text-white/70">
                          {(() => {
                            const org = locale === 'ko' ? item.organizer : item.organizerEn;
                            if (!org) return null;
                            const parts = org.split(' / ');
                            if (parts.length >= 2) {
                              return (
                                <>
                                  <p>주최 : {parts[0]}</p>
                                  <p>주관 : {parts.slice(1).join(', ')}</p>
                                </>
                              );
                            }
                            return <p>주최 : {org}</p>;
                          })()}
                          {item.venue && (
                            <p>장소 : {locale === 'ko' ? item.venue : item.venueEn}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </TiltCard>
                );
              })}

              {/* Final "View All" card */}
              <TiltCard className="shrink-0 aspect-square h-full">
                <Link href="/portfolio" className="block w-full h-full">
                  <div className="w-full h-full rounded-xl border border-border-default hover:border-brand-mint/50 transition-colors flex flex-col items-center justify-center gap-8 bg-bg-surface/50 hover:bg-bg-surface shadow-lg">
                    <div className="w-24 h-24 rounded-full border-2 border-brand-mint/40 flex items-center justify-center group-hover:bg-brand-mint/10 transition-colors">
                      <ArrowRight size={40} className="text-brand-mint" />
                    </div>
                    <div className="text-center px-6">
                      <span className="text-2xl md:text-3xl font-bold text-text-muted hover:text-text-primary transition-colors">
                        {t('viewAll')}
                      </span>
                      <p className="mt-3 text-base text-text-dim">
                        {t('viewAllSub')}
                      </p>
                    </div>
                  </div>
                </Link>
              </TiltCard>
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

      {/* Portfolio Modal */}
      <PortfolioModal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </>
  );
}
