export type DealStatus = '초안' | '발송함' | '입금 완료';

export type VATMode = '없음' | '별도' | '포함';

export type CustomerType = '개인' | '사업자';

export interface LineItem {
  id: string;
  name: string;
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
  trialEndsAt: string;
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
