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
  LogOut,
  Upload,
  ChevronDown,
  ChevronUp,
  Search,
  Star,
} from 'lucide-react';
import PortfolioForm from './PortfolioForm';

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'pub=8528';
const COLLECTION = 'portfolios';

export default function AdminPortfolio() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [pwError, setPwError] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState<PortfolioItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PortfolioItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'year' | 'order' | 'title'>('year');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [syncing, setSyncing] = useState(false);

  // Check session or auto-login
  useEffect(() => {
    if (localStorage.getItem('admin_authed') === 'true' || sessionStorage.getItem('admin_authed') === 'true') {
      setAuthed(true);
    }
  }, []);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setAuthed(true);
      sessionStorage.setItem('admin_authed', 'true');
      if (rememberMe) {
        localStorage.setItem('admin_authed', 'true');
      }
      setPwError(false);
    } else {
      setPwError(true);
    }
  };

  const handleLogout = () => {
    setAuthed(false);
    sessionStorage.removeItem('admin_authed');
    localStorage.removeItem('admin_authed');
  };

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, COLLECTION), orderBy('order'));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const data = snapshot.docs.map((d) => ({
          ...d.data(),
          id: d.id,
        })) as PortfolioItem[];
        setItems(data);
      } else {
        // Firestore empty — use static data
        setItems(PORTFOLIO_DATA);
      }
    } catch {
      // Firebase not configured — use static data
      setItems(PORTFOLIO_DATA);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authed) loadData();
  }, [authed, loadData]);

  // Sync static data to Firestore
  const syncToFirestore = async () => {
    if (!confirm('정적 데이터를 Firestore에 업로드합니다. 기존 데이터가 있으면 중복될 수 있습니다. 계속하시겠습니까?'))
      return;
    setSyncing(true);
    try {
      for (const item of PORTFOLIO_DATA) {
        const { id, ...data } = item;
        await addDoc(collection(db, COLLECTION), { ...data, originalId: id });
      }
      await loadData();
      alert('Firestore 동기화 완료!');
    } catch (err) {
      alert('동기화 실패: Firebase 설정을 확인하세요.\n' + String(err));
    }
    setSyncing(false);
  };

  // CRUD
  const handleSave = async (data: Omit<PortfolioItem, 'id'> & { id?: string }) => {
    try {
      if (data.id) {
        // Update
        const { id, ...rest } = data;
        await updateDoc(doc(db, COLLECTION, id), rest);
      } else {
        // Create
        await addDoc(collection(db, COLLECTION), data);
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

  // Sort & Filter
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
      if (sortField === 'year') return (a.year - b.year) * dir;
      if (sortField === 'order') return (a.order - b.order) * dir;
      return a.title.localeCompare(b.title) * dir;
    });

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const SortIcon = ({ field }: { field: typeof sortField }) =>
    sortField === field ? (
      sortDir === 'asc' ? (
        <ChevronUp size={14} />
      ) : (
        <ChevronDown size={14} />
      )
    ) : null;

  // ─── Login Screen ───
  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-dark px-6">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-text-primary mb-2">Admin</h1>
          <p className="text-sm text-text-muted mb-6">관리자 비밀번호를 입력하세요.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
          >
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPwError(false);
              }}
              placeholder="비밀번호"
              className="w-full px-4 py-3 rounded-lg bg-bg-card border border-border-default text-text-primary placeholder:text-text-dim focus:outline-none focus:border-brand-purple"
              autoFocus
            />
            {pwError && (
              <p className="text-error text-sm mt-2">비밀번호가 일치하지 않습니다.</p>
            )}
            <label className="flex items-center gap-2 mt-3 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-border-default accent-brand-purple"
              />
              <span className="text-sm text-text-muted">자동 로그인</span>
            </label>
            <button
              type="submit"
              className="w-full mt-4 px-4 py-3 rounded-lg bg-brand-purple text-white font-semibold hover:bg-brand-purple-light transition-colors cursor-pointer"
            >
              로그인
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ─── Admin Dashboard ───
  return (
    <div className="min-h-screen bg-bg-dark pt-24 pb-16 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
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
              onClick={syncToFirestore}
              disabled={syncing}
              className="hidden md:inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-border-default text-text-muted hover:border-border-hover hover:text-text-primary transition-all cursor-pointer disabled:opacity-50"
            >
              <Upload size={15} />
              {syncing ? '동기화 중...' : 'Firestore 동기화'}
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
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-border-default text-text-dim hover:text-text-primary transition-all cursor-pointer"
              title="로그아웃"
            >
              <LogOut size={15} />
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
                  <th
                    className="text-left px-4 py-3 font-medium cursor-pointer hover:text-text-primary select-none"
                    onClick={() => toggleSort('order')}
                  >
                    <span className="inline-flex items-center gap-1">
                      # <SortIcon field="order" />
                    </span>
                  </th>
                  <th
                    className="text-left px-4 py-3 font-medium cursor-pointer hover:text-text-primary select-none"
                    onClick={() => toggleSort('year')}
                  >
                    <span className="inline-flex items-center gap-1">
                      연도 <SortIcon field="year" />
                    </span>
                  </th>
                  <th
                    className="text-left px-4 py-3 font-medium cursor-pointer hover:text-text-primary select-none min-w-[300px]"
                    onClick={() => toggleSort('title')}
                  >
                    <span className="inline-flex items-center gap-1">
                      행사명 <SortIcon field="title" />
                    </span>
                  </th>
                  <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">날짜</th>
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
                    <td className="px-4 py-3 text-text-dim">{item.order}</td>
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
                    <td colSpan={6} className="text-center py-12 text-text-muted">
                      {searchQuery ? '검색 결과가 없습니다.' : '포트폴리오 항목이 없습니다.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
    </div>
  );
}
