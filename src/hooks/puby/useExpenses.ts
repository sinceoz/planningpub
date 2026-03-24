'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  collection, query, where, orderBy, onSnapshot,
  addDoc, updateDoc, deleteDoc, doc, Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { usePubyAuth } from './useAuth';
import type { PubyExpense, ExpenseType, ExpenseStatus } from '@/types/puby';

interface UseExpensesOptions {
  filterByUser?: boolean;
  projectId?: string;
  status?: ExpenseStatus;
  type?: ExpenseType;
}

export function useExpenses(options: UseExpensesOptions = {}) {
  const { pubyUser } = usePubyAuth();
  const [expenses, setExpenses] = useState<PubyExpense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!pubyUser) return;

    let constraints: any[] = [];

    if (options.filterByUser) {
      constraints.push(where('createdBy', '==', pubyUser.uid));
    }
    if (options.projectId) {
      constraints.push(where('projectId', '==', options.projectId));
    }
    if (options.status) {
      constraints.push(where('status', '==', options.status));
    }
    if (options.type) {
      constraints.push(where('type', '==', options.type));
    }

    const q = query(
      collection(db, 'puby_expenses'),
      ...constraints,
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, (snap) => {
      setExpenses(snap.docs.map((d) => ({ id: d.id, ...d.data() } as PubyExpense)));
      setLoading(false);
    }, () => setLoading(false));

    return unsub;
  }, [pubyUser, options.filterByUser, options.projectId, options.status, options.type]);

  const createExpense = useCallback(async (data: Omit<PubyExpense, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, 'puby_expenses'), {
      ...data,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  }, []);

  const updateExpense = useCallback(async (id: string, data: Partial<PubyExpense>) => {
    await updateDoc(doc(db, 'puby_expenses', id), {
      ...data,
      updatedAt: Timestamp.now(),
    });
  }, []);

  const deleteExpense = useCallback(async (id: string) => {
    await deleteDoc(doc(db, 'puby_expenses', id));
  }, []);

  return { expenses, loading, createExpense, updateExpense, deleteExpense };
}
