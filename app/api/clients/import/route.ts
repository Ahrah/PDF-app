import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { createClient, updateClient, getClient } from '@/lib/db';
import { CustomerType } from '@/lib/types';

const MAX_ROWS = 1000;

interface ImportRowPayload {
  mapped: {
    customerType?: CustomerType;
    name?: string;
    company?: string;
    contactName?: string;
    email?: string;
    phone?: string;
    businessNumber?: string;
    address?: string;
    memo?: string;
  };
  action: 'keep_existing' | 'create_new' | 'update_existing' | 'exclude';
  duplicateOfClientId?: string;
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  let body: { rows?: ImportRowPayload[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '잘못된 요청 형식입니다.' }, { status: 400 });
  }

  const rows = Array.isArray(body.rows) ? body.rows : [];
  if (rows.length === 0) {
    return NextResponse.json({ error: '등록할 고객이 없습니다.' }, { status: 400 });
  }
  if (rows.length > MAX_ROWS) {
    return NextResponse.json({ error: `한 번에 최대 ${MAX_ROWS}명까지 등록할 수 있어요.` }, { status: 400 });
  }

  let created = 0;
  let updated = 0;
  let excluded = 0;
  let failed = 0;
  const errors: { rowIndex: number; message: string }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    try {
      if (row.action === 'exclude' || row.action === 'keep_existing') {
        excluded++;
        continue;
      }

      // Strip formula-injection triggers (=, +, -, @, tab, CR) from any
      // exported/re-displayed text field — this data may later be re-exported.
      const sanitize = (v?: string) => {
        if (!v) return v;
        const trimmed = v.trim();
        return /^[=+\-@\t\r]/.test(trimmed) ? `'${trimmed}` : trimmed;
      };

      const name = sanitize(row.mapped.name || row.mapped.company || '');
      if (!name) {
        failed++;
        errors.push({ rowIndex: i, message: '고객명 또는 회사명이 없습니다.' });
        continue;
      }

      const clientInput = {
        customerType: row.mapped.customerType || '개인',
        name,
        company: sanitize(row.mapped.company),
        contactName: sanitize(row.mapped.contactName),
        email: sanitize(row.mapped.email),
        phone: sanitize(row.mapped.phone),
        businessNumber: sanitize(row.mapped.businessNumber),
        address: sanitize(row.mapped.address),
        memo: sanitize(row.mapped.memo),
      };

      if (row.action === 'update_existing' && row.duplicateOfClientId) {
        // Ownership check: the target client must belong to this user.
        const existing = await getClient(session.userId, row.duplicateOfClientId);
        if (!existing) {
          failed++;
          errors.push({ rowIndex: i, message: '수정할 기존 고객을 찾을 수 없습니다.' });
          continue;
        }
        await updateClient(session.userId, row.duplicateOfClientId, clientInput);
        updated++;
      } else {
        await createClient(session.userId, clientInput);
        created++;
      }
    } catch (error) {
      failed++;
      errors.push({
        rowIndex: i,
        message: error instanceof Error ? error.message : '등록 중 오류가 발생했습니다.',
      });
    }
  }

  return NextResponse.json({
    total: rows.length,
    created,
    updated,
    excluded,
    failed,
    errors,
  });
}
