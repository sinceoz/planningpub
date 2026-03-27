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
  date: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
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
  /** 문서 분류 태그 (OCR 분석 또는 수동 지정) */
  tag?: 'biz_registration' | 'bankbook' | 'tax_invoice' | 'id_card' | 'etc';
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
  expectedPaymentDate?: string;
  completedAt?: string;
  paymentProof?: string;
  notifyByEmail: boolean;
  files: ExpenseFile[];
  extraFiles?: ExpenseFile[];
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

// === Document Cache (거래처/인력 문서 캐시) ===
export interface VendorCache {
  businessNumber: string;
  companyName: string;
  files: ExpenseFile[];
  updatedAt: Timestamp;
}

export interface LaboreeCache {
  residentId: string;
  name: string;
  files: ExpenseFile[];
  updatedAt: Timestamp;
}

// === Settings ===
export interface PubyScheduleSettings {
  startHour: number;
  endHour: number;
  updatedBy: string;
  updatedAt: Timestamp;
}
