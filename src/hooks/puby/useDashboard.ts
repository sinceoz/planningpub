'use client';

import { useState, useEffect } from 'react';
import {
  collection, query, where, orderBy, limit, onSnapshot,
  getDocs, Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { usePubyAuth } from './useAuth';
import type { PubyExpense, PubyTask, PubyUser, PubyProject } from '@/types/puby';

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function thisMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  return { start: Timestamp.fromDate(start), end: Timestamp.fromDate(end) };
}

export function useDashboard() {
  const { pubyUser } = usePubyAuth();
  const [todayTasks, setTodayTasks] = useState<PubyTask[]>([]);
  const [myPendingExpenses, setMyPendingExpenses] = useState<PubyExpense[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<PubyExpense[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<PubyExpense[]>([]);
  const [monthlyExpenses, setMonthlyExpenses] = useState<PubyExpense[]>([]);
  const [allUsers, setAllUsers] = useState<PubyUser[]>([]);
  const [projects, setProjects] = useState<PubyProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!pubyUser) return;

    const unsubs: (() => void)[] = [];

    // Today's tasks for current user
    const taskQ = query(
      collection(db, 'puby_tasks'),
      where('userId', '==', pubyUser.uid),
      where('date', '==', todayStr()),
      orderBy('startTime', 'asc'),
    );
    unsubs.push(onSnapshot(taskQ, (snap) => {
      setTodayTasks(snap.docs.map((d) => ({ id: d.id, ...d.data() } as PubyTask)));
    }));

    // My pending expenses (submitted, not yet fully approved)
    const myPendingQ = query(
      collection(db, 'puby_expenses'),
      where('createdBy', '==', pubyUser.uid),
      where('status', 'in', ['submitted', 'manager_approved']),
      orderBy('createdAt', 'desc'),
    );
    unsubs.push(onSnapshot(myPendingQ, (snap) => {
      setMyPendingExpenses(snap.docs.map((d) => ({ id: d.id, ...d.data() } as PubyExpense)));
    }));

    // Recent expenses (last 10 for activity feed)
    const recentQ = query(
      collection(db, 'puby_expenses'),
      orderBy('updatedAt', 'desc'),
      limit(10),
    );
    unsubs.push(onSnapshot(recentQ, (snap) => {
      setRecentExpenses(snap.docs.map((d) => ({ id: d.id, ...d.data() } as PubyExpense)));
      setLoading(false);
    }));

    // For managers/admins: expenses awaiting approval
    if (pubyUser.role === 'admin' || pubyUser.role === 'manager') {
      const pendingStatuses = pubyUser.role === 'admin'
        ? ['submitted', 'manager_approved']
        : ['submitted'];
      const approvalQ = query(
        collection(db, 'puby_expenses'),
        where('status', 'in', pendingStatuses),
        orderBy('createdAt', 'desc'),
      );
      unsubs.push(onSnapshot(approvalQ, (snap) => {
        setPendingApprovals(snap.docs.map((d) => ({ id: d.id, ...d.data() } as PubyExpense)));
      }));
    }

    // Admin only: monthly expenses + all users
    if (pubyUser.role === 'admin') {
      const { start, end } = thisMonthRange();
      const monthQ = query(
        collection(db, 'puby_expenses'),
        where('createdAt', '>=', start),
        where('createdAt', '<=', end),
      );
      unsubs.push(onSnapshot(monthQ, (snap) => {
        setMonthlyExpenses(snap.docs.map((d) => ({ id: d.id, ...d.data() } as PubyExpense)));
      }));

      getDocs(collection(db, 'puby_users')).then((snap) => {
        setAllUsers(snap.docs.map((d) => ({ uid: d.id, ...d.data() } as PubyUser)));
      });

      getDocs(collection(db, 'puby_projects')).then((snap) => {
        setProjects(snap.docs.map((d) => ({ id: d.id, ...d.data() } as PubyProject)));
      });
    }

    return () => unsubs.forEach((fn) => fn());
  }, [pubyUser]);

  const completedTasks = todayTasks.filter((t) => t.completed).length;

  // Monthly totals by project
  const monthlyByProject = monthlyExpenses
    .filter((e) => e.status !== 'draft' && e.status !== 'rejected')
    .reduce<Record<string, number>>((acc, e) => {
      acc[e.projectId] = (acc[e.projectId] || 0) + e.amount;
      return acc;
    }, {});

  const monthlyTotal = Object.values(monthlyByProject).reduce((a, b) => a + b, 0);

  return {
    todayTasks,
    completedTasks,
    myPendingExpenses,
    pendingApprovals,
    recentExpenses,
    monthlyExpenses,
    monthlyByProject,
    monthlyTotal,
    allUsers,
    projects,
    loading,
  };
}
