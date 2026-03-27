'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePubyAuth } from '@/hooks/puby/useAuth';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Plus, Trash2 } from 'lucide-react';
import type { PubyCard } from '@/types/puby';

export default function CardsPage() {
  const { pubyUser } = usePubyAuth();
  const [cards, setCards] = useState<PubyCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [label, setLabel] = useState('');
  const [lastFour, setLastFour] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'puby_cards'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setCards(snap.docs.map((d) => ({ id: d.id, ...d.data() } as PubyCard)));
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleAdd = useCallback(async () => {
    if (!label || !lastFour) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'puby_cards'), { label, lastFour, createdAt: Timestamp.now() });
      setLabel('');
      setLastFour('');
    } finally {
      setSubmitting(false);
    }
  }, [label, lastFour]);

  async function handleDelete(id: string) {
    await deleteDoc(doc(db, 'puby_cards', id));
  }

  if (pubyUser?.role !== 'admin') return null;

  const inputClass = "px-3 py-2 rounded-lg bg-surface-secondary border border-border-default focus:border-brand-purple focus:outline-none text-text-primary text-sm";

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">카드 관리</h1>

      {/* 카드 추가 */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="카드명 (예: 법인카드 1)"
          className={`${inputClass} flex-1`}
        />
        <input
          type="text"
          value={lastFour}
          onChange={(e) => setLastFour(e.target.value.replace(/\D/g, '').slice(0, 4))}
          placeholder="끝 4자리"
          maxLength={4}
          className={`${inputClass} w-28`}
        />
        <button
          onClick={handleAdd}
          disabled={submitting || !label || lastFour.length !== 4}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-brand-purple to-brand-mint text-white text-sm font-semibold disabled:opacity-50"
        >
          <Plus className="w-4 h-4" /> 추가
        </button>
      </div>

      {/* 카드 목록 */}
      {loading ? (
        <div className="text-center text-text-muted py-12">Loading...</div>
      ) : cards.length === 0 ? (
        <div className="text-center text-text-muted py-12">등록된 카드가 없습니다.</div>
      ) : (
        <div className="space-y-2">
          {cards.map((card) => (
            <div key={card.id} className="flex items-center justify-between p-4 bg-surface-secondary rounded-lg">
              <div>
                <span className="text-sm font-medium text-text-primary">{card.label}</span>
                <span className="text-sm text-text-muted ml-2">****{card.lastFour}</span>
              </div>
              <button onClick={() => handleDelete(card.id)} className="p-2 text-text-muted hover:text-red-400 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
