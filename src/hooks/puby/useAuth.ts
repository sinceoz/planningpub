'use client';

import { createContext, useContext } from 'react';
import type { User } from 'firebase/auth';
import type { PubyUser } from '@/types/puby';

export interface PubyAuthContextType {
  firebaseUser: User | null;
  pubyUser: PubyUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const PubyAuthContext = createContext<PubyAuthContextType | null>(null);

export function usePubyAuth(): PubyAuthContextType {
  const ctx = useContext(PubyAuthContext);
  if (!ctx) {
    throw new Error('usePubyAuth must be used within PubyAuthProvider');
  }
  return ctx;
}
