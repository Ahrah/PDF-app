import jsPDF from 'jspdf';
import { Deal, Client, SellerInfo } from './types';
import { formatCurrency, formatDate, calculateTotal } from './utils';
import { setupKoreanFont } from './fonts/korean-font';

const DISCLAIMER = '본 문서는 거래용 견적서·청구서이며, 전자세금계산서가 아닙니다. 세금계산서는 홈택스에서 별도로 발급해주세요.';

export async function generatePDF(
  deal: Deal,
  client: Client,
  seller: SellerInfo,
  isPremium: boolean
): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Setup Korean font support
  setupKoreanFont(doc);

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let y = margin;

  doc.setFontSize(20);
  const title = deal.type === 'quote' ? '견적서' : '청구서';
  doc.text(title, pageWidth / 2, y, { align: 'center' });
  y += 15;

  if (!isPremium) {
    doc.setFontSize(10);
    doc.setTextColor(200, 200, 200);
    doc.text('WATERMARK - FREE PLAN', pageWidth / 2, pageHeight / 2, {
      align: 'center',
      angle: 45,
    });
    doc.setTextColor(0, 0, 0);
  }

  doc.setFontSize(10);
  doc.text(`발행일: ${formatDate(deal.issueDate)}`, margin, y);
  y += 7;

  if (deal.type === 'quote' && deal.validUntil) {
    doc.text(`유효기간: ${formatDate(deal.validUntil)}`, margin, y);
    y += 7;
  }

  if (deal.type === 'invoice' && deal.dueDate) {
    doc.text(`입금기한: ${formatDate(deal.dueDate)}`, margin, y);
    y += 7;
  }

  y += 5;
  doc.setFontSize(12);
  doc.text('공급자 정보', margin, y);
  y += 7;

  doc.setFontSize(10);
  doc.text(`${seller.businessName || seller.name}`, margin, y);
  y += 6;
  doc.text(`연락처: ${seller.phone}`, margin, y);
  y += 6;
  doc.text(`이메일: ${seller.email}`, margin, y);
  y += 6;
  if (seller.businessNumber) {
    doc.text(`사업자번호: ${seller.businessNumber}`, margin, y);
    y += 6;
  }
  if (deal.type === 'invoice' && seller.bankAccount) {
    doc.text(`입금계좌: ${seller.bankAccount}`, margin, y);
    y += 6;
  }

  y += 5;
  doc.setFontSize(12);
  doc.text('고객 정보', margin, y);
  y += 7;

  doc.setFontSize(10);
  doc.text(`${client.name}${client.company ? ` (${client.company})` : ''}`, margin, y);
  y += 6;
  if (client.email) {
    doc.text(`이메일: ${client.email}`, margin, y);
    y += 6;
  }

  y += 10;
  doc.setFontSize(12);
  doc.text('품목', margin, y);
  y += 7;

  doc.setFontSize(9);
  const colX = [margin, margin + 70, margin + 110, margin + 140];
  doc.text('품목명', colX[0], y);
  doc.text('수량', colX[1], y);
  doc.text('단가', colX[2], y);
  doc.text('금액', colX[3], y);
  y += 5;

  deal.lineItems.forEach((item) => {
    if (y > pageHeight - 40) {
      doc.addPage();
      y = margin;
    }
    const total = item.quantity * item.unitPrice;
    doc.text(item.name, colX[0], y);
    doc.text(String(item.quantity), colX[1], y);
    doc.text(formatCurrency(item.unitPrice), colX[2], y);
    doc.text(formatCurrency(total), colX[3], y);
    y += 6;
  });

  y += 5;
  const calc = calculateTotal(deal.lineItems, deal.discount, deal.vatMode);

  doc.setFontSize(10);
  doc.text(`소계: ${formatCurrency(calc.subtotal)}`, margin + 110, y);
  y += 6;

  if (deal.discount > 0) {
    doc.text(`할인: ${formatCurrency(deal.discount)}`, margin + 110, y);
    y += 6;
  }

  if (calc.vat > 0) {
    doc.text(`부가세 (10%): ${formatCurrency(calc.vat)}`, margin + 110, y);
    y += 6;
  }

  doc.setFontSize(12);
  doc.text(`합계: ${formatCurrency(calc.total)}`, margin + 110, y);
  y += 10;

  if (deal.memo) {
    doc.setFontSize(10);
    doc.text('메모:', margin, y);
    y += 6;
    const memoLines = doc.splitTextToSize(deal.memo, pageWidth - 2 * margin);
    doc.text(memoLines, margin, y);
    y += memoLines.length * 6;
  }

  if (deal.type === 'invoice' && deal.paymentMemo) {
    doc.setFontSize(10);
    y += 5;
    doc.text('입금 시 참고:', margin, y);
    y += 6;
    doc.text(deal.paymentMemo, margin, y);
    y += 6;
  }

  const disclaimerY = pageHeight - 25;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  const disclaimerLines = doc.splitTextToSize(DISCLAIMER, pageWidth - 2 * margin);
  doc.text(disclaimerLines, margin, disclaimerY);

  return doc.output('blob');
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
