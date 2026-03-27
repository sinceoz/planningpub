'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  collection, query, where, orderBy, limit, onSnapshot,
  updateDoc, doc, writeBatch, Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { usePubyAuth } from './useAuth';
import type { PubyNotification } from '@/types/puby';

export function useNotifications(maxItems = 20) {
  const { pubyUser } = usePubyAuth();
  const [notifications, setNotifications] = useState<PubyNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (!pubyUser) return;

    const q = query(
      collection(db, 'puby_notifications'),
      where('userId', '==', pubyUser.uid),
      orderBy('createdAt', 'desc'),
      limit(maxItems),
    );

    const unsub = onSnapshot(q, (snap) => {
      setNotifications(
        snap.docs.map((d) => ({ id: d.id, ...d.data() } as PubyNotification)),
      );
      setLoading(false);
    }, () => setLoading(false));

    return unsub;
  }, [pubyUser, maxItems]);

  const markAsRead = useCallback(async (id: string) => {
    await updateDoc(doc(db, 'puby_notifications', id), { read: true });
  }, []);

  const markAllAsRead = useCallback(async () => {
    const unread = notifications.filter((n) => !n.read);
    if (unread.length === 0) return;

    const batch = writeBatch(db);
    for (const n of unread) {
      batch.update(doc(db, 'puby_notifications', n.id), { read: true });
    }
    await batch.commit();
  }, [notifications]);

  return { notifications, loading, unreadCount, markAsRead, markAllAsRead };
}
