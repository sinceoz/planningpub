'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  collection, query, orderBy, onSnapshot,
  addDoc, updateDoc, deleteDoc, doc, Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { PubyProject } from '@/types/puby';

export function useProjects() {
  const [projects, setProjects] = useState<PubyProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'puby_projects'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setProjects(snap.docs.map((d) => ({ id: d.id, ...d.data() } as PubyProject)));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);

  const createProject = useCallback(async (data: Omit<PubyProject, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = Timestamp.now();
    await addDoc(collection(db, 'puby_projects'), { ...data, createdAt: now, updatedAt: now });
  }, []);

  const updateProject = useCallback(async (id: string, data: Partial<PubyProject>) => {
    await updateDoc(doc(db, 'puby_projects', id), { ...data, updatedAt: Timestamp.now() });
  }, []);

  const deleteProject = useCallback(async (id: string) => {
    await deleteDoc(doc(db, 'puby_projects', id));
  }, []);

  return { projects, loading, createProject, updateProject, deleteProject };
}
