'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { usePubyAuth } from '@/hooks/puby/useAuth';
import { useScheduleSettings } from '@/hooks/puby/useSettings';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function SettingsPage() {
  const t = useTranslations('puby.settings');
  const { pubyUser } = usePubyAuth();
  const { settings, loading } = useScheduleSettings();

  const [startHour, setStartHour] = useState<number | null>(null);
  const [endHour, setEndHour] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Use local state if set, otherwise fall back to loaded settings
  const currentStart = startHour ?? settings.startHour;
  const currentEnd = endHour ?? settings.endHour;

  if (pubyUser?.role !== 'admin') return null;

  async function handleSave() {
    if (!pubyUser) return;
    setSaving(true);
    setSaved(false);
    try {
      await setDoc(doc(db, 'puby_settings', 'schedule'), {
        startHour: currentStart,
        endHour: currentEnd,
        updatedBy: pubyUser.uid,
        updatedAt: Timestamp.now(),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  const HOURS = Array.from({ length: 24 }, (_, i) => i);

  const selectClass =
    'px-3 py-2 rounded-lg bg-surface-secondary border border-border-default focus:border-brand-purple focus:outline-none text-text-primary text-sm';

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('title')}</h1>

      <div className="bg-surface-secondary rounded-xl p-6 max-w-md">
        <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-4">
          {t('scheduleTime')}
        </h2>

        {loading ? (
          <div className="text-text-muted text-sm">Loading...</div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm text-text-muted mb-1">{t('startHour')}</label>
                <select
                  value={currentStart}
                  onChange={(e) => setStartHour(Number(e.target.value))}
                  className={`${selectClass} w-full`}
                >
                  {HOURS.map((h) => (
                    <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm text-text-muted mb-1">{t('endHour')}</label>
                <select
                  value={currentEnd}
                  onChange={(e) => setEndHour(Number(e.target.value))}
                  className={`${selectClass} w-full`}
                >
                  {HOURS.map((h) => (
                    <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-brand-purple to-brand-mint text-white text-sm font-semibold disabled:opacity-50"
            >
              {saving ? t('saving') : saved ? t('saved') : t('saveSettings')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
