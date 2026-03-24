# PUBY ERP Phase 1: Auth + Layout + Routing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set up Firebase Auth, PUBY routing, layout (sidebar/header), theme toggle, auto-login, and invite system — all wired into the existing planningpub Next.js app.

**Architecture:** PUBY lives under `src/app/[locale]/puby/` as a route group within the existing Next.js 16 app. It shares the top Navbar but has its own nested layout with sidebar, auth provider, and theme system. Firebase Auth is added alongside the existing Firebase client SDK. Server Actions using Firebase Admin SDK handle invite token validation for unauthenticated users.

**Tech Stack:** Next.js 16, Firebase Auth + Firestore, Tailwind CSS 4, next-intl, Resend, Lucide React

**Spec:** `docs/superpowers/specs/2026-03-24-puby-erp-design.md`

---

## File Structure

```
# New files
src/types/puby.ts                              # All PUBY TypeScript types
src/lib/puby/firebase-admin.ts                 # Firebase Admin SDK init (server-side)
src/lib/puby/format.ts                         # Formatting utilities (dates, currency)
src/hooks/puby/useAuth.ts                      # Auth context hook
src/hooks/puby/useSettings.ts                  # Settings hook (schedule hours, etc.)
src/components/puby/auth/PubyAuthProvider.tsx   # Auth context provider + guard
src/components/puby/auth/LoginForm.tsx          # Email/password login form
src/components/puby/auth/InviteForm.tsx         # Invite acceptance + registration form
src/components/puby/layout/PubySidebar.tsx      # Sidebar navigation
src/components/puby/layout/PubyHeader.tsx       # Header (user info, bell, theme toggle)
src/components/puby/layout/PubyMobileNav.tsx    # Mobile bottom navigation
src/app/[locale]/puby/layout.tsx                # PUBY nested layout
src/app/[locale]/puby/page.tsx                  # Login page
src/app/[locale]/puby/invite/[token]/page.tsx   # Invite acceptance page
src/app/[locale]/puby/dashboard/page.tsx        # Dashboard placeholder
src/app/[locale]/puby/schedule/page.tsx         # Team board placeholder
src/app/[locale]/puby/schedule/my/page.tsx      # My tasks placeholder
src/app/[locale]/puby/expense/page.tsx          # Expense list placeholder
src/app/[locale]/puby/expense/new/labor/page.tsx # Labor form placeholder
src/app/[locale]/puby/expense/new/vendor/page.tsx # Vendor form placeholder
src/app/[locale]/puby/expense/new/card/page.tsx  # Card form placeholder
src/app/[locale]/puby/admin/page.tsx            # Admin placeholder
src/app/[locale]/puby/admin/projects/page.tsx   # Projects placeholder
src/app/[locale]/puby/admin/settings/page.tsx   # Settings placeholder
src/app/api/puby/invite/route.ts                # Server Action: send invite email
src/app/api/puby/invite/validate/route.ts       # Server Action: validate token + create user
src/app/api/puby/admin/seed/route.ts            # One-time admin seed endpoint

# Modified files
src/lib/firebase.ts                            # Add Firebase Auth export
src/components/layout/Navbar.tsx               # Add PUBY nav item
src/components/layout/MobileMenu.tsx           # Add PUBY nav item
src/app/[locale]/layout.tsx                    # Conditionally hide Footer/FloatingContact for /puby
src/i18n/messages/ko.json                      # Add PUBY translation keys
src/i18n/messages/en.json                      # Add PUBY translation keys
firestore.rules                                # Add PUBY security rules
package.json                                   # Add firebase-admin dependency
```

---

### Task 1: TypeScript Types

**Files:**
- Create: `src/types/puby.ts`

- [ ] **Step 1: Create PUBY type definitions**

```typescript
// src/types/puby.ts
import { Timestamp } from 'firebase/firestore';

// === Roles ===
export type PubyRole = 'admin' | 'manager' | 'user';

// === Users ===
export interface PubyUser {
  uid: string;
  email: string;
  displayName: string;
  role: PubyRole;
  department: string;
  position: string;
  profileImage?: string;
  themePreference: 'dark' | 'light';
  emailNotifications: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// === Invitations ===
export interface PubyInvitation {
  id: string;
  token: string;
  email: string;
  role: PubyRole;
  department: string;
  position: string;
  invitedBy: string;
  usedAt?: Timestamp;
  expiresAt: Timestamp;
  createdAt: Timestamp;
}

// === Tasks (Schedule) ===
export type TaskCategory = 'deepwork' | 'meeting' | 'admin' | 'travel' | 'fieldwork' | 'other';

export const TASK_CATEGORIES: Record<TaskCategory, { label: string; labelEn: string; color: string }> = {
  deepwork: { label: '딥워크', labelEn: 'Deep Work', color: '#3b82f6' },
  meeting: { label: '미팅', labelEn: 'Meeting', color: '#f59e0b' },
  admin: { label: '행정', labelEn: 'Admin', color: '#6b7280' },
  travel: { label: '이동', labelEn: 'Travel', color: '#22c55e' },
  fieldwork: { label: '현장근무', labelEn: 'Fieldwork', color: '#a855f7' },
  other: { label: '기타', labelEn: 'Other', color: '#6366f1' },
};

export interface PubyTask {
  id: string;
  userId: string;
  date: string; // 'YYYY-MM-DD'
  title: string;
  description?: string;
  startTime: string; // 'HH:MM'
  endTime: string;   // 'HH:MM'
  category: TaskCategory;
  color: string;
  completed: boolean;
  order: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// === Projects ===
export type ProjectStatus = 'proposal' | 'in_progress' | 'completed';
export type ApprovalFlow = 'two_step' | 'direct';

export interface PubyProject {
  id: string;
  name: string;
  status: ProjectStatus;
  approvalFlow: ApprovalFlow;
  managerId?: string;
  members: string[];
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// === Expenses ===
export type ExpenseType = 'labor' | 'vendor' | 'card';
export type ExpenseStatus = 'draft' | 'submitted' | 'manager_approved' | 'approved' | 'rejected' | 'completed';
export type IncomeType = 'business' | 'other' | 'daily_labor';

export interface ApprovalHistoryEntry {
  action: string;
  by: string;
  role: string;
  at: Timestamp;
  comment?: string;
}

export interface ExpenseFile {
  name: string;
  url: string;
  type: string;
}

export interface LaborDetails {
  name: string;
  residentId: string;
  address: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  taxType: IncomeType;
  workPeriod: { start: string; end: string };
  workDescription: string;
}

export interface VendorDetails {
  businessNumber: string;
  companyName: string;
  representative: string;
  address: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  description: string;
}

export interface CardDetails {
  storeName: string;
  paymentDateTime: Timestamp;
  cardLastFour?: string;
  description: string;
  reason: string;
}

export interface PubyExpense {
  id: string;
  type: ExpenseType;
  projectId: string;
  createdBy: string;
  status: ExpenseStatus;
  amount: number;
  taxDeduction?: number;
  netAmount: number;
  approvalHistory: ApprovalHistoryEntry[];
  rejectionReason?: string;
  paymentDate?: Timestamp;
  paymentProof?: string;
  notifyByEmail: boolean;
  files: ExpenseFile[];
  laborDetails?: LaborDetails;
  vendorDetails?: VendorDetails;
  cardDetails?: CardDetails;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// === Notifications ===
export type NotificationType =
  | 'expense_submitted'
  | 'expense_approved'
  | 'expense_rejected'
  | 'expense_completed'
  | 'expense_manager_approved'
  | 'invite';

export interface PubyNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedId?: string;
  read: boolean;
  createdAt: Timestamp;
}

// === Settings ===
export interface PubyScheduleSettings {
  startHour: number;
  endHour: number;
  updatedBy: string;
  updatedAt: Timestamp;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/types/puby.ts
git commit -m "feat(puby): add TypeScript type definitions for PUBY ERP"
```

---

### Task 2: Firebase Setup (Auth + Admin SDK)

**Files:**
- Modify: `src/lib/firebase.ts`
- Create: `src/lib/puby/firebase-admin.ts`
- Modify: `package.json`

- [ ] **Step 1: Install firebase-admin**

```bash
npm install firebase-admin
```

- [ ] **Step 2: Add Firebase Auth export to existing firebase.ts**

Add to `src/lib/firebase.ts` after the existing imports:

```typescript
import { getAuth } from 'firebase/auth';
```

And after the existing exports:

```typescript
export const auth = getAuth(app);
```

- [ ] **Step 3: Create Firebase Admin SDK init**

```typescript
// src/lib/puby/firebase-admin.ts
import { initializeApp, getApps, cert, type ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount: ServiceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

const adminApp = getApps().find(a => a.name === 'puby-admin')
  ?? initializeApp({ credential: cert(serviceAccount) }, 'puby-admin');

export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/firebase.ts src/lib/puby/firebase-admin.ts package.json package-lock.json
git commit -m "feat(puby): add Firebase Auth client + Admin SDK setup"
```

---

### Task 3: i18n Messages

**Files:**
- Modify: `src/i18n/messages/ko.json`
- Modify: `src/i18n/messages/en.json`

- [ ] **Step 1: Add PUBY keys to ko.json**

Add to the `"nav"` section:
```json
"puby": "PUBY"
```

Add new top-level section:
```json
"puby": {
  "login": {
    "title": "PUBY 로그인",
    "email": "이메일",
    "password": "비밀번호",
    "submit": "로그인",
    "error": "이메일 또는 비밀번호가 올바르지 않습니다.",
    "noAccount": "계정이 없으신가요? 관리자에게 초대를 요청하세요."
  },
  "invite": {
    "title": "PUBY 가입",
    "displayName": "이름",
    "password": "비밀번호",
    "passwordConfirm": "비밀번호 확인",
    "submit": "가입하기",
    "expired": "초대 링크가 만료되었습니다.",
    "invalid": "유효하지 않은 초대 링크입니다.",
    "used": "이미 사용된 초대 링크입니다.",
    "success": "가입이 완료되었습니다. 로그인해주세요."
  },
  "sidebar": {
    "dashboard": "대시보드",
    "schedule": "시간관리",
    "teamBoard": "전체 스케줄",
    "myTasks": "내 할일",
    "expense": "지출결의",
    "expenseList": "결의 목록",
    "newExpense": "새 결의서",
    "admin": "관리",
    "employees": "직원 관리",
    "projects": "프로젝트 관리",
    "settings": "설정"
  },
  "header": {
    "notifications": "알림",
    "theme": "테마 전환",
    "logout": "로그아웃"
  },
  "dashboard": {
    "title": "대시보드"
  },
  "common": {
    "loading": "로딩 중...",
    "error": "오류가 발생했습니다.",
    "save": "저장",
    "cancel": "취소",
    "delete": "삭제",
    "edit": "수정",
    "confirm": "확인"
  }
}
```

- [ ] **Step 2: Add corresponding en.json keys**

Add to the `"nav"` section:
```json
"puby": "PUBY"
```

Add new top-level section:
```json
"puby": {
  "login": {
    "title": "PUBY Login",
    "email": "Email",
    "password": "Password",
    "submit": "Sign In",
    "error": "Invalid email or password.",
    "noAccount": "No account? Ask your admin for an invitation."
  },
  "invite": {
    "title": "Join PUBY",
    "displayName": "Name",
    "password": "Password",
    "passwordConfirm": "Confirm Password",
    "submit": "Create Account",
    "expired": "This invite link has expired.",
    "invalid": "Invalid invite link.",
    "used": "This invite link has already been used.",
    "success": "Account created. Please sign in."
  },
  "sidebar": {
    "dashboard": "Dashboard",
    "schedule": "Schedule",
    "teamBoard": "Team Board",
    "myTasks": "My Tasks",
    "expense": "Expenses",
    "expenseList": "Expense List",
    "newExpense": "New Expense",
    "admin": "Admin",
    "employees": "Employees",
    "projects": "Projects",
    "settings": "Settings"
  },
  "header": {
    "notifications": "Notifications",
    "theme": "Toggle Theme",
    "logout": "Sign Out"
  },
  "dashboard": {
    "title": "Dashboard"
  },
  "common": {
    "loading": "Loading...",
    "error": "An error occurred.",
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "confirm": "Confirm"
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/i18n/messages/ko.json src/i18n/messages/en.json
git commit -m "feat(puby): add i18n translation keys for PUBY"
```

---

### Task 4: Auth Hook + Provider

**Files:**
- Create: `src/hooks/puby/useAuth.ts`
- Create: `src/components/puby/auth/PubyAuthProvider.tsx`

- [ ] **Step 1: Create useAuth hook**

```typescript
// src/hooks/puby/useAuth.ts
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
```

- [ ] **Step 2: Create PubyAuthProvider**

```typescript
// src/components/puby/auth/PubyAuthProvider.tsx
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
```

- [ ] **Step 3: Commit**

```bash
git add src/hooks/puby/useAuth.ts src/components/puby/auth/PubyAuthProvider.tsx
git commit -m "feat(puby): add auth context provider with auto-login"
```

---

### Task 5: Login Form

**Files:**
- Create: `src/components/puby/auth/LoginForm.tsx`

- [ ] **Step 1: Create LoginForm component**

```typescript
// src/components/puby/auth/LoginForm.tsx
'use client';

import { useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { usePubyAuth } from '@/hooks/puby/useAuth';
import { Lock, Mail } from 'lucide-react';

export default function LoginForm() {
  const t = useTranslations('puby.login');
  const { signIn } = usePubyAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await signIn(email, password);
    } catch {
      setError(t('error'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <h1 className="text-2xl font-bold text-center mb-8">{t('title')}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('email')}
            required
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-surface-secondary border border-border-default focus:border-brand-purple focus:outline-none text-text-primary placeholder:text-text-muted"
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('password')}
            required
            minLength={8}
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-surface-secondary border border-border-default focus:border-brand-purple focus:outline-none text-text-primary placeholder:text-text-muted"
          />
        </div>
        {error && (
          <p className="text-red-400 text-sm text-center">{error}</p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-brand-purple to-brand-mint text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? '...' : t('submit')}
        </button>
      </form>
      <p className="mt-6 text-sm text-text-muted text-center">
        {t('noAccount')}
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/puby/auth/LoginForm.tsx
git commit -m "feat(puby): add login form component"
```

---

### Task 6: Invite System (Server-Side API + Form)

**Files:**
- Create: `src/app/api/puby/invite/route.ts`
- Create: `src/app/api/puby/invite/validate/route.ts`
- Create: `src/components/puby/auth/InviteForm.tsx`

- [ ] **Step 1: Create invite send API route**

This API route is called by the admin to create an invitation and send the email.

```typescript
// src/app/api/puby/invite/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/puby/firebase-admin';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import { Resend } from 'resend';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    // Verify the caller is an admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const idToken = authHeader.split('Bearer ')[1];
    const decoded = await adminAuth.verifyIdToken(idToken);

    // Check admin role
    const callerDoc = await adminDb.collection('puby_users').doc(decoded.uid).get();
    if (!callerDoc.exists || callerDoc.data()?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { email, role, department, position, locale } = await req.json();

    // Generate unique token
    const token = crypto.randomBytes(32).toString('hex');
    const now = Timestamp.now();
    const expiresAt = Timestamp.fromMillis(now.toMillis() + 96 * 60 * 60 * 1000); // 96 hours

    // Save invitation
    await adminDb.collection('puby_invitations').add({
      token,
      email,
      role,
      department,
      position,
      invitedBy: decoded.uid,
      expiresAt,
      createdAt: now,
    });

    // Send email
    const inviteUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/${locale || 'ko'}/puby/invite/${token}`;
    await resend.emails.send({
      from: 'PlanningPub <info@planningpub.com>',
      to: email,
      subject: '[PlanningPub] PUBY 초대',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #7842B3;">PUBY 초대</h2>
          <p>PlanningPub PUBY 시스템에 초대되었습니다.</p>
          <p>아래 링크를 클릭하여 계정을 생성해주세요:</p>
          <a href="${inviteUrl}" style="display: inline-block; padding: 12px 24px; background: #7842B3; color: white; text-decoration: none; border-radius: 8px; margin: 16px 0;">가입하기</a>
          <p style="font-size: 12px; color: #999;">이 링크는 96시간 후 만료됩니다.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Invite error:', error);
    return NextResponse.json({ error: 'Failed to send invite' }, { status: 500 });
  }
}
```

- [ ] **Step 2: Create invite validation API route**

This is called by the unauthenticated invite form to validate the token and create the user.

```typescript
// src/app/api/puby/invite/validate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/puby/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

// GET: validate token (check if valid, not expired, not used)
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }

  const snap = await adminDb.collection('puby_invitations')
    .where('token', '==', token)
    .limit(1)
    .get();

  if (snap.empty) {
    return NextResponse.json({ error: 'invalid' }, { status: 404 });
  }

  const invite = snap.docs[0].data();
  if (invite.usedAt) {
    return NextResponse.json({ error: 'used' }, { status: 410 });
  }
  if (invite.expiresAt.toMillis() < Date.now()) {
    return NextResponse.json({ error: 'expired' }, { status: 410 });
  }

  return NextResponse.json({
    email: invite.email,
    role: invite.role,
    department: invite.department,
    position: invite.position,
  });
}

// POST: accept invitation and create user
export async function POST(req: NextRequest) {
  try {
    const { token, displayName, password } = await req.json();

    // Validate token again
    const snap = await adminDb.collection('puby_invitations')
      .where('token', '==', token)
      .limit(1)
      .get();

    if (snap.empty) {
      return NextResponse.json({ error: 'invalid' }, { status: 404 });
    }

    const inviteDoc = snap.docs[0];
    const invite = inviteDoc.data();

    if (invite.usedAt) {
      return NextResponse.json({ error: 'used' }, { status: 410 });
    }
    if (invite.expiresAt.toMillis() < Date.now()) {
      return NextResponse.json({ error: 'expired' }, { status: 410 });
    }

    // Create Firebase Auth user
    const userRecord = await adminAuth.createUser({
      email: invite.email,
      password,
      displayName,
    });

    const now = Timestamp.now();

    // Create puby_users document
    await adminDb.collection('puby_users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: invite.email,
      displayName,
      role: invite.role,
      department: invite.department,
      position: invite.position,
      themePreference: 'dark',
      emailNotifications: true,
      createdAt: now,
      updatedAt: now,
    });

    // Mark invitation as used
    await inviteDoc.ref.update({ usedAt: now });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Invite accept error:', error);
    if (error.code === 'auth/email-already-exists') {
      return NextResponse.json({ error: 'email-exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}
```

- [ ] **Step 3: Create InviteForm component**

```typescript
// src/components/puby/auth/InviteForm.tsx
'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { User, Lock } from 'lucide-react';

interface InviteFormProps {
  token: string;
  locale: string;
}

export default function InviteForm({ token, locale }: InviteFormProps) {
  const t = useTranslations('puby.invite');
  const router = useRouter();
  const [inviteData, setInviteData] = useState<{
    email: string; role: string; department: string; position: string;
  } | null>(null);
  const [error, setError] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function validate() {
      try {
        const res = await fetch(`/api/puby/invite/validate?token=${token}`);
        if (!res.ok) {
          const data = await res.json();
          setError(data.error === 'used' ? t('used') : data.error === 'expired' ? t('expired') : t('invalid'));
          return;
        }
        setInviteData(await res.json());
      } catch {
        setError(t('invalid'));
      } finally {
        setLoading(false);
      }
    }
    validate();
  }, [token, t]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password !== passwordConfirm) return;
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/puby/invite/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, displayName, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error === 'used' ? t('used') : data.error === 'expired' ? t('expired') : t('invalid'));
        return;
      }

      setSucceeded(true);
    } catch {
      setError(t('invalid'));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="text-center text-text-muted">Loading...</div>;

  if (succeeded) {
    return (
      <div className="w-full max-w-sm mx-auto text-center">
        <p className="text-lg text-green-400 mb-4">{t('success')}</p>
        <a href={`/${locale}/puby`} className="text-brand-purple hover:underline">
          로그인하기
        </a>
      </div>
    );
  }

  if (error && !inviteData) {
    return <div className="text-center text-red-400 text-lg">{error}</div>;
  }
  if (!inviteData) return null;

  return (
    <div className="w-full max-w-sm mx-auto">
      <h1 className="text-2xl font-bold text-center mb-2">{t('title')}</h1>
      <p className="text-center text-text-muted mb-8">{inviteData.email}</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder={t('displayName')}
            required
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-surface-secondary border border-border-default focus:border-brand-purple focus:outline-none text-text-primary placeholder:text-text-muted"
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('password')}
            required
            minLength={8}
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-surface-secondary border border-border-default focus:border-brand-purple focus:outline-none text-text-primary placeholder:text-text-muted"
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            placeholder={t('passwordConfirm')}
            required
            minLength={8}
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-surface-secondary border border-border-default focus:border-brand-purple focus:outline-none text-text-primary placeholder:text-text-muted"
          />
        </div>
        {password && passwordConfirm && password !== passwordConfirm && (
          <p className="text-red-400 text-sm">비밀번호가 일치하지 않습니다.</p>
        )}
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        <button
          type="submit"
          disabled={submitting || password !== passwordConfirm}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-brand-purple to-brand-mint text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? '...' : t('submit')}
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/puby/invite/route.ts src/app/api/puby/invite/validate/route.ts src/components/puby/auth/InviteForm.tsx
git commit -m "feat(puby): add invite system with server-side validation and email"
```

---

### Task 7: PUBY Layout (Sidebar + Header + Mobile Nav)

**Files:**
- Create: `src/components/puby/layout/PubySidebar.tsx`
- Create: `src/components/puby/layout/PubyHeader.tsx`
- Create: `src/components/puby/layout/PubyMobileNav.tsx`

- [ ] **Step 1: Create PubySidebar**

```typescript
// src/components/puby/layout/PubySidebar.tsx
'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { usePubyAuth } from '@/hooks/puby/useAuth';
import {
  LayoutDashboard, Calendar, ListTodo, Receipt,
  FilePlus, Users, FolderKanban, Settings, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  href: string;
  icon: React.ElementType;
  labelKey: string;
  children?: { href: string; labelKey: string }[];
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/puby/dashboard', icon: LayoutDashboard, labelKey: 'dashboard' },
  {
    href: '/puby/schedule', icon: Calendar, labelKey: 'schedule',
    children: [
      { href: '/puby/schedule', labelKey: 'teamBoard' },
      { href: '/puby/schedule/my', labelKey: 'myTasks' },
    ],
  },
  {
    href: '/puby/expense', icon: Receipt, labelKey: 'expense',
    children: [
      { href: '/puby/expense', labelKey: 'expenseList' },
      { href: '/puby/expense/new/labor', labelKey: 'newExpense' },
    ],
  },
  {
    href: '/puby/admin', icon: Users, labelKey: 'admin', adminOnly: true,
    children: [
      { href: '/puby/admin', labelKey: 'employees' },
      { href: '/puby/admin/projects', labelKey: 'projects' },
      { href: '/puby/admin/settings', labelKey: 'settings' },
    ],
  },
];

export default function PubySidebar() {
  const t = useTranslations('puby.sidebar');
  const pathname = usePathname();
  const { pubyUser } = usePubyAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`hidden md:flex flex-col border-r border-border-default bg-surface-primary transition-all duration-200 ${
        collapsed ? 'w-16' : 'w-56'
      }`}
    >
      <div className="flex-1 py-4">
        {NAV_ITEMS.map((item) => {
          if (item.adminOnly && pubyUser?.role !== 'admin') return null;
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <div key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  isActive
                    ? 'text-brand-purple bg-brand-purple/10 border-r-2 border-brand-purple'
                    : 'text-text-muted hover:text-text-primary hover:bg-surface-secondary'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!collapsed && <span>{t(item.labelKey)}</span>}
              </Link>
              {!collapsed && isActive && item.children?.map((child) => (
                <Link
                  key={child.href}
                  href={child.href}
                  className={`block pl-11 pr-4 py-2 text-sm transition-colors ${
                    pathname === child.href
                      ? 'text-brand-purple'
                      : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  {t(child.labelKey)}
                </Link>
              ))}
            </div>
          );
        })}
      </div>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="p-3 text-text-muted hover:text-text-primary border-t border-border-default"
      >
        {collapsed ? <ChevronRight className="w-4 h-4 mx-auto" /> : <ChevronLeft className="w-4 h-4 mx-auto" />}
      </button>
    </aside>
  );
}
```

- [ ] **Step 2: Create PubyHeader**

```typescript
// src/components/puby/layout/PubyHeader.tsx
'use client';

import { useTranslations } from 'next-intl';
import { usePubyAuth } from '@/hooks/puby/useAuth';
import { Bell, Sun, Moon, LogOut } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function PubyHeader() {
  const t = useTranslations('puby.header');
  const { pubyUser, signOut } = usePubyAuth();

  if (!pubyUser) return null;

  const isDark = pubyUser.themePreference === 'dark';

  async function toggleTheme() {
    if (!pubyUser) return;
    const newTheme = isDark ? 'light' : 'dark';
    await updateDoc(doc(db, 'puby_users', pubyUser.uid), {
      themePreference: newTheme,
    });
  }

  return (
    <header className="h-14 border-b border-border-default bg-surface-primary px-4 flex items-center justify-between md:justify-end gap-3">
      {/* Mobile: show user info on left */}
      <div className="md:hidden text-sm font-medium text-text-primary">
        {pubyUser.displayName}
      </div>

      <div className="flex items-center gap-2">
        {/* Notification bell - placeholder count */}
        <button
          className="relative p-2 text-text-muted hover:text-text-primary transition-colors rounded-lg hover:bg-surface-secondary"
          aria-label={t('notifications')}
        >
          <Bell className="w-4 h-4" />
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-text-muted hover:text-text-primary transition-colors rounded-lg hover:bg-surface-secondary"
          aria-label={t('theme')}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User info (desktop) */}
        <div className="hidden md:flex items-center gap-2 px-2 text-sm">
          <span className="text-text-muted">{pubyUser.displayName}</span>
          <span className="text-xs text-text-muted bg-surface-secondary px-2 py-0.5 rounded">
            {pubyUser.role}
          </span>
        </div>

        {/* Logout */}
        <button
          onClick={signOut}
          className="p-2 text-text-muted hover:text-red-400 transition-colors rounded-lg hover:bg-surface-secondary"
          aria-label={t('logout')}
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
```

- [ ] **Step 3: Create PubyMobileNav**

```typescript
// src/components/puby/layout/PubyMobileNav.tsx
'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { usePubyAuth } from '@/hooks/puby/useAuth';
import { LayoutDashboard, Calendar, Receipt, Users } from 'lucide-react';

const MOBILE_TABS = [
  { href: '/puby/dashboard', icon: LayoutDashboard, labelKey: 'dashboard' },
  { href: '/puby/schedule/my', icon: Calendar, labelKey: 'myTasks' },
  { href: '/puby/expense', icon: Receipt, labelKey: 'expenseList' },
  { href: '/puby/admin', icon: Users, labelKey: 'admin', adminOnly: true },
];

export default function PubyMobileNav() {
  const t = useTranslations('puby.sidebar');
  const pathname = usePathname();
  const { pubyUser } = usePubyAuth();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-primary border-t border-border-default">
      <div className="flex items-center justify-around h-14">
        {MOBILE_TABS.map((tab) => {
          if (tab.adminOnly && pubyUser?.role !== 'admin') return null;
          const Icon = tab.icon;
          const isActive = pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 text-xs transition-colors ${
                isActive ? 'text-brand-purple' : 'text-text-muted'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{t(tab.labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/puby/layout/PubySidebar.tsx src/components/puby/layout/PubyHeader.tsx src/components/puby/layout/PubyMobileNav.tsx
git commit -m "feat(puby): add sidebar, header, and mobile nav components"
```

---

### Task 8: PUBY Layout + Route Pages

**Files:**
- Create: `src/app/[locale]/puby/layout.tsx`
- Create: `src/app/[locale]/puby/page.tsx`
- Create: `src/app/[locale]/puby/invite/[token]/page.tsx`
- Create: `src/app/[locale]/puby/dashboard/page.tsx`
- Create: `src/app/[locale]/puby/schedule/page.tsx`
- Create: `src/app/[locale]/puby/schedule/my/page.tsx`
- Create: `src/app/[locale]/puby/expense/page.tsx`
- Create: `src/app/[locale]/puby/admin/page.tsx`
- Modify: `src/app/[locale]/layout.tsx`

- [ ] **Step 1: Create PUBY nested layout**

```typescript
// src/app/[locale]/puby/layout.tsx
'use client';

import { Suspense } from 'react';
import { usePathname } from '@/i18n/routing';
import PubyAuthProvider from '@/components/puby/auth/PubyAuthProvider';
import PubySidebar from '@/components/puby/layout/PubySidebar';
import PubyHeader from '@/components/puby/layout/PubyHeader';
import PubyMobileNav from '@/components/puby/layout/PubyMobileNav';
import { usePubyAuth } from '@/hooks/puby/useAuth';

function PubyLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { pubyUser, loading } = usePubyAuth();

  // Invite page is accessible without auth
  const isInvitePage = pathname.includes('/puby/invite/');
  const isLoginPage = pathname === '/puby' || pathname.endsWith('/puby');

  // Show loading spinner during auth check
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="animate-spin w-8 h-8 border-2 border-brand-purple border-t-transparent rounded-full" />
      </div>
    );
  }

  // Invite page: no sidebar, no auth required
  if (isInvitePage) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4">
        {children}
      </div>
    );
  }

  // Not logged in: show login page
  if (!pubyUser) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4">
        {children}
      </div>
    );
  }

  // Logged in: show full layout with sidebar
  return (
    <div className={pubyUser.themePreference === 'light' ? 'puby-light' : ''}>
      <div className="flex min-h-[calc(100vh-64px)]">
        <PubySidebar />
        <div className="flex-1 flex flex-col">
          <PubyHeader />
          <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
      <PubyMobileNav />
    </div>
  );
}

export default function PubyLayout({ children }: { children: React.ReactNode }) {
  return (
    <PubyAuthProvider>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="animate-spin w-8 h-8 border-2 border-brand-purple border-t-transparent rounded-full" />
        </div>
      }>
        <PubyLayoutInner>{children}</PubyLayoutInner>
      </Suspense>
    </PubyAuthProvider>
  );
}
```

- [ ] **Step 2: Create login page**

```typescript
// src/app/[locale]/puby/page.tsx
'use client';

import { useEffect } from 'react';
import LoginForm from '@/components/puby/auth/LoginForm';
import { usePubyAuth } from '@/hooks/puby/useAuth';
import { useRouter } from '@/i18n/routing';

export default function PubyLoginPage() {
  const { pubyUser, loading } = usePubyAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && pubyUser) {
      router.push('/puby/dashboard');
    }
  }, [loading, pubyUser, router]);

  return <LoginForm />;
}
```

- [ ] **Step 3: Create invite page**

```typescript
// src/app/[locale]/puby/invite/[token]/page.tsx
import InviteForm from '@/components/puby/auth/InviteForm';

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string; locale: string }>;
}) {
  const { token, locale } = await params;

  return <InviteForm token={token} locale={locale} />;
}
```

- [ ] **Step 4: Create placeholder pages (dashboard, schedule, expense, admin)**

```typescript
// src/app/[locale]/puby/dashboard/page.tsx
'use client';
import { useTranslations } from 'next-intl';

export default function DashboardPage() {
  const t = useTranslations('puby.dashboard');
  return <h1 className="text-2xl font-bold">{t('title')}</h1>;
}
```

```typescript
// src/app/[locale]/puby/schedule/page.tsx
'use client';
import { useTranslations } from 'next-intl';

export default function TeamBoardPage() {
  const t = useTranslations('puby.sidebar');
  return <h1 className="text-2xl font-bold">{t('teamBoard')}</h1>;
}
```

```typescript
// src/app/[locale]/puby/schedule/my/page.tsx
'use client';
import { useTranslations } from 'next-intl';

export default function MyTasksPage() {
  const t = useTranslations('puby.sidebar');
  return <h1 className="text-2xl font-bold">{t('myTasks')}</h1>;
}
```

```typescript
// src/app/[locale]/puby/expense/page.tsx
'use client';
import { useTranslations } from 'next-intl';

export default function ExpenseListPage() {
  const t = useTranslations('puby.sidebar');
  return <h1 className="text-2xl font-bold">{t('expenseList')}</h1>;
}
```

```typescript
// src/app/[locale]/puby/admin/page.tsx
'use client';
import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { usePubyAuth } from '@/hooks/puby/useAuth';
import { useRouter } from '@/i18n/routing';

export default function AdminPage() {
  const t = useTranslations('puby.sidebar');
  const { pubyUser } = usePubyAuth();
  const router = useRouter();

  useEffect(() => {
    if (pubyUser && pubyUser.role !== 'admin') {
      router.push('/puby/dashboard');
    }
  }, [pubyUser, router]);

  if (pubyUser?.role !== 'admin') return null;

  return <h1 className="text-2xl font-bold">{t('employees')}</h1>;
}
```

- [ ] **Step 5: Create remaining placeholder pages (expense/new/*, admin/*)**

```typescript
// src/app/[locale]/puby/expense/new/labor/page.tsx
'use client';
export default function LaborFormPage() {
  return <h1 className="text-2xl font-bold">인건비 결의서</h1>;
}
```

```typescript
// src/app/[locale]/puby/expense/new/vendor/page.tsx
'use client';
export default function VendorFormPage() {
  return <h1 className="text-2xl font-bold">업체 결의서</h1>;
}
```

```typescript
// src/app/[locale]/puby/expense/new/card/page.tsx
'use client';
export default function CardFormPage() {
  return <h1 className="text-2xl font-bold">카드 결의서</h1>;
}
```

```typescript
// src/app/[locale]/puby/admin/projects/page.tsx
'use client';
import { useTranslations } from 'next-intl';
export default function ProjectsPage() {
  const t = useTranslations('puby.sidebar');
  return <h1 className="text-2xl font-bold">{t('projects')}</h1>;
}
```

```typescript
// src/app/[locale]/puby/admin/settings/page.tsx
'use client';
import { useTranslations } from 'next-intl';
export default function SettingsPage() {
  const t = useTranslations('puby.sidebar');
  return <h1 className="text-2xl font-bold">{t('settings')}</h1>;
}
```

- [ ] **Step 6: Modify locale layout to hide Footer/FloatingContact for PUBY**

In `src/app/[locale]/layout.tsx`, the layout needs to detect when the path is under `/puby` and hide Footer and FloatingContact. Since this is a server component, we need to use the `params` and check the path. However, the layout doesn't know the full path — only nested segments do. The cleanest approach is to use a client wrapper or pass a flag.

Instead, modify the layout to wrap Footer and FloatingContact in a client component that conditionally renders based on `usePathname()`:

Create a small wrapper:

```typescript
// Add to src/app/[locale]/layout.tsx — or create a separate component
// The simplest approach: use a ConditionalFooter client component
```

Actually, the cleanest approach for the existing server layout: PUBY's own `layout.tsx` already provides its own chrome. The issue is that `[locale]/layout.tsx` always renders Footer and FloatingContact. We need to make them conditional.

Create `src/components/layout/ConditionalFooter.tsx`:

```typescript
// src/components/layout/ConditionalFooter.tsx
'use client';

// Using next/navigation intentionally — need the raw pathname with locale prefix
// to detect /puby routes regardless of locale (e.g., /ko/puby, /en/puby)
import { usePathname } from 'next/navigation';
import Footer from './Footer';
import FloatingContact from '@/components/floating/FloatingContact';

export default function ConditionalFooter() {
  const pathname = usePathname();
  const isPuby = pathname.includes('/puby');

  if (isPuby) return null;

  return (
    <>
      <Footer />
      <FloatingContact />
    </>
  );
}
```

Then update `src/app/[locale]/layout.tsx` to use it:
- Remove direct `<Footer />` and `<FloatingContact />` imports/usage
- Replace with `<ConditionalFooter />`

- [ ] **Step 7: Commit**

```bash
git add src/app/[locale]/puby/ src/components/layout/ConditionalFooter.tsx src/app/[locale]/layout.tsx
git commit -m "feat(puby): add PUBY layout, all route pages, and conditional footer"
```

---

### Task 9: Navbar Update

**Files:**
- Modify: `src/components/layout/Navbar.tsx`
- Modify: `src/components/layout/MobileMenu.tsx`

- [ ] **Step 1: Add PUBY to NAV_ITEMS in both files**

In `src/components/layout/Navbar.tsx`, add to the `NAV_ITEMS` array:
```typescript
{ href: '/puby', key: 'puby' },
```

In `src/components/layout/MobileMenu.tsx`, add the same entry.

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/Navbar.tsx src/components/layout/MobileMenu.tsx
git commit -m "feat(puby): add PUBY link to main navigation"
```

---

### Task 10: Firestore Security Rules

**Files:**
- Modify: `firestore.rules`

- [ ] **Step 1: Replace the open development rules with proper PUBY rules**

Replace the contents of `firestore.rules` with the full rules from the spec (Section 10), keeping the existing open rules for the non-PUBY collections (`portfolios`, `partners`) since those are still in development mode.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Existing collections — keep open for now
    match /portfolios/{document=**} {
      allow read: if true;
      allow write: if true;
    }
    match /partners/{document=**} {
      allow read: if true;
      allow write: if true;
    }

    // === PUBY ERP Rules ===

    function getPubyUser() {
      return get(/databases/$(database)/documents/puby_users/$(request.auth.uid));
    }

    function isPubyUser() {
      return request.auth != null && exists(/databases/$(database)/documents/puby_users/$(request.auth.uid));
    }

    function isAdmin() {
      return request.auth != null && getPubyUser().data.role == 'admin';
    }

    function isAssignedManager() {
      return request.auth != null
        && get(/databases/$(database)/documents/puby_projects/$(resource.data.projectId)).data.managerId == request.auth.uid;
    }

    match /puby_users/{uid} {
      allow read: if isPubyUser();
      allow write: if isAdmin();
    }

    match /puby_tasks/{taskId} {
      allow read: if isPubyUser();
      allow create: if request.auth.uid == request.resource.data.userId;
      allow update, delete: if request.auth.uid == resource.data.userId;
    }

    match /puby_expenses/{expenseId} {
      allow read: if request.auth.uid == resource.data.createdBy || isAdmin() || isAssignedManager();
      allow create: if isPubyUser()
                       && request.resource.data.status == 'draft'
                       && request.resource.data.createdBy == request.auth.uid;
      allow update: if (request.auth.uid == resource.data.createdBy
                         && resource.data.status in ['draft', 'rejected'])
                     || (isAssignedManager()
                         && resource.data.status == 'submitted'
                         && request.resource.data.status in ['manager_approved', 'rejected'])
                     || (isAdmin()
                         && ((resource.data.status == 'submitted' && request.resource.data.status in ['approved', 'rejected'])
                             || (resource.data.status == 'manager_approved' && request.resource.data.status in ['approved', 'rejected'])
                             || (resource.data.status == 'approved' && request.resource.data.status == 'completed')));
      allow delete: if request.auth.uid == resource.data.createdBy
                       && resource.data.status == 'draft';
    }

    match /puby_notifications/{notifId} {
      allow read, update: if request.auth.uid == resource.data.userId;
    }

    match /puby_invitations/{inviteId} {
      allow read, write: if isAdmin();
    }

    match /puby_projects/{projectId} {
      allow read: if isPubyUser();
      allow write: if isAdmin();
    }

    match /puby_settings/{settingId} {
      allow read: if isPubyUser();
      allow write: if isAdmin();
    }
  }
}
```

- [ ] **Step 2: Deploy rules**

```bash
npx firebase deploy --only firestore:rules
```

- [ ] **Step 3: Commit**

```bash
git add firestore.rules
git commit -m "feat(puby): add Firestore security rules for PUBY ERP"
```

---

### Task 11: Admin Seed Endpoint

**Files:**
- Create: `src/app/api/puby/admin/seed/route.ts`

This is a one-time endpoint to create the first admin user. It should be called once, then secured or removed.

- [ ] **Step 1: Create admin seed route**

```typescript
// src/app/api/puby/admin/seed/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/puby/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
  // Check secret first — fail fast
  const seedSecret = req.headers.get('X-Seed-Secret');
  if (seedSecret !== process.env.PUBY_SEED_SECRET) {
    return NextResponse.json({ error: 'Invalid seed secret' }, { status: 403 });
  }

  // Only allow if no admin exists yet
  const existingAdmins = await adminDb.collection('puby_users')
    .where('role', '==', 'admin')
    .limit(1)
    .get();

  if (!existingAdmins.empty) {
    return NextResponse.json({ error: 'Admin already exists' }, { status: 409 });
  }

  const { email, password, displayName } = await req.json();

  try {
    const user = await adminAuth.createUser({ email, password, displayName });
    const now = Timestamp.now();

    await adminDb.collection('puby_users').doc(user.uid).set({
      uid: user.uid,
      email,
      displayName,
      role: 'admin',
      department: '경영',
      position: '대표',
      themePreference: 'dark',
      emailNotifications: true,
      createdAt: now,
      updatedAt: now,
    });

    // Set default schedule settings
    await adminDb.collection('puby_settings').doc('schedule').set({
      startHour: 9,
      endHour: 18,
      updatedBy: user.uid,
      updatedAt: now,
    });

    return NextResponse.json({ success: true, uid: user.uid });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/puby/admin/seed/route.ts
git commit -m "feat(puby): add one-time admin seed endpoint"
```

---

### Task 12: Verify & Test

- [ ] **Step 1: Set up environment variables**

Ensure the following are set in `.env.local`:
```
# Existing Firebase client vars (already set)
# NEXT_PUBLIC_FIREBASE_API_KEY=...
# NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
# etc.

# New: Firebase Admin SDK (server-side)
FIREBASE_PROJECT_ID=planningpub8528
FIREBASE_CLIENT_EMAIL=<from service account JSON>
FIREBASE_PRIVATE_KEY=<from service account JSON>

# New: Base URL for invite links
NEXT_PUBLIC_BASE_URL=https://planningpub.com

# New: One-time seed secret
PUBY_SEED_SECRET=<random string>
```

- [ ] **Step 2: Run dev server and verify**

```bash
npm run dev
```

Verify:
1. Navigate to `/ko/puby` — should see login form
2. Site navbar shows "PUBY" link
3. Footer and FloatingContact are hidden on PUBY pages
4. Footer and FloatingContact still show on other pages (e.g., `/ko/about`)

- [ ] **Step 3: Seed the first admin**

```bash
curl -X POST http://localhost:3000/api/puby/admin/seed \
  -H "Content-Type: application/json" \
  -H "X-Seed-Secret: YOUR_SEED_SECRET" \
  -d '{"email":"admin@planningpub.com","password":"your-password","displayName":"관리자"}'
```

- [ ] **Step 4: Test login flow**

1. Login with the seeded admin credentials at `/ko/puby`
2. Should redirect to `/ko/puby/dashboard`
3. Sidebar shows all nav items including Admin section
4. Theme toggle works (dark/light switch)
5. Close browser and reopen — should auto-login

- [ ] **Step 5: Test invite flow**

1. As admin, use the invite API (or build admin UI) to invite a test user
2. Check email for invite link
3. Click link → should show registration form with pre-filled email
4. Complete registration → redirect to login
5. Login with new credentials → should work, sidebar should NOT show admin section

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "feat(puby): Phase 1 complete — auth, layout, routing, theme"
```
