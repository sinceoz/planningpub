'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useTeamSchedule } from '@/hooks/puby/useTeamSchedule';
import { getTodayString, getTomorrowString } from '@/lib/puby/format';
import TeamBoard from '@/components/puby/schedule/TeamBoard';
import TeamBoardMobile from '@/components/puby/schedule/TeamBoardMobile';

export default function TeamBoardPage() {
  const t = useTranslations('puby.schedule');
  const [tab, setTab] = useState<'today' | 'tomorrow'>('today');
  const date = tab === 'today' ? getTodayString() : getTomorrowString();
  const { schedules, loading } = useTeamSchedule(date);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('teamBoard')}</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 p-1 bg-surface-secondary rounded-lg w-fit">
        <button
          onClick={() => setTab('today')}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            tab === 'today' ? 'bg-brand-purple text-white' : 'text-text-muted hover:text-text-primary'
          }`}
        >
          {t('today')}
        </button>
        <button
          onClick={() => setTab('tomorrow')}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            tab === 'tomorrow' ? 'bg-brand-purple text-white' : 'text-text-muted hover:text-text-primary'
          }`}
        >
          {t('tomorrow')}
        </button>
      </div>

      {loading ? (
        <div className="text-center text-text-muted py-12">Loading...</div>
      ) : (
        <>
          {/* PC: Gantt timeline */}
          <div className="hidden md:block">
            <TeamBoard schedules={schedules} />
          </div>
          {/* Mobile: card stack */}
          <div className="md:hidden">
            <TeamBoardMobile schedules={schedules} />
          </div>
        </>
      )}
    </div>
  );
}
