import { NextResponse } from 'next/server';
import { getClientIp } from '@/lib/auth';
import { hasUsedGuestQuote, recordGuestQuoteUsage } from '@/lib/db';

// No document content ever reaches this route — it only checks/records
// "has this IP used its one guest quote yet", never the quote's content.
// This is a usage-gate, not a document API: PDF generation happens
// entirely client-side (same generatePDF() the authenticated flow uses),
// so there's nothing here for an unauthenticated caller to fetch/forge
// beyond a yes/no.

export async function GET(request: Request) {
  const ip = getClientIp(request);
  if (!ip) {
    // Can't identify a caller (e.g. local dev with no proxy) — fail open
    // rather than blocking every guest outright.
    return NextResponse.json({ allowed: true });
  }
  try {
    const used = await hasUsedGuestQuote(ip);
    return NextResponse.json({ allowed: !used });
  } catch (error) {
    console.error('Guest quota check error:', error);
    return NextResponse.json({ error: '확인하지 못했습니다.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!ip) {
    return NextResponse.json({ allowed: true });
  }
  try {
    if (await hasUsedGuestQuote(ip)) {
      return NextResponse.json({ allowed: false }, { status: 403 });
    }
    await recordGuestQuoteUsage(ip);
    return NextResponse.json({ allowed: true });
  } catch (error) {
    console.error('Guest quota record error:', error);
    return NextResponse.json({ error: '처리하지 못했습니다. 다시 시도해주세요.' }, { status: 500 });
  }
}
