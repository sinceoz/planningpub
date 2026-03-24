'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  collection, query, where, orderBy, onSnapshot,
  addDoc, updateDoc, deleteDoc, doc, Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { usePubyAuth } from './useAuth';
import type { PubyTask, TaskCategory } from '@/types/puby';

export function useTasks(date: string) {
  const { pubyUser } = usePubyAuth();
  const [tasks, setTasks] = useState<PubyTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!pubyUser) return;

    const q = query(
      collection(db, 'puby_tasks'),
      where('userId', '==', pubyUser.uid),
      where('date', '==', date),
      orderBy('order', 'asc')
    );

    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as PubyTask));
      setTasks(items);
      setLoading(false);
    }, () => setLoading(false));

    return unsub;
  }, [pubyUser, date]);

  const addTask = useCallback(async (data: {
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    category: TaskCategory;
    color: string;
  }) => {
    if (!pubyUser) return;
    const now = Timestamp.now();
    await addDoc(collection(db, 'puby_tasks'), {
      userId: pubyUser.uid,
      date,
      ...data,
      completed: false,
      order: tasks.length,
      createdAt: now,
      updatedAt: now,
    });
  }, [pubyUser, date, tasks.length]);

  const updateTask = useCallback(async (taskId: string, data: Partial<PubyTask>) => {
    await updateDoc(doc(db, 'puby_tasks', taskId), {
      ...data,
      updatedAt: Timestamp.now(),
    });
  }, []);

  const deleteTask = useCallback(async (taskId: string) => {
    await deleteDoc(doc(db, 'puby_tasks', taskId));
  }, []);

  const toggleComplete = useCallback(async (taskId: string, completed: boolean) => {
    await updateDoc(doc(db, 'puby_tasks', taskId), {
      completed: !completed,
      updatedAt: Timestamp.now(),
    });
  }, []);

  const reorderTasks = useCallback(async (reordered: PubyTask[]) => {
    const batch = reordered.map((task, i) =>
      updateDoc(doc(db, 'puby_tasks', task.id), { order: i })
    );
    await Promise.all(batch);
  }, []);

  return { tasks, loading, addTask, updateTask, deleteTask, toggleComplete, reorderTasks };
}
