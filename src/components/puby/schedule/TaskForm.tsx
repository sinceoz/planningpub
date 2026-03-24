// src/components/puby/schedule/TaskForm.tsx
'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import { TASK_CATEGORIES, type TaskCategory, type PubyTask } from '@/types/puby';

interface TaskFormProps {
  onSubmit: (data: {
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    category: TaskCategory;
    color: string;
  }) => Promise<void>;
  onClose: () => void;
  editingTask?: PubyTask | null;
  onUpdate?: (taskId: string, data: Partial<PubyTask>) => Promise<void>;
}

export default function TaskForm({ onSubmit, onClose, editingTask, onUpdate }: TaskFormProps) {
  const t = useTranslations('puby.schedule');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [category, setCategory] = useState<TaskCategory>('deepwork');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || '');
      setStartTime(editingTask.startTime);
      setEndTime(editingTask.endTime);
      setCategory(editingTask.category);
    }
  }, [editingTask]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const color = TASK_CATEGORIES[category].color;
      if (editingTask && onUpdate) {
        await onUpdate(editingTask.id, { title, description: description || undefined, startTime, endTime, category, color });
      } else {
        await onSubmit({ title, description: description || undefined, startTime, endTime, category, color });
      }
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-surface-primary border border-border-default rounded-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">{editingTask ? t('editTask') : t('addTask')}</h2>
          <button onClick={onClose} className="p-1 text-text-muted hover:text-text-primary">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-text-muted mb-1">{t('title')}</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg bg-surface-secondary border border-border-default focus:border-brand-purple focus:outline-none text-text-primary"
            />
          </div>

          <div>
            <label className="block text-sm text-text-muted mb-1">{t('description')}</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-surface-secondary border border-border-default focus:border-brand-purple focus:outline-none text-text-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-text-muted mb-1">{t('startTime')}</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg bg-surface-secondary border border-border-default focus:border-brand-purple focus:outline-none text-text-primary"
              />
            </div>
            <div>
              <label className="block text-sm text-text-muted mb-1">{t('endTime')}</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg bg-surface-secondary border border-border-default focus:border-brand-purple focus:outline-none text-text-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-text-muted mb-1">{t('category')}</label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.entries(TASK_CATEGORIES) as [TaskCategory, typeof TASK_CATEGORIES[TaskCategory]][]).map(([key, cat]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCategory(key)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                    category === key
                      ? 'border-brand-purple bg-brand-purple/10 text-brand-purple'
                      : 'border-border-default text-text-muted hover:border-brand-purple/30'
                  }`}
                >
                  <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: cat.color }} />
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-brand-purple to-brand-mint text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50"
          >
            {submitting ? '...' : editingTask ? t('editTask') : t('addTask')}
          </button>
        </form>
      </div>
    </div>
  );
}
