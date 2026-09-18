export type DealStatus = '초안' | '발송함' | '입금 완료';

export type VATMode = '없음' | '별도' | '포함';

export interface LineItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface Client {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  createdAt: string;
}

export interface SellerInfo {
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

export interface AppData {
  clients: Client[];
  deals: Deal[];
  seller: SellerInfo | null;
  settings: {
    isPremium: boolean;
    monthlyDealCount: number;
    currentMonth: string;
  };
}

export interface MonthlyUsage {
  month: string;
  dealCount: number;
  dealIds: string[];
}
