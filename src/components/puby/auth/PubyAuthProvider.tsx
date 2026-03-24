'use client';

import { useState, useEffect, useCallback, type ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  browserLocalPersistence,
  setPersistence,
  type User,
} from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { PubyAuthContext } from '@/hooks/puby/useAuth';
import type { PubyUser } from '@/types/puby';

export default function PubyAuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [pubyUser, setPubyUser] = useState<PubyUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubAuth: (() => void) | undefined;

    setPersistence(auth, browserLocalPersistence).then(() => {
      unsubAuth = onAuthStateChanged(auth, (user) => {
        setFirebaseUser(user);
        if (!user) {
          setPubyUser(null);
          setLoading(false);
        }
      });
    });

    return () => unsubAuth?.();
  }, []);

  // Listen to puby_users document when firebase user is set
  useEffect(() => {
    if (!firebaseUser) return;

    const unsubUser = onSnapshot(
      doc(db, 'puby_users', firebaseUser.uid),
      (snap) => {
        if (snap.exists()) {
          setPubyUser({ uid: snap.id, ...snap.data() } as PubyUser);
        } else {
          setPubyUser(null);
        }
        setLoading(false);
      },
      () => {
        setPubyUser(null);
        setLoading(false);
      }
    );

    return unsubUser;
  }, [firebaseUser]);

  const signIn = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const signOutFn = useCallback(async () => {
    await firebaseSignOut(auth);
    setPubyUser(null);
  }, []);

  return (
    <PubyAuthContext.Provider
      value={{ firebaseUser, pubyUser, loading, signIn, signOut: signOutFn }}
    >
      {children}
    </PubyAuthContext.Provider>
  );
}
