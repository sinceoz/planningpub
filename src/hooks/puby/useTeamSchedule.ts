'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
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

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'puby_users'),
      (snap) => {
        setUsers(snap.docs.map((d) => ({ uid: d.id, ...d.data() } as PubyUser)));
      }
    );
    return unsub;
  }, []);

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
