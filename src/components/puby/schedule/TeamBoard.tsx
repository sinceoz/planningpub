// src/components/puby/schedule/TeamBoard.tsx
'use client';

import { useTranslations } from 'next-intl';
import { useScheduleSettings } from '@/hooks/puby/useSettings';
import { generateTimeSlots } from '@/lib/puby/format';
import { TASK_CATEGORIES } from '@/types/puby';
import type { PubyTask, PubyUser } from '@/types/puby';

interface TeamBoardProps {
  schedules: { user: PubyUser; tasks: PubyTask[] }[];
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export default function TeamBoard({ schedules }: TeamBoardProps) {
  const t = useTranslations('puby.schedule');
  const { settings } = useScheduleSettings();
  const timeSlots = generateTimeSlots(settings.startHour, settings.endHour);
  const totalMinutes = (settings.endHour - settings.startHour) * 60;
  const startMinutes = settings.startHour * 60;

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Header row with time slots */}
        <div className="flex border-b border-border-default">
          <div className="w-32 shrink-0 p-2 text-xs text-text-muted font-medium" />
          <div className="flex-1 flex">
            {timeSlots.map((slot) => (
              <div
                key={slot}
                className="text-xs text-text-muted text-center border-l border-border-default py-2"
                style={{ width: `${100 / timeSlots.length}%` }}
              >
                {slot}
              </div>
            ))}
          </div>
        </div>

        {/* Employee rows */}
        {schedules.map(({ user, tasks }) => (
          <div key={user.uid} className="flex border-b border-border-default hover:bg-surface-secondary/30 transition-colors">
            {/* Name column */}
            <div className="w-32 shrink-0 p-2 flex items-center">
              <div>
                <div className="text-sm font-medium text-text-primary truncate">{user.displayName}</div>
                <div className="text-xs text-text-muted">{user.department}</div>
              </div>
            </div>

            {/* Timeline */}
            <div className="flex-1 relative h-14">
              {tasks.map((task) => {
                const taskStart = timeToMinutes(task.startTime);
                const taskEnd = timeToMinutes(task.endTime);
                const left = ((taskStart - startMinutes) / totalMinutes) * 100;
                const width = ((taskEnd - taskStart) / totalMinutes) * 100;
                const category = TASK_CATEGORIES[task.category];

                // Clamp to visible range
                if (taskEnd <= startMinutes || taskStart >= settings.endHour * 60) return null;

                return (
                  <div
                    key={task.id}
                    className={`absolute top-2 h-10 rounded-md px-2 flex items-center text-xs font-medium text-white truncate ${
                      task.completed ? 'opacity-40' : ''
                    }`}
                    style={{
                      left: `${Math.max(0, left)}%`,
                      width: `${Math.min(width, 100 - Math.max(0, left))}%`,
                      backgroundColor: task.color || category?.color || '#6366f1',
                      minWidth: '2rem',
                    }}
                    title={`${task.title} (${task.startTime}–${task.endTime})`}
                  >
                    {task.title}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {schedules.length === 0 && (
          <div className="text-center text-text-muted py-12">{t('noTasks')}</div>
        )}
      </div>
    </div>
  );
}
