# PUBY ERP Phase 2: Time Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the time management module — personal task management (today/tomorrow) and real-time team schedule board with Gantt-style timeline.

**Architecture:** Tasks are stored in Firestore `puby_tasks` collection. Personal task management uses standard CRUD with optimistic updates. Team board uses `onSnapshot` for real-time sync across all employees. Schedule time range is admin-configurable via `puby_settings/schedule`.

**Tech Stack:** Next.js 16, Firestore (real-time), Tailwind CSS 4, next-intl, Lucide React, Framer Motion (already in deps)

**Spec:** `docs/superpowers/specs/2026-03-24-puby-erp-design.md` — Section 2

---

## File Structure

```
# New files
src/hooks/puby/useTasks.ts                     # Task CRUD + real-time for own tasks
src/hooks/puby/useTeamSchedule.ts              # Real-time all-employee task subscription
src/hooks/puby/useSettings.ts                  # Schedule settings (time range)
src/lib/puby/format.ts                         # Date/time formatting utilities
src/components/puby/schedule/TaskCard.tsx       # Individual task card
src/components/puby/schedule/TaskForm.tsx       # Add/edit task modal
src/components/puby/schedule/TaskList.tsx       # My tasks list (today/tomorrow)
src/components/puby/schedule/TeamBoard.tsx      # PC Gantt-style timeline
src/components/puby/schedule/TeamBoardMobile.tsx # Mobile card stack

# Modified files
src/app/[locale]/puby/schedule/my/page.tsx     # Replace placeholder with real content
src/app/[locale]/puby/schedule/page.tsx         # Replace placeholder with real content
src/i18n/messages/ko.json                      # Add schedule translation keys
src/i18n/messages/en.json                      # Add schedule translation keys
```

---

### Task 1: i18n Keys for Schedule

**Files:**
- Modify: `src/i18n/messages/ko.json`
- Modify: `src/i18n/messages/en.json`

- [ ] **Step 1: Add schedule keys to ko.json**

Add inside the `"puby"` object a new `"schedule"` section:
```json
"schedule": {
  "today": "오늘",
  "tomorrow": "내일",
  "addTask": "할일 추가",
  "editTask": "할일 수정",
  "title": "제목",
  "description": "설명 (선택)",
  "startTime": "시작 시간",
  "endTime": "종료 시간",
  "category": "카테고리",
  "noTasks": "등록된 할일이 없습니다.",
  "completed": "완료",
  "delete": "삭제",
  "deleteConfirm": "이 할일을 삭제하시겠습니까?",
  "teamBoard": "전체 스케줄",
  "filterDept": "부서",
  "filterAll": "전체",
  "categories": {
    "deepwork": "딥워크",
    "meeting": "미팅",
    "admin": "행정",
    "travel": "이동",
    "fieldwork": "현장근무",
    "other": "기타"
  }
}
```

- [ ] **Step 2: Add schedule keys to en.json**

Same structure with English values:
```json
"schedule": {
  "today": "Today",
  "tomorrow": "Tomorrow",
  "addTask": "Add Task",
  "editTask": "Edit Task",
  "title": "Title",
  "description": "Description (optional)",
  "startTime": "Start Time",
  "endTime": "End Time",
  "category": "Category",
  "noTasks": "No tasks registered.",
  "completed": "Done",
  "delete": "Delete",
  "deleteConfirm": "Delete this task?",
  "teamBoard": "Team Schedule",
  "filterDept": "Department",
  "filterAll": "All",
  "categories": {
    "deepwork": "Deep Work",
    "meeting": "Meeting",
    "admin": "Admin",
    "travel": "Travel",
    "fieldwork": "Fieldwork",
    "other": "Other"
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/i18n/messages/ko.json src/i18n/messages/en.json
git commit -m "feat(puby): add schedule i18n translation keys"
```

---

### Task 2: Format Utilities + Settings Hook

**Files:**
- Create: `src/lib/puby/format.ts`
- Create: `src/hooks/puby/useSettings.ts`

- [ ] **Step 1: Create format utilities**

```typescript
// src/lib/puby/format.ts

export function getTodayString(): string {
  return new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
}

export function getTomorrowString(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export function formatTime(time: string): string {
  // 'HH:MM' → 'HH:MM' (pass-through, but could add AM/PM later)
  return time;
}

export function generateTimeSlots(startHour: number, endHour: number): string[] {
  const slots: string[] = [];
  for (let h = startHour; h <= endHour; h++) {
    slots.push(`${h.toString().padStart(2, '0')}:00`);
  }
  return slots;
}

export function formatNumber(n: number): string {
  return n.toLocaleString('ko-KR');
}

export function formatCurrency(n: number): string {
  return `₩${formatNumber(n)}`;
}
```

- [ ] **Step 2: Create settings hook**

```typescript
// src/hooks/puby/useSettings.ts
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
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/puby/format.ts src/hooks/puby/useSettings.ts
git commit -m "feat(puby): add format utilities and schedule settings hook"
```

---

### Task 3: useTasks Hook

**Files:**
- Create: `src/hooks/puby/useTasks.ts`

- [ ] **Step 1: Create useTasks hook**

```typescript
// src/hooks/puby/useTasks.ts
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
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/puby/useTasks.ts
git commit -m "feat(puby): add useTasks hook with CRUD and real-time sync"
```

---

### Task 4: useTeamSchedule Hook

**Files:**
- Create: `src/hooks/puby/useTeamSchedule.ts`

- [ ] **Step 1: Create useTeamSchedule hook**

```typescript
// src/hooks/puby/useTeamSchedule.ts
'use client';

import { useState, useEffect } from 'react';
import {
  collection, query, where, onSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { PubyTask, PubyUser } from '@/types/puby';

interface TeamMemberSchedule {
  user: PubyUser;
  tasks: PubyTask[];
}

export function useTeamSchedule(date: string) {
  const [users, setUsers] = useState<PubyUser[]>([]);
  const [tasksByUser, setTasksByUser] = useState<Map<string, PubyTask[]>>(new Map());
  const [loading, setLoading] = useState(true);

  // Subscribe to all puby_users
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'puby_users'),
      (snap) => {
        setUsers(snap.docs.map((d) => ({ uid: d.id, ...d.data() } as PubyUser)));
      }
    );
    return unsub;
  }, []);

  // Subscribe to all tasks for the given date
  useEffect(() => {
    const q = query(
      collection(db, 'puby_tasks'),
      where('date', '==', date)
    );

    const unsub = onSnapshot(q, (snap) => {
      const grouped = new Map<string, PubyTask[]>();
      snap.docs.forEach((d) => {
        const task = { id: d.id, ...d.data() } as PubyTask;
        const existing = grouped.get(task.userId) || [];
        existing.push(task);
        grouped.set(task.userId, existing);
      });
      // Sort tasks within each user by startTime
      grouped.forEach((tasks, uid) => {
        grouped.set(uid, tasks.sort((a, b) => a.startTime.localeCompare(b.startTime)));
      });
      setTasksByUser(grouped);
      setLoading(false);
    }, () => setLoading(false));

    return unsub;
  }, [date]);

  const schedules: TeamMemberSchedule[] = users
    .sort((a, b) => a.displayName.localeCompare(b.displayName))
    .map((user) => ({
      user,
      tasks: tasksByUser.get(user.uid) || [],
    }));

  return { schedules, loading };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/puby/useTeamSchedule.ts
git commit -m "feat(puby): add useTeamSchedule hook with real-time sync"
```

---

### Task 5: TaskCard + TaskForm Components

**Files:**
- Create: `src/components/puby/schedule/TaskCard.tsx`
- Create: `src/components/puby/schedule/TaskForm.tsx`

- [ ] **Step 1: Create TaskCard**

```typescript
// src/components/puby/schedule/TaskCard.tsx
'use client';

import { useTranslations } from 'next-intl';
import { Check, Trash2, GripVertical } from 'lucide-react';
import type { PubyTask } from '@/types/puby';
import { TASK_CATEGORIES } from '@/types/puby';

interface TaskCardProps {
  task: PubyTask;
  onToggleComplete: (taskId: string, completed: boolean) => void;
  onDelete: (taskId: string) => void;
  onEdit: (task: PubyTask) => void;
  draggable?: boolean;
}

export default function TaskCard({ task, onToggleComplete, onDelete, onEdit, draggable }: TaskCardProps) {
  const t = useTranslations('puby.schedule');
  const category = TASK_CATEGORIES[task.category];

  return (
    <div
      className={`group flex items-center gap-3 p-3 rounded-lg border transition-all ${
        task.completed
          ? 'bg-surface-secondary/50 border-border-default opacity-60'
          : 'bg-surface-secondary border-border-default hover:border-brand-purple/30'
      }`}
    >
      {draggable && (
        <GripVertical className="w-4 h-4 text-text-muted cursor-grab shrink-0" />
      )}

      {/* Category color indicator */}
      <div
        className="w-1 h-10 rounded-full shrink-0"
        style={{ backgroundColor: task.color || category?.color || '#6366f1' }}
      />

      {/* Content */}
      <button
        className="flex-1 text-left min-w-0"
        onClick={() => onEdit(task)}
      >
        <div className={`text-sm font-medium truncate ${task.completed ? 'line-through text-text-muted' : 'text-text-primary'}`}>
          {task.title}
        </div>
        <div className="flex items-center gap-2 text-xs text-text-muted mt-0.5">
          <span>{task.startTime} – {task.endTime}</span>
          <span className="px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: `${task.color || category?.color}20`, color: task.color || category?.color }}>
            {category?.label || task.category}
          </span>
        </div>
      </button>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => onToggleComplete(task.id, task.completed)}
          className={`p-1.5 rounded-md transition-colors ${
            task.completed
              ? 'text-green-400 bg-green-400/10'
              : 'text-text-muted hover:text-green-400 hover:bg-green-400/10'
          }`}
          aria-label={t('completed')}
        >
          <Check className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="p-1.5 rounded-md text-text-muted hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-all"
          aria-label={t('delete')}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create TaskForm**

```typescript
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
```

- [ ] **Step 3: Commit**

```bash
git add src/components/puby/schedule/TaskCard.tsx src/components/puby/schedule/TaskForm.tsx
git commit -m "feat(puby): add TaskCard and TaskForm components"
```

---

### Task 6: TaskList + My Tasks Page

**Files:**
- Create: `src/components/puby/schedule/TaskList.tsx`
- Modify: `src/app/[locale]/puby/schedule/my/page.tsx`

- [ ] **Step 1: Create TaskList component**

```typescript
// src/components/puby/schedule/TaskList.tsx
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';
import { useTasks } from '@/hooks/puby/useTasks';
import { getTodayString, getTomorrowString } from '@/lib/puby/format';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import type { PubyTask } from '@/types/puby';

export default function TaskList() {
  const t = useTranslations('puby.schedule');
  const [tab, setTab] = useState<'today' | 'tomorrow'>('today');
  const date = tab === 'today' ? getTodayString() : getTomorrowString();
  const { tasks, loading, addTask, updateTask, deleteTask, toggleComplete } = useTasks(date);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<PubyTask | null>(null);

  function handleEdit(task: PubyTask) {
    setEditingTask(task);
    setShowForm(true);
  }

  function handleCloseForm() {
    setShowForm(false);
    setEditingTask(null);
  }

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t('myTasks')}</h1>
          {tasks.length > 0 && (
            <p className="text-sm text-text-muted mt-1">
              {completedCount}/{tasks.length} {t('completed')}
            </p>
          )}
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-brand-purple to-brand-mint text-white text-sm font-semibold hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          {t('addTask')}
        </button>
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

      {/* Task list */}
      {loading ? (
        <div className="text-center text-text-muted py-12">{t('loading')}</div>
      ) : tasks.length === 0 ? (
        <div className="text-center text-text-muted py-12">{t('noTasks')}</div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggleComplete={toggleComplete}
              onDelete={deleteTask}
              onEdit={handleEdit}
              draggable
            />
          ))}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <TaskForm
          onSubmit={addTask}
          onClose={handleCloseForm}
          editingTask={editingTask}
          onUpdate={updateTask}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Update My Tasks page**

Replace `src/app/[locale]/puby/schedule/my/page.tsx` with:
```typescript
'use client';
import TaskList from '@/components/puby/schedule/TaskList';

export default function MyTasksPage() {
  return <TaskList />;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/puby/schedule/TaskList.tsx src/app/[locale]/puby/schedule/my/page.tsx
git commit -m "feat(puby): add TaskList component and My Tasks page"
```

---

### Task 7: TeamBoard (PC) + TeamBoardMobile + Schedule Page

**Files:**
- Create: `src/components/puby/schedule/TeamBoard.tsx`
- Create: `src/components/puby/schedule/TeamBoardMobile.tsx`
- Modify: `src/app/[locale]/puby/schedule/page.tsx`

- [ ] **Step 1: Create TeamBoard (PC Gantt timeline)**

```typescript
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
```

- [ ] **Step 2: Create TeamBoardMobile**

```typescript
// src/components/puby/schedule/TeamBoardMobile.tsx
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { TASK_CATEGORIES } from '@/types/puby';
import type { PubyTask, PubyUser } from '@/types/puby';

interface TeamBoardMobileProps {
  schedules: { user: PubyUser; tasks: PubyTask[] }[];
}

export default function TeamBoardMobile({ schedules }: TeamBoardMobileProps) {
  const t = useTranslations('puby.schedule');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggleExpand(uid: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(uid)) next.delete(uid);
      else next.add(uid);
      return next;
    });
  }

  return (
    <div className="space-y-2">
      {schedules.map(({ user, tasks }) => {
        const isOpen = expanded.has(user.uid);
        return (
          <div key={user.uid} className="border border-border-default rounded-lg overflow-hidden">
            <button
              onClick={() => toggleExpand(user.uid)}
              className="w-full flex items-center justify-between p-3 bg-surface-secondary/50 hover:bg-surface-secondary transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-text-primary">{user.displayName}</span>
                <span className="text-xs text-text-muted">{user.department}</span>
                <span className="text-xs text-text-muted bg-surface-secondary px-1.5 py-0.5 rounded">
                  {tasks.length}건
                </span>
              </div>
              {isOpen ? <ChevronDown className="w-4 h-4 text-text-muted" /> : <ChevronRight className="w-4 h-4 text-text-muted" />}
            </button>

            {isOpen && (
              <div className="p-2 space-y-1.5">
                {tasks.length === 0 ? (
                  <p className="text-xs text-text-muted text-center py-2">{t('noTasks')}</p>
                ) : (
                  tasks.map((task) => {
                    const category = TASK_CATEGORIES[task.category];
                    return (
                      <div
                        key={task.id}
                        className={`flex items-center gap-2 p-2 rounded-md ${task.completed ? 'opacity-50' : ''}`}
                      >
                        <div className="w-1 h-8 rounded-full shrink-0" style={{ backgroundColor: task.color || category?.color }} />
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm truncate ${task.completed ? 'line-through text-text-muted' : 'text-text-primary'}`}>
                            {task.title}
                          </div>
                          <div className="text-xs text-text-muted">
                            {task.startTime} – {task.endTime}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        );
      })}

      {schedules.length === 0 && (
        <div className="text-center text-text-muted py-12">{t('noTasks')}</div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Update Schedule page**

Replace `src/app/[locale]/puby/schedule/page.tsx` with:
```typescript
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
```

- [ ] **Step 4: Commit**

```bash
git add src/components/puby/schedule/TeamBoard.tsx src/components/puby/schedule/TeamBoardMobile.tsx src/app/[locale]/puby/schedule/page.tsx
git commit -m "feat(puby): add team schedule board with Gantt timeline and mobile view"
```

---

### Task 8: Build Verification

- [ ] **Step 1: Run build**

```bash
npm run build
```

Verify all PUBY schedule routes compile without errors.

- [ ] **Step 2: Commit any fixes if needed**

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat(puby): Phase 2 complete — time management module"
```
