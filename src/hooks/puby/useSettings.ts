'use client';

import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { PubyScheduleSettings } from '@/types/puby';

const DEFAULT_SETTINGS: PubyScheduleSettings = {
  startHour: 9,
  endHour: 18,
  updatedBy: '',
  updatedAt: null as any,
};

export function useScheduleSettings() {
  const [settings, setSettings] = useState<PubyScheduleSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, 'puby_settings', 'schedule'),
      (snap) => {
        if (snap.exists()) {
          setSettings(snap.data() as PubyScheduleSettings);
        }
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsub;
  }, []);

  return { settings, loading };
}
