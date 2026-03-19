'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  query,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { PortfolioItem } from '@/types';
import { PORTFOLIO_DATA } from '@/lib/portfolio-data';
import {
  Plus,
  Pencil,
  Trash2,
  Upload,
  ChevronDown,
  ChevronUp,
  Search,
  Star,
} from 'lucide-react';
import PortfolioForm, { translateFields } from './PortfolioForm';

const COLLECTION = 'portfolios';

export default function AdminPortfolio() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState<PortfolioItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PortfolioItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [syncing, setSyncing] = useState(false);

  // Auto-translate empty English fields for a single item
  const autoTranslateItem = async (
    item: Omit<PortfolioItem, 'id'>,
  ): Promise<Omit<PortfolioItem, 'id'>> => {
    const pairs: [string, string][] = [
      ['title', 'titleEn'],
      ['description', 'descriptionEn'],
      ['venue', 'venueEn'],
      ['organizer', 'organizerEn'],
      ['concept', 'conceptEn'],
      ['planningPoint', 'planningPointEn'],
    ];
    const textsToTranslate: Record<string, string> = {};
    const rec = item as Record<string, unknown>;
    for (const [koField, enField] of pairs) {
      const koVal = (rec[koField] as string) || '';
      const enVal = (rec[enField] as string) || '';
      if (koVal.trim() && !enVal.trim()) {
        textsToTranslate[enField] = koVal;
      }
    }
    if (Object.keys(textsToTranslate).length === 0) return item;
    try {
      const translations = await translateFields(textsToTranslate);
      return { ...item, ...translations } as Omit<PortfolioItem, 'id'>;
    } catch {
      return item; // translation failed — keep as is
    }
  };

  // Sync static data to Firestore (returns synced items)
  const syncToFirestore = useCallback(async (): Promise<PortfolioItem[]> => {
    setSyncing(true);
    try {
      for (const item of PORTFOLIO_DATA) {
        const { id, ...data } = item;
        const translated = await autoTranslateItem(data);
        await addDoc(collection(db, COLLECTION), { ...translated, originalId: id });
      }
      // Re-read from Firestore to get generated IDs
      const q = query(collection(db, COLLECTION), orderBy('order'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((d) => ({
        ...d.data(),
        id: d.id,
      })) as PortfolioItem[];
      setSyncing(false);
      return data;
    } catch (err) {
      setSyncing(false);
      throw err;
    }
  }, []);

  // Load data — auto-sync if Firestore is reachable but empty
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, COLLECTION), orderBy('order'));
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
      } else {
        // Firestore reachable but empty — auto-sync static data
        try {
          const synced = await syncToFirestore();
          setItems(synced);
        } catch {
          setItems(PORTFOLIO_DATA);
        }
      }
    } catch {
      // Firebase unreachable — use static data
      setItems(PORTFOLIO_DATA);
    }
    setLoading(false);
  }, [syncToFirestore]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // CRUD — auto-translate empty English fields before saving
  const handleSave = async (data: Omit<PortfolioItem, 'id'> & { id?: string }) => {
    try {
      const { id, ...rest } = data;
      const translated = await autoTranslateItem(rest);
      if (id) {
        await updateDoc(doc(db, COLLECTION, id), translated);
      } else {
        await addDoc(collection(db, COLLECTION), translated);
      }
      setShowForm(false);
      setEditItem(null);
      await loadData();
    } catch (err) {
      alert('저장 실패: Firebase 설정을 확인하세요.\n' + String(err));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteDoc(doc(db, COLLECTION, deleteTarget.id));
      setDeleteTarget(null);
      await loadData();
    } catch (err) {
      alert('삭제 실패: Firebase 설정을 확인하세요.\n' + String(err));
    }
  };

  /** Parse "2025. 12. 4." or "2025. 5. 23. - 25." into a sortable timestamp */
  const parseDate = (dateStr: string): number => {
    if (!dateStr) return 0;
    const m = dateStr.match(/(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})/);
    if (!m) return 0;
    return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).getTime();
  };

  // Sort & Filter: 날짜순 → 대표 우선 → 가나다순
  const sortedFiltered = items
    .filter((item) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.titleEn.toLowerCase().includes(q) ||
        String(item.year).includes(q) ||
        (item.venue || '').toLowerCase().includes(q) ||
        (item.organizer || '').toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      // 1. 날짜순
      const dateA = parseDate(a.date || '');
      const dateB = parseDate(b.date || '');
      if (dateA !== dateB) return (dateA - dateB) * dir;
      // 2. 대표(featured) 우선
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      // 3. 가나다순
      return a.title.localeCompare(b.title, 'ko');
    });

  // ─── Admin Dashboard ───
  return (
    <>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">포트폴리오 관리</h1>
            <p className="text-sm text-text-muted mt-1">
              총 {items.length}개 항목
              {items === PORTFOLIO_DATA && (
                <span className="text-amber-400 ml-2">(정적 데이터 — Firestore 미연결)</span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={async () => {
                if (!confirm('정적 데이터를 Firestore에 다시 업로드합니다. 기존 데이터와 중복될 수 있습니다. 계속하시겠습니까?')) return;
                try {
                  const synced = await syncToFirestore();
                  setItems(synced);
                } catch (err) {
                  alert('동기화 실패: Firebase 설정을 확인하세요.\n' + String(err));
                }
              }}
              disabled={syncing}
              className="hidden md:inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-border-default text-text-muted hover:border-border-hover hover:text-text-primary transition-all cursor-pointer disabled:opacity-50"
            >
              <Upload size={15} />
              {syncing ? '동기화 중...' : '정적 데이터 재동기화'}
            </button>
            <button
              onClick={() => {
                setEditItem(null);
                setShowForm(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-brand-purple text-white hover:bg-brand-purple-light transition-colors cursor-pointer"
            >
              <Plus size={15} />
              추가
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="행사명, 연도, 장소, 주최기관 검색..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-bg-card border border-border-default text-text-primary text-sm placeholder:text-text-dim focus:outline-none focus:border-brand-purple"
          />
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center text-text-muted py-20">데이터 로딩 중...</div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border-default">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-bg-card text-text-dim border-b border-border-default">
                  <th className="text-left px-4 py-3 font-medium">연도</th>
                  <th className="text-left px-4 py-3 font-medium min-w-[300px]">행사명</th>
                  <th
                    className="text-left px-4 py-3 font-medium hidden lg:table-cell cursor-pointer hover:text-text-primary select-none"
                    onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
                  >
                    <span className="inline-flex items-center gap-1">
                      날짜 {sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </span>
                  </th>
                  <th className="text-left px-4 py-3 font-medium hidden xl:table-cell">장소</th>
                  <th className="text-right px-4 py-3 font-medium">관리</th>
                </tr>
              </thead>
              <tbody>
                {sortedFiltered.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-border-default hover:bg-bg-surface-hover transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="text-text-muted">{item.year}</span>
                        {item.featured && <Star size={12} className="text-amber-400 fill-amber-400" />}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-primary font-medium">{item.title}</td>
                    <td className="px-4 py-3 text-text-muted hidden lg:table-cell">{item.date || '-'}</td>
                    <td className="px-4 py-3 text-text-muted hidden xl:table-cell max-w-[200px] truncate">
                      {item.venue || '-'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditItem(item);
                            setShowForm(true);
                          }}
                          className="p-2 rounded-md hover:bg-bg-card text-text-dim hover:text-brand-mint transition-colors cursor-pointer"
                          title="수정"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(item)}
                          className="p-2 rounded-md hover:bg-bg-card text-text-dim hover:text-error transition-colors cursor-pointer"
                          title="삭제"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {sortedFiltered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-text-muted">
                      {searchQuery ? '검색 결과가 없습니다.' : '포트폴리오 항목이 없습니다.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

      {/* ─── Add/Edit Form Modal ─── */}
      {showForm && (
        <PortfolioForm
          item={editItem}
          nextOrder={items.length + 1}
          onSave={handleSave}
          onClose={() => {
            setShowForm(false);
            setEditItem(null);
          }}
        />
      )}

      {/* ─── Delete Confirmation ─── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setDeleteTarget(null)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="relative z-10 w-full max-w-md rounded-xl bg-bg-card border border-border-default p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-text-primary mb-2">삭제 확인</h3>
            <p className="text-sm text-text-muted mb-1">다음 항목을 삭제하시겠습니까?</p>
            <p className="text-sm text-text-primary font-medium mb-6">{deleteTarget.title}</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-sm rounded-lg border border-border-default text-text-muted hover:text-text-primary transition-colors cursor-pointer"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm rounded-lg bg-error text-white font-semibold hover:bg-red-400 transition-colors cursor-pointer"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
