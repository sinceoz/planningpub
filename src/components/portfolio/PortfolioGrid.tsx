'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { PortfolioItem } from '@/types';
import SectionLabel from '@/components/ui/SectionLabel';
import PortfolioCard from './PortfolioCard';

type Filter = 'all' | 'event' | 'design';

// Firebase 설정 전 사용할 플레이스홀더 데이터
const PLACEHOLDER_DATA: PortfolioItem[] = [
  { id: '1', category: 'event', title: '국제 MICE 컨퍼런스 2024', titleEn: 'International MICE Conference 2024', description: '글로벌 MICE 리더 500명이 참가한 국제 컨퍼런스', descriptionEn: 'International conference with 500 global MICE leaders', imageUrl: '', year: 2024, order: 1, featured: true },
  { id: '2', category: 'event', title: '기업 인센티브 투어 제주', titleEn: 'Corporate Incentive Tour Jeju', description: '200명 규모 기업 포상관광 프로그램', descriptionEn: 'Corporate incentive program for 200 attendees', imageUrl: '', year: 2024, order: 2 },
  { id: '3', category: 'design', title: '컨벤션 브랜딩 디자인', titleEn: 'Convention Branding Design', description: '대한민국 대표 컨벤션의 통합 브랜딩', descriptionEn: 'Integrated branding for Korea\'s premier convention', imageUrl: '', year: 2023, order: 3 },
  { id: '4', category: 'event', title: '글로벌 테크 서밋', titleEn: 'Global Tech Summit', description: '1,000명 규모 기술 컨퍼런스', descriptionEn: 'Technology conference with 1,000 attendees', imageUrl: '', year: 2023, order: 4 },
  { id: '5', category: 'design', title: '행사 키비주얼 디자인', titleEn: 'Event Key Visual Design', description: '국제행사 키비주얼 및 인쇄물 제작', descriptionEn: 'Key visual and print design for international event', imageUrl: '', year: 2023, order: 5 },
  { id: '6', category: 'event', title: 'K-Culture 엑스포', titleEn: 'K-Culture Expo', description: '한국 문화 전시 및 체험 프로그램', descriptionEn: 'Korean culture exhibition and experience program', imageUrl: '', year: 2022, order: 6 },
];

export default function PortfolioGrid() {
  const t = useTranslations('portfolio');
  const [filter, setFilter] = useState<Filter>('all');
  const [items, setItems] = useState<PortfolioItem[]>(PLACEHOLDER_DATA);

  useEffect(() => {
    // Firebase에서 데이터 로드 시도
    const loadPortfolios = async () => {
      try {
        const q = query(collection(db, 'portfolios'), orderBy('order'));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as PortfolioItem[];
          setItems(data);
        }
      } catch {
        // Firebase 미설정 시 플레이스홀더 유지
      }
    };
    loadPortfolios();
  }, []);

  const filtered = filter === 'all' ? items : items.filter((item) => item.category === filter);

  const FILTERS: { key: Filter; label: string }[] = [
    { key: 'all', label: t('all') },
    { key: 'event', label: t('event') },
    { key: 'design', label: t('design') },
  ];

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

        {/* 필터 */}
        <div className="mt-8 flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-5 py-2 text-sm rounded-full border transition-all cursor-pointer ${
                filter === f.key
                  ? 'bg-brand-purple text-white border-brand-purple'
                  : 'border-border-default text-text-muted hover:border-border-hover'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* 그리드 */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.length > 0 ? (
            filtered.map((item, i) => (
              <PortfolioCard key={item.id} item={item} index={i} />
            ))
          ) : (
            <p className="col-span-full text-center text-text-muted py-20">{t('noItems')}</p>
          )}
        </div>
      </div>
    </section>
  );
}
