export type DealStatus = '초안' | '발송함' | '입금 완료';

export type VATMode = '없음' | '별도' | '포함';

export type CustomerType = '개인' | '사업자';

export interface LineItem {
  id: string;
  name: string;
  unit?: string;
  quantity: number;
  unitPrice: number;
}

export interface Client {
  id: string;
  userId: string;
  customerType: CustomerType;
  name: string;
  company?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  businessNumber?: string;
  address?: string;
  memo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SellerInfo {
  userId: string;
  name: string;
  businessName?: string;
  businessType?: string;
  businessItem?: string;
  email: string;
  phone: string;
  bankAccount: string;
  businessNumber?: string;
  address?: string;
}

export interface Deal {
  id: string;
  userId: string;
  clientId: string;
  type: 'quote' | 'invoice';
  status: DealStatus;
  /** 거래명 — optional short description of what the deal is for. */
  title?: string;
  issueDate: string;
  validUntil?: string;
  dueDate?: string;
  lineItems: LineItem[];
  discount: number;
  vatMode: VATMode;
  memo?: string;
  paymentMemo?: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  pdfDownloaded?: boolean;
}

export interface Settings {
  isPremium: boolean;
  /** True only when actually purchased (not via free trial). Present on the /api/settings response. */
  isPaidPremium?: boolean;
  monthlyDealCount: number;
  currentMonth: string;
}

export interface MonthlyUsage {
  month: string;
  dealCount: number;
  dealIds: string[];
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  displayName?: string;
  phone?: string;
  /** null until the user explicitly starts their trial (see /api/auth/start-trial). */
  trialEndsAt: string | null;
  isPremium?: boolean;
  monthlyDealCount?: number;
  currentMonth?: string;
  createdAt: string;
  updatedAt: string;
}

// Bulk customer import types

export type ImportRowStatus = 'ok' | 'warning' | 'excluded';

export type ImportDuplicateAction = 'keep_existing' | 'create_new' | 'update_existing' | 'exclude';

export interface ImportRow {
  rowIndex: number;
  raw: Record<string, string>;
  mapped: {
    customerType?: CustomerType;
    name: string;
    company?: string;
    contactName?: string;
    email?: string;
    phone?: string;
    businessNumber?: string;
    address?: string;
    memo?: string;
  };
  status: ImportRowStatus;
  issues: string[];
  duplicateOfClientId?: string;
  duplicateReason?: string;
  action: ImportDuplicateAction;
}

export const CLIENT_COLUMN_KEYS = [
  'company',
  'contactName',
  'name',
  'email',
  'phone',
  'businessNumber',
  'address',
  'memo',
] as const;

export type ClientColumnKey = typeof CLIENT_COLUMN_KEYS[number];

// ---------- feedback / support submissions ----------

export type FeedbackType = 'feature_request' | 'support_issue';
export type FeedbackStatus = 'new' | 'in_review' | 'done';

export const FEATURE_REQUEST_CATEGORIES = ['기능 제안', '사용성 개선', '기타'] as const;
export type FeatureRequestCategory = typeof FEATURE_REQUEST_CATEGORIES[number];

export const SUPPORT_ISSUE_CATEGORIES = ['사용 중 오류', '저장·데이터', 'PDF·다운로드', '계정·이용권', '기타'] as const;
export type SupportIssueCategory = typeof SUPPORT_ISSUE_CATEGORIES[number];

export interface FeedbackSubmission {
  id: string;
  type: FeedbackType;
  category: string;
  title?: string;
  content: string;
  userId: string;
  userName?: string;
  userEmail: string;
  pagePath?: string;
  status: FeedbackStatus;
  createdAt: string;
  updatedAt: string;
}
