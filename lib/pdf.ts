import jsPDF from 'jspdf';
import { Deal, Client, SellerInfo } from './types';
import { formatCurrency, formatDate, calculateTotal, formatBusinessNumber } from './utils';
import { setupKoreanFont } from './fonts/korean-font';

const DISCLAIMER = '본 문서는 거래용 견적서·청구서이며, 전자세금계산서가 아닙니다. 세금계산서는 홈택스에서 별도로 발급해주세요.';

export type DocTitleLabel = '견적서' | 'INVOICE';

export async function generatePDF(
  deal: Deal,
  client: Client,
  seller: SellerInfo,
  isPremium: boolean,
  titleLabel: DocTitleLabel = deal.type === 'quote' ? '견적서' : 'INVOICE'
): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  setupKoreanFont(doc);

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const rightEdge = pageWidth - margin;
  let y = margin;

  // ---- header ----
  doc.setFontSize(26);
  doc.text(titleLabel, margin, y + 4);

  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text(`No. ${deal.id.slice(0, 8).toUpperCase()}`, rightEdge, y - 2, { align: 'right' });
  doc.setTextColor(0, 0, 0);
  y += 16;

  if (!isPremium) {
    doc.setFontSize(10);
    doc.setTextColor(200, 200, 200);
    doc.text('WATERMARK - FREE PLAN', pageWidth / 2, pageHeight / 2, {
      align: 'center',
      angle: 45,
    });
    doc.setTextColor(0, 0, 0);
  }

  // ---- meta rows: 공급받는자 / 거래명 / 거래일 (/ 입금기한) ----
  const metaLabelX = margin;
  const metaValueX = margin + 26;
  doc.setFontSize(10);

  const clientLabel = client.company
    ? `${client.company}${client.contactName ? ` (${client.contactName})` : ''}`
    : client.name;

  const metaRows: [string, string][] = [
    ['공급받는자', clientLabel],
    ['거래명', deal.title || deal.lineItems[0]?.name || '-'],
    ['거래일', formatDate(deal.issueDate)],
  ];
  if (deal.type === 'quote' && deal.validUntil) {
    metaRows.push(['유효기간', formatDate(deal.validUntil)]);
  }
  if (deal.type === 'invoice' && deal.dueDate) {
    metaRows.push(['입금기한', formatDate(deal.dueDate)]);
  }

  metaRows.forEach(([label, value]) => {
    doc.setTextColor(100, 100, 100);
    doc.text(label, metaLabelX, y);
    doc.setTextColor(0, 0, 0);
    doc.text(value, metaValueX, y);
    y += 6;
  });

  y += 4;
  doc.setFontSize(10);
  doc.text('아래와 같이 계산합니다.', margin, y);
  y += 10;

  // ---- item table ----
  const colX = {
    item: margin,
    unit: margin + 85,
    qty: margin + 105,
    price: margin + 125,
    amount: rightEdge,
  };

  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text('항목', colX.item, y);
  doc.text('단위', colX.unit, y);
  doc.text('수량', colX.qty, y);
  doc.text('단가', colX.price, y, { align: 'right' });
  doc.text('금액', colX.amount, y, { align: 'right' });
  doc.setTextColor(0, 0, 0);
  y += 2;
  doc.setDrawColor(180, 180, 180);
  doc.line(margin, y, rightEdge, y);
  y += 6;

  deal.lineItems.forEach((item) => {
    if (y > pageHeight - 70) {
      doc.addPage();
      y = margin;
    }
    const total = item.quantity * item.unitPrice;
    doc.text(item.name, colX.item, y);
    doc.text(item.unit || '-', colX.unit, y);
    doc.text(String(item.quantity), colX.qty, y);
    doc.text(formatCurrency(item.unitPrice), colX.price, y, { align: 'right' });
    doc.text(formatCurrency(total), colX.amount, y, { align: 'right' });
    y += 7;
  });

  y += 2;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, rightEdge, y);
  y += 10;

  // ---- totals ----
  const calc = calculateTotal(deal.lineItems, deal.discount, deal.vatMode);
  const totalsLabelX = margin + 110;

  doc.setFontSize(10);
  const subtotalLabel = deal.vatMode === '포함' ? '소계 (VAT 포함)' : '소계';
  doc.text(subtotalLabel, totalsLabelX, y);
  doc.text(formatCurrency(calc.subtotal), rightEdge, y, { align: 'right' });
  y += 6;

  if (deal.discount > 0) {
    doc.text('할인', totalsLabelX, y);
    doc.text(`- ${formatCurrency(deal.discount)}`, rightEdge, y, { align: 'right' });
    y += 6;
  }

  if (deal.vatMode === '별도') {
    doc.text('VAT (10%)', totalsLabelX, y);
    doc.text(formatCurrency(calc.vat), rightEdge, y, { align: 'right' });
    y += 6;
  }

  y += 1;
  doc.setDrawColor(0, 0, 0);
  doc.line(totalsLabelX, y, rightEdge, y);
  y += 6;
  doc.setFontSize(13);
  doc.text('합계', totalsLabelX, y);
  doc.text(formatCurrency(calc.total), rightEdge, y, { align: 'right' });
  y += 12;

  // ---- 특이사항 ----
  doc.setFontSize(10);
  doc.text('특이사항', margin, y);
  y += 4;
  const noteText = deal.type === 'invoice' && deal.paymentMemo ? deal.paymentMemo : (deal.memo || '');
  const boxTop = y;
  const boxHeight = 22;
  doc.setDrawColor(200, 200, 200);
  doc.rect(margin, boxTop, rightEdge - margin, boxHeight);
  if (noteText) {
    const noteLines = doc.splitTextToSize(noteText, rightEdge - margin - 8);
    doc.text(noteLines, margin + 4, boxTop + 6);
  }
  y = boxTop + boxHeight + 12;

  // ---- 공급자 info block ----
  if (y > pageHeight - 55) {
    doc.addPage();
    y = margin;
  }
  doc.setDrawColor(180, 180, 180);
  doc.line(margin, y, rightEdge, y);
  y += 8;

  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text('공급자', margin, y);
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.text(seller.businessName || seller.name, margin + 16, y);
  y += 6;

  doc.setFontSize(9);
  const infoParts: string[] = [];
  if (seller.businessNumber) infoParts.push(`등록번호. ${formatBusinessNumber(seller.businessNumber)}`);
  infoParts.push(`대표자. ${seller.name}`);
  if (seller.businessType) infoParts.push(`업태. ${seller.businessType}`);
  if (seller.businessItem) infoParts.push(`종목. ${seller.businessItem}`);
  if (infoParts.length) {
    doc.text(infoParts.join('   '), margin, y);
    y += 5;
  }

  if (seller.address) {
    doc.text(`A. ${seller.address}`, margin, y);
    y += 5;
  }

  doc.text(`T. ${seller.phone}   E. ${seller.email}`, margin, y);
  y += 5;

  if (deal.type === 'invoice' && seller.bankAccount) {
    doc.text(`입금지. ${seller.bankAccount}`, margin, y);
    y += 5;
  }

  // ---- disclaimer footer ----
  const disclaimerY = pageHeight - 15;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
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
