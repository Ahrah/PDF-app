import { Deal, LineItem, VATMode, SellerInfo, Client } from './types';

export function calculateLineTotal(item: LineItem): number {
  return item.quantity * item.unitPrice;
}

export function calculateSubtotal(items: LineItem[]): number {
  return items.reduce((sum, item) => sum + calculateLineTotal(item), 0);
}

export function calculateVAT(subtotal: number, discount: number, vatMode: VATMode): number {
  if (vatMode === '없음') return 0;
  
  const discounted = subtotal - discount;
  if (vatMode === '별도') {
    return Math.round(discounted * 0.1);
  }
  
  return 0;
}

export function calculateTotal(
  items: LineItem[],
  discount: number,
  vatMode: VATMode
): { subtotal: number; vat: number; total: number } {
  const subtotal = calculateSubtotal(items);
  const vat = calculateVAT(subtotal, discount, vatMode);
  
  let total: number;
  if (vatMode === '포함') {
    total = subtotal - discount;
  } else {
    total = subtotal - discount + vat;
  }
  
  return { subtotal, vat, total };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function isOverdue(dueDate: string | undefined, status: string): boolean {
  if (!dueDate || status === '입금 완료') return false;
  return new Date(dueDate) < new Date();
}

export function validateBusinessNumber(number: string): boolean {
  const cleaned = number.replace(/[-\s]/g, '');
  if (cleaned.length !== 10) return false;
  return /^\d{10}$/.test(cleaned);
}

export function formatBusinessNumber(number: string): string {
  const cleaned = number.replace(/[-\s]/g, '');
  if (cleaned.length !== 10) return number;
  return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5)}`;
}

/** Live-formats digits into 000-00-00000 as the user types, dropping anything past 10 digits. */
export function autoFormatBusinessNumber(input: string): string {
  const digits = input.replace(/[^0-9]/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
}
