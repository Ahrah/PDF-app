import Papa from 'papaparse';
import ExcelJS from 'exceljs';
import { Client, ClientColumnKey, CLIENT_COLUMN_KEYS, ImportRow, CustomerType } from './types';

export const MAX_IMPORT_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_IMPORT_ROWS = 1000;
export const ALLOWED_IMPORT_EXTENSIONS = ['.csv', '.xlsx'];

// Korean/English header variants -> canonical column key.
// Matching is done on a normalized (trimmed, lowercased, no-space) header.
const HEADER_ALIASES: Record<string, ClientColumnKey> = {
  '회사명': 'company',
  '업체명': 'company',
  '거래처명': 'company',
  '상호': 'company',
  '상호명': 'company',
  'company': 'company',
  'companyname': 'company',

  '담당자': 'contactName',
  '담당자명': 'contactName',
  '이름': 'name',
  '성명': 'name',
  '고객명': 'name',
  'name': 'name',
  'contact': 'contactName',
  'contactname': 'contactName',

  '이메일': 'email',
  'email': 'email',
  'e-mail': 'email',
  'mail': 'email',

  '전화번호': 'phone',
  '연락처': 'phone',
  '휴대폰': 'phone',
  '휴대전화': 'phone',
  '핸드폰': 'phone',
  'phone': 'phone',
  'tel': 'phone',
  'mobile': 'phone',

  '사업자번호': 'businessNumber',
  '사업자등록번호': 'businessNumber',
  'businessnumber': 'businessNumber',
  'brn': 'businessNumber',

  '주소': 'address',
  'address': 'address',

  '비고': 'memo',
  '메모': 'memo',
  'memo': 'memo',
  'note': 'memo',
  'notes': 'memo',
};

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/\s+/g, '');
}

export function autoMapHeaders(headers: string[]): Record<string, ClientColumnKey | ''> {
  const mapping: Record<string, ClientColumnKey | ''> = {};
  for (const header of headers) {
    const normalized = normalizeHeader(header);
    mapping[header] = HEADER_ALIASES[normalized] || '';
  }
  return mapping;
}

export interface ParsedFile {
  headers: string[];
  rows: Record<string, string>[];
}

export async function parseImportFile(file: File): Promise<ParsedFile> {
  const lowerName = file.name.toLowerCase();
  if (lowerName.endsWith('.csv')) {
    return parseCSV(file);
  }
  if (lowerName.endsWith('.xlsx')) {
    return parseXLSX(file);
  }
  throw new Error('.xlsx 또는 .csv 파일만 업로드할 수 있어요.');
}

function parseCSV(file: File): Promise<ParsedFile> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
      complete: (result) => {
        const headers = (result.meta.fields || []).map((h) => h.trim());
        const rows = (result.data as Record<string, string>[]).map((row) => {
          const clean: Record<string, string> = {};
          for (const h of headers) clean[h] = (row[h] ?? '').toString().trim();
          return clean;
        });
        resolve({ headers, rows });
      },
      error: (err: Error) => reject(err),
    });
  });
}

async function parseXLSX(file: File): Promise<ParsedFile> {
  const buffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const sheet = workbook.worksheets[0];
  if (!sheet) return { headers: [], rows: [] };

  const headerRow = sheet.getRow(1);
  const headers: string[] = [];
  headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
    headers[colNumber - 1] = String(cell.value ?? '').trim();
  });

  const rows: Record<string, string>[] = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const record: Record<string, string> = {};
    let hasContent = false;
    headers.forEach((header, idx) => {
      if (!header) return;
      const cell = row.getCell(idx + 1);
      let value = cell.value;
      if (value && typeof value === 'object' && 'text' in (value as any)) {
        value = (value as any).text;
      }
      if (value && typeof value === 'object' && 'result' in (value as any)) {
        value = (value as any).result;
      }
      const str = value === null || value === undefined ? '' : String(value).trim();
      if (str) hasContent = true;
      record[header] = str;
    });
    if (hasContent) rows.push(record);
  });

  return { headers: headers.filter(Boolean), rows };
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9+\-() ]{7,20}$/;
const BUSINESS_NUMBER_REGEX = /^\d{3}-?\d{2}-?\d{5}$/;

export function buildImportRow(
  rowIndex: number,
  raw: Record<string, string>,
  columnMap: Record<string, ClientColumnKey | ''>
): ImportRow {
  const mapped: ImportRow['mapped'] = { name: '' };
  for (const [header, value] of Object.entries(raw)) {
    const key = columnMap[header];
    if (!key) continue;
    const v = (value || '').trim();
    if (!v) continue;
    (mapped as any)[key] = v;
  }

  const issues: string[] = [];
  const isAllEmpty = Object.values(raw).every((v) => !v || !v.trim());
  if (isAllEmpty) {
    return { rowIndex, raw, mapped: { name: '' }, status: 'excluded', issues: ['빈 행'], action: 'exclude' };
  }

  const displayName = mapped.name || mapped.company || '';
  if (!displayName) {
    issues.push('고객명 또는 회사명이 없습니다.');
  }
  if (mapped.email && !EMAIL_REGEX.test(mapped.email)) {
    issues.push('이메일 형식을 확인해 주세요.');
  }
  if (mapped.phone && !PHONE_REGEX.test(mapped.phone)) {
    issues.push('전화번호 형식을 확인해 주세요.');
  }
  if (mapped.businessNumber && !BUSINESS_NUMBER_REGEX.test(mapped.businessNumber)) {
    issues.push('사업자번호 형식을 확인해 주세요. (10자리)');
  }

  mapped.name = displayName || '(이름 없음)';
  if (mapped.businessNumber) {
    mapped.customerType = '사업자';
  }

  const hasBlockingIssue = !displayName;
  const status: ImportRow['status'] = hasBlockingIssue ? 'excluded' : issues.length > 0 ? 'warning' : 'ok';

  return {
    rowIndex,
    raw,
    mapped,
    status,
    issues,
    action: hasBlockingIssue ? 'exclude' : 'create_new',
  };
}

export function findDuplicateInList(
  existing: Client[],
  candidate: { businessNumber?: string; email?: string; phone?: string; company?: string }
): { client: Client; reason: string } | null {
  if (candidate.businessNumber) {
    const match = existing.find((c) => c.businessNumber && c.businessNumber === candidate.businessNumber);
    if (match) return { client: match, reason: '사업자번호가 동일한 고객이 있어요.' };
  }
  if (candidate.email) {
    const match = existing.find((c) => c.email && c.email.toLowerCase() === candidate.email!.toLowerCase());
    if (match) return { client: match, reason: '이메일이 동일한 고객이 있어요.' };
  }
  if (candidate.phone) {
    const match = existing.find((c) => c.phone && c.phone.replace(/[^0-9]/g, '') === candidate.phone!.replace(/[^0-9]/g, ''));
    if (match) return { client: match, reason: '전화번호가 동일한 고객이 있어요.' };
  }
  if (candidate.company) {
    const match = existing.find((c) => c.company && c.company === candidate.company);
    if (match) return { client: match, reason: '회사명이 동일한 고객이 있어요.' };
  }
  return null;
}

export function findDuplicateWithinBatch(
  rows: ImportRow[],
  currentIndex: number
): boolean {
  const current = rows[currentIndex];
  for (let i = 0; i < currentIndex; i++) {
    const other = rows[i];
    if (other.status === 'excluded') continue;
    const sameBiz =
      current.mapped.businessNumber && current.mapped.businessNumber === other.mapped.businessNumber;
    const sameEmail =
      current.mapped.email &&
      other.mapped.email &&
      current.mapped.email.toLowerCase() === other.mapped.email.toLowerCase();
    const samePhone =
      current.mapped.phone &&
      other.mapped.phone &&
      current.mapped.phone.replace(/[^0-9]/g, '') === other.mapped.phone.replace(/[^0-9]/g, '');
    if (sameBiz || sameEmail || samePhone) return true;
  }
  return false;
}

export function downloadCSVTemplate() {
  const headers = ['회사명', '담당자', '이메일', '전화번호', '사업자번호', '주소', '비고'];
  const sample = [
    ['스타트업코리아', '김철수', 'demo@example.com', '010-1234-5678', '123-45-67890', '서울특별시 강남구 테헤란로 123', 'VIP 고객'],
    ['', '이영희', 'lee@example.com', '010-9876-5432', '', '', ''],
  ];
  const csv = [headers, ...sample]
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
    .join('\r\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = '고객_일괄등록_양식.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
