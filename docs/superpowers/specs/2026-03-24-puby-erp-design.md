# PUBY - PlanningPub Employee ERP System Design

## Overview

PUBY is an all-in-one ERP system for PlanningPub employees, integrated directly into the existing planningpub Next.js application as a `/puby` route group. It provides two core modules: **expense approval (지출결의)** and **employee time management (시간관리)**.

**Key decisions:**
- Single-app integration (not separate deploy)
- Firebase Auth with invite-link onboarding
- Firestore for all PUBY data (real-time sync)
- Dark mode default with dark/light toggle
- Mobile-optimized (responsive, touch-first)
- Auto-login via Firebase Auth persistence

---

## 1. Authentication & User Management

### Invite Flow
1. Admin enters employee email + role + department in PUBY admin page
2. System creates `puby_invitations` document with unique token (96-hour expiry)
3. Invitation email sent via Resend with link: `/puby/invite/[token]`
4. Employee clicks link → sets display name + password → Firebase Auth account created
5. `puby_users` document created with role/department from invitation
6. Token marked as used

### Roles

| Role | Permissions |
|------|-------------|
| `admin` | All expense approval/rejection, employee invite/management, project settings, schedule time-range settings |
| `manager` | First-stage approval on assigned projects, own expense creation |
| `user` | Own expense creation/submission, own schedule management |

### Auto-Login
- Firebase Auth `browserLocalPersistence` — session survives browser close/reopen
- `onAuthStateChanged` listener in `PubyAuthProvider` — automatic session restoration
- No manual "remember me" checkbox needed

### Data: `puby_invitations/{id}`
```
{
  token: string,           // unique invite token
  email: string,
  role: 'admin' | 'manager' | 'user',
  department: string,
  position: string,
  invitedBy: string,       // admin uid
  usedAt?: Timestamp,
  expiresAt: Timestamp,    // createdAt + 96 hours
  createdAt: Timestamp
}
```

### Data: `puby_users/{uid}`
```
{
  uid: string,
  email: string,
  displayName: string,
  role: 'admin' | 'manager' | 'user',
  department: string,
  position: string,
  profileImage?: string,
  themePreference: 'dark' | 'light',
  emailNotifications: boolean,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Access Control
- All `/puby/*` routes wrapped in `PubyAuthProvider`
- Unauthenticated access → redirect to `/puby` (login page)
- Role-based UI: admin-only menus hidden from user/manager
- Firestore rules enforce role-based read/write

---

## 2. Time Management (Schedule)

### My Tasks (`/puby/schedule/my`)

**Features:**
- Today / Tomorrow tab toggle
- Add task: title, time range, category, description (optional)
- Drag to reorder
- Tap to toggle completion
- Mobile: card-based layout, swipe gestures for complete/delete

### Data: `puby_tasks/{id}`
```
{
  id: string,
  userId: string,
  date: string,              // 'YYYY-MM-DD'
  title: string,
  description?: string,
  startTime: string,         // 'HH:MM'
  endTime: string,           // 'HH:MM'
  category: 'deepwork' | 'meeting' | 'admin' | 'travel' | 'fieldwork' | 'other',
  color: string,             // hex
  completed: boolean,
  order: number,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Categories (MICE industry)

| Category | Key | Color | Example |
|----------|-----|-------|---------|
| Deep Work | `deepwork` | Blue | Proposals, design work |
| Meeting | `meeting` | Amber | Client meetings, internal |
| Admin | `admin` | Gray | Paperwork, expense processing |
| Travel | `travel` | Green | Site travel, business trips |
| Fieldwork | `fieldwork` | Purple | Event operations, setup |
| Other | `other` | Indigo | Everything else |

### Team Schedule Board (`/puby/schedule`)

**Real-time sync:** Firestore `onSnapshot` subscription on `puby_tasks` filtered by date.

**PC view:** Gantt-style timeline — employee rows x time columns.

**Mobile view:** Vertical card stack per employee — tap name to expand schedule.

**Filters:** By department, by category, date picker with today/tomorrow quick-switch.

### Schedule Time Range

**Data: `puby_settings/schedule`**
```
{
  startHour: number,    // default: 9
  endHour: number,      // default: 18
  updatedBy: string,
  updatedAt: Timestamp
}
```
- Admin-only setting
- Affects the visible columns/range on the team board

---

## 3. Expense Approval (지출결의)

### Project-Level Approval Flow

**Data: `puby_projects/{id}`**
```
{
  id: string,
  name: string,
  status: 'proposal' | 'in_progress' | 'completed',
  approvalFlow: 'two_step' | 'direct',
  managerId?: string,        // first-stage approver (when two_step)
  members: string[],         // participant uid array
  createdBy: string,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

- `two_step`: submitted → manager_approved → approved → completed
- `direct`: submitted → approved → completed

### Expense Status Flow

```
draft → submitted → [manager_approved] → approved → completed
                  ↘ rejected → (edit) → re-submit
```

Rejection can happen at either stage (manager or admin). Rejected expenses return to the creator for editing and re-submission.

### Data: `puby_expenses/{id}`
```
{
  id: string,
  type: 'labor' | 'vendor' | 'card',
  projectId: string,
  createdBy: string,
  status: 'draft' | 'submitted' | 'manager_approved' | 'approved' | 'rejected' | 'completed',

  // Amounts
  amount: number,
  taxDeduction?: number,
  netAmount: number,

  // Approval history
  approvalHistory: [
    { action: string, by: string, role: string, at: Timestamp, comment?: string }
  ],
  rejectionReason?: string,

  // Completion
  paymentDate?: Timestamp,
  paymentProof?: string,

  // Notification
  notifyByEmail: boolean,

  // Attachments
  files: [{ name: string, url: string, type: string }],

  // --- Type-specific fields ---

  // Labor (인건비)
  laborDetails?: {
    name: string,
    residentId: string,
    address: string,
    bankName: string,
    accountNumber: string,
    accountHolder: string,
    taxType: 'business' | 'other' | 'daily_labor',
    workPeriod: { start: string, end: string },
    workDescription: string
  },

  // Vendor (업체)
  vendorDetails?: {
    businessNumber: string,
    companyName: string,
    representative: string,
    address: string,
    bankName: string,
    accountNumber: string,
    accountHolder: string,
    description: string
  },

  // Card (카드)
  cardDetails?: {
    storeName: string,
    paymentDateTime: Timestamp,
    cardLastFour?: string,
    description: string,
    reason: string
  },

  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Tax Deduction (Labor Expenses)

| Income Type | Rate | Note |
|-------------|------|------|
| Business income (사업소득) | 3.3% | Freelancer payments |
| Other income (기타소득) | 8.8% | Lecture fees, etc. |
| Daily labor (일용근로소득) | 2.7% on amount exceeding 150,000 KRW | Special cases only — use for contracts of 10+ days. Displayed with helper tooltip: "10일 이상 계약 시에만 사용" |

Default selection: business income. Daily labor option shown separately with explanatory label.

### OCR Integration

- Firebase Cloud Functions endpoint
- Claude Vision API for document recognition
- Supported documents: ID cards, bankbook copies, business registration, receipts
- Auto-populates form fields from OCR results
- User can review and correct before saving

### CSV Export

- Export filtered expense list as CSV
- Respects current filters (project, status, date range)
- Columns: date, project, type, amount, tax, net amount, status, creator
- UTF-8 BOM for Korean Excel compatibility

---

## 4. Notification System

### Data: `puby_notifications/{id}`
```
{
  id: string,
  userId: string,
  type: 'expense_submitted' | 'expense_approved' | 'expense_rejected'
      | 'expense_completed' | 'expense_manager_approved' | 'invite',
  title: string,
  message: string,
  relatedId?: string,
  read: boolean,
  createdAt: Timestamp
}
```

### Behavior
- Internal notification created automatically on every expense status change
- Email notification (via Resend) sent when:
  - Submitter checked `notifyByEmail` on the expense
  - Approver's `puby_users.emailNotifications` is true (for "new expense pending" alerts)
- Header bell icon shows unread count (Firestore `onSnapshot`)
- Click notification → navigate to related expense detail

---

## 5. Dashboard (`/puby/dashboard`)

### User View
- Today's tasks summary (completed / total)
- My pending expenses (awaiting approval)
- My rejected expenses (need revision)
- Recent notifications

### Manager View
- All of user view, plus:
- Expenses awaiting my approval (count + list)
- My projects' expense summary

### Admin View
- All of manager view, plus:
- Employee attendance overview (who has tasks registered today)
- This month's total expenditure
- Pending approval count across all projects
- Per-project expense summary
- Recent expense activity feed

---

## 6. UI & Layout

### Navigation
Add `PUBY` to existing Navbar:
```typescript
const NAV_ITEMS = [
  { href: '/about', key: 'about' },
  { href: '/portfolio', key: 'portfolio' },
  { href: '/contact', key: 'contact' },
  { href: '/planninghub', key: 'planninghub' },
  { href: '/puby', key: 'puby' },
]
```

### PUBY Internal Layout
- Shared top Navbar from planningpub (consistent branding)
- PUBY sidebar navigation (collapsible on mobile):
  - Dashboard
  - Schedule → Team Board / My Tasks
  - Expenses → List / New Expense
  - Admin (admin-only) → Employees / Projects / Settings
- Dark/light theme toggle in PUBY header area
- Mobile: bottom tab navigation or hamburger sidebar

### Theme
- Default: dark (consistent with existing planningpub site)
- Toggle: stored in `puby_users.themePreference`
- Implementation: Tailwind `dark:` classes with CSS variables
- Theme applies only within PUBY routes (existing site unaffected)

### Mobile Optimization
- Touch-first interaction (large tap targets, swipe gestures)
- Schedule board: vertical card stack per employee (not horizontal timeline)
- Expense forms: single-column stacked layout
- File upload: camera capture support for receipts
- Responsive breakpoints: mobile-first design

---

## 7. File Structure

```
src/
├── app/[locale]/puby/
│   ├── layout.tsx                  # PUBY layout (auth provider, sidebar, theme)
│   ├── page.tsx                    # Login page
│   ├── invite/[token]/page.tsx     # Invite acceptance + registration
│   ├── dashboard/page.tsx
│   ├── schedule/
│   │   ├── page.tsx                # Team schedule board
│   │   └── my/page.tsx             # My tasks
│   ├── expense/
│   │   ├── page.tsx                # Expense list
│   │   ├── new/
│   │   │   ├── labor/page.tsx
│   │   │   ├── vendor/page.tsx
│   │   │   └── card/page.tsx
│   │   └── [id]/page.tsx           # Detail / approval
│   └── admin/
│       ├── page.tsx                # Employee management
│       ├── projects/page.tsx       # Project management
│       └── settings/page.tsx       # Schedule time range, etc.
│
├── components/puby/
│   ├── layout/
│   │   ├── PubySidebar.tsx
│   │   ├── PubyHeader.tsx
│   │   └── PubyMobileNav.tsx
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── InviteForm.tsx
│   │   └── PubyAuthProvider.tsx
│   ├── schedule/
│   │   ├── TeamBoard.tsx
│   │   ├── TeamBoardMobile.tsx
│   │   ├── TaskList.tsx
│   │   ├── TaskForm.tsx
│   │   └── TaskCard.tsx
│   ├── expense/
│   │   ├── ExpenseTable.tsx
│   │   ├── LaborForm.tsx
│   │   ├── VendorForm.tsx
│   │   ├── CardForm.tsx
│   │   ├── FileUpload.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── ApprovalActions.tsx
│   │   └── TaxCalculator.tsx
│   ├── dashboard/
│   │   ├── StatCards.tsx
│   │   ├── RecentActivity.tsx
│   │   └── TaskSummary.tsx
│   └── notifications/
│       ├── NotificationBell.tsx
│       └── NotificationList.tsx
│
├── hooks/puby/
│   ├── useAuth.ts
│   ├── useTasks.ts
│   ├── useExpenses.ts
│   ├── useProjects.ts
│   ├── useTeamSchedule.ts
│   ├── useNotifications.ts
│   ├── useOcr.ts
│   └── useSettings.ts
│
├── types/puby.ts
│
└── lib/puby/
    ├── tax.ts
    ├── format.ts
    └── csv.ts
```

---

## 8. Firestore Collections Summary

| Collection | Purpose | Real-time |
|------------|---------|-----------|
| `puby_users` | Employee profiles & preferences | No |
| `puby_invitations` | Invite tokens | No |
| `puby_tasks` | Employee daily tasks/schedule | Yes (onSnapshot) |
| `puby_projects` | Project definitions & approval config | No |
| `puby_expenses` | All expense records | No |
| `puby_notifications` | In-app notifications | Yes (onSnapshot) |
| `puby_settings` | Global settings (schedule hours, etc.) | No |

---

## 9. Implementation Phases

| Phase | Scope | Deliverable |
|-------|-------|-------------|
| **Phase 1** | Firebase Auth + PUBY layout + routing + theme toggle + auto-login | Auth working, navigation, empty pages |
| **Phase 2** | Time management (my tasks + team board + real-time sync) | Schedule fully functional |
| **Phase 3** | Expense approval (3 forms + approval flow + project-level config) | Expense workflow complete |
| **Phase 4** | Dashboard + notifications + OCR + CSV export | Full feature set |

---

## 10. Firestore Security Rules (PUBY)

```
// puby_users: read own profile, admin reads all
match /puby_users/{uid} {
  allow read: if request.auth.uid == uid || isAdmin();
  allow write: if isAdmin();
}

// puby_tasks: read all (for team board), write own
match /puby_tasks/{taskId} {
  allow read: if isPubyUser();
  allow create: if request.auth.uid == request.resource.data.userId;
  allow update, delete: if request.auth.uid == resource.data.userId;
}

// puby_expenses: read own or admin/assigned-manager, write own drafts
match /puby_expenses/{expenseId} {
  allow read: if request.auth.uid == resource.data.createdBy || isAdmin() || isAssignedManager();
  allow create: if isPubyUser();
  allow update: if canUpdateExpense();
}

// puby_notifications: read/write own
match /puby_notifications/{notifId} {
  allow read, update: if request.auth.uid == resource.data.userId;
  allow create: if isPubyUser();
}

// puby_invitations: admin only
match /puby_invitations/{inviteId} {
  allow read, write: if isAdmin();
}

// puby_projects: read all puby users, write admin only
match /puby_projects/{projectId} {
  allow read: if isPubyUser();
  allow write: if isAdmin();
}

// puby_settings: read all puby users, write admin only
match /puby_settings/{settingId} {
  allow read: if isPubyUser();
  allow write: if isAdmin();
}
```

Helper functions (`isPubyUser`, `isAdmin`, `isAssignedManager`, `canUpdateExpense`) verify the caller exists in `puby_users` and has the appropriate role.
