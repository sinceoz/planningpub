'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';
import type { PortfolioItem } from '@/types';

interface PortfolioModalProps {
  item: PortfolioItem | null;
  onClose: () => void;
}

function parseOrganizer(org: string) {
  const parts = org.split(' / ');
  return { host: parts[0] || '', manager: parts[1] || '' };
}

export default function PortfolioModal({ item, onClose }: PortfolioModalProps) {
  const t = useTranslations('portfolio');
  const locale = useLocale();
  const [imageIndex, setImageIndex] = useState(0);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (!item) return;
      if (e.key === 'ArrowLeft' && item.images.length > 0) {
        setImageIndex((prev) => (prev - 1 + item.images.length) % item.images.length);
      }
      if (e.key === 'ArrowRight' && item.images.length > 0) {
        setImageIndex((prev) => (prev + 1) % item.images.length);
      }
    },
    [item, onClose],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = item ? 'hidden' : '';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [item, handleKeyDown]);

  useEffect(() => {
    setImageIndex(0);
  }, [item?.id]);

  if (!item) return null;

  const title = locale === 'ko' ? item.title : item.titleEn;
  const venue = locale === 'ko' ? (item.venue || '') : (item.venueEn || '');
  const orgStr = locale === 'ko' ? (item.organizer || '') : (item.organizerEn || '');
  const { host, manager } = parseOrganizer(orgStr);
  const concept = item.concept || '';
  const planningPoint = item.planningPoint || '';
  const hasImages = item.images.length > 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.97 }}
          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-bg-card border border-border-default shadow-2xl"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors cursor-pointer"
            aria-label={t('close')}
          >
            <X size={18} />
          </button>

          {/* Image Carousel */}
          <div className="relative aspect-[16/9] bg-gradient-to-br from-brand-purple/20 to-brand-mint/20 overflow-hidden">
            {hasImages ? (
              <>
                <img
                  src={item.images[imageIndex]}
                  alt={`${title} - ${imageIndex + 1}`}
                  className="w-full h-full object-cover"
                />
                {item.images.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setImageIndex((prev) => (prev - 1 + item.images.length) % item.images.length)
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors cursor-pointer"
                      aria-label={t('prev')}
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={() =>
                        setImageIndex((prev) => (prev + 1) % item.images.length)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors cursor-pointer"
                      aria-label={t('next')}
                    >
                      <ChevronRight size={20} />
                    </button>
                    {/* Dots */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {item.images.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setImageIndex(i)}
                          className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                            i === imageIndex
                              ? 'bg-white w-5'
                              : 'bg-white/40 hover:bg-white/60'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                <ImageIcon size={48} className="text-text-dim/40" />
                <span className="text-sm text-text-dim">{t('noImages')}</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6 md:p-8">
            {/* Title */}
            <h2 className="text-xl md:text-2xl font-bold text-text-primary">
              {title}
            </h2>

            {/* Meta info */}
            <div className="mt-5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2.5 text-sm">
              {item.date && (
                <>
                  <span className="text-text-dim font-medium">{t('date')}</span>
                  <span className="text-text-muted">{item.date}</span>
                </>
              )}
              {venue && (
                <>
                  <span className="text-text-dim font-medium">{t('venue')}</span>
                  <span className="text-text-muted">{venue}</span>
                </>
              )}
              {host && (
                <>
                  <span className="text-text-dim font-medium">{t('host')}</span>
                  <span className="text-text-muted">{host}</span>
                </>
              )}
              {manager && (
                <>
                  <span className="text-text-dim font-medium">{t('manager')}</span>
                  <span className="text-text-muted">{manager}</span>
                </>
              )}
            </div>

            {/* Concept */}
            {concept && (
              <div className="mt-7">
                <h3 className="text-sm font-semibold text-brand-mint tracking-wider uppercase mb-2">
                  {t('concept')}
                </h3>
                <p className="text-sm text-text-muted leading-relaxed">
                  {concept}
                </p>
              </div>
            )}

            {/* Planning Point */}
            {planningPoint && (
              <div className="mt-5">
                <h3 className="text-sm font-semibold text-brand-purple-light tracking-wider uppercase mb-2">
                  {t('planningPoint')}
                </h3>
                <p className="text-sm text-text-muted leading-relaxed">
                  {planningPoint}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
