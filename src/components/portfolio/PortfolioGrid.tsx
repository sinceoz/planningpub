'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { PortfolioItem } from '@/types';
import { PORTFOLIO_DATA } from '@/lib/portfolio-data';
import SectionLabel from '@/components/ui/SectionLabel';
import PortfolioCard from './PortfolioCard';
import PortfolioModal from './PortfolioModal';

/** Extract a sortable numeric date (YYYYMMDD) from the date string */
function parseDateSort(dateStr: string, year: number): number {
  if (!dateStr) return year * 10000;
  const match = dateStr.match(/(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})/);
  if (match) {
    return parseInt(match[1]) * 10000 + parseInt(match[2]) * 100 + parseInt(match[3]);
  }
  return year * 10000;
}

export default function PortfolioGrid() {
  const t = useTranslations('portfolio');
  const [yearFilter, setYearFilter] = useState<number | 'all'>('all');
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [items, setItems] = useState<PortfolioItem[]>(PORTFOLIO_DATA);

  // Try loading from Firestore, fall back to static data
  useEffect(() => {
    const load = async () => {
      try {
        const q = query(collection(db, 'portfolios'), orderBy('order'));
        const snapshot = await Promise.race([
          getDocs(q),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000)),
        ]);
        if (!snapshot.empty) {
          const data = snapshot.docs.map((d) => ({
            ...d.data(),
            id: d.id,
          })) as PortfolioItem[];
          setItems(data);
        }
      } catch {
        // Firebase not configured or timeout — keep static data
      }
    };
    load();
  }, []);

  // Sort items: most recent first
  const sortedItems = useMemo(
    () =>
      [...items].sort(
        (a, b) => parseDateSort(b.date || '', b.year) - parseDateSort(a.date || '', a.year),
      ),
    [items],
  );

  // Extract unique years sorted descending
  const years = useMemo(
    () => [...new Set(items.map((item) => item.year))].sort((a, b) => b - a),
    [items],
  );

  const filtered =
    yearFilter === 'all'
      ? sortedItems
      : sortedItems.filter((item) => item.year === yearFilter);

  return (
    <section className="pt-32 pb-24 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionLabel>{t('label')}</SectionLabel>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold text-text-primary mt-4"
        >
          {t('title')}
        </motion.h1>

        {/* Year Filters */}
        <div className="mt-8 flex gap-2 flex-wrap">
          <button
            onClick={() => setYearFilter('all')}
            className={`px-5 py-2 text-sm rounded-full border transition-all cursor-pointer ${
              yearFilter === 'all'
                ? 'bg-brand-purple text-white border-brand-purple'
                : 'border-border-default text-text-muted hover:border-border-hover'
            }`}
          >
            {t('all')}
          </button>
          {years.map((year) => (
            <button
              key={year}
              onClick={() => setYearFilter(year)}
              className={`px-5 py-2 text-sm rounded-full border transition-all cursor-pointer ${
                yearFilter === year
                  ? 'bg-brand-purple text-white border-brand-purple'
                  : 'border-border-default text-text-muted hover:border-border-hover'
              }`}
            >
              {year}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.length > 0 ? (
            filtered.map((item, i) => (
              <PortfolioCard
                key={item.id}
                item={item}
                index={i}
                onClick={() => setSelectedItem(item)}
              />
            ))
          ) : (
            <p className="col-span-full text-center text-text-muted py-20">
              {t('noItems')}
            </p>
          )}
        </div>
      </div>

      {/* Modal */}
      <PortfolioModal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </section>
  );
}
