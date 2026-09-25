import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { canDownloadPDF, getDeal, updateDeal, getSettings, incrementDealCount } from '@/lib/db';
import { PRICING } from '@/lib/pricing';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ month: new Date().toISOString().slice(0, 7), count: 0, limit: PRICING.FREE_TIER_MONTHLY_LIMIT });
  }
  try {
    const settings = await getSettings(session.userId);
    const { limit } = await canDownloadPDF(session.userId);
    return NextResponse.json({
      month: settings.currentMonth,
      count: settings.monthlyDealCount,
      limit,
    });
  } catch (error) {
    console.error('Failed to get quota:', error);
    return NextResponse.json({ error: '사용량을 불러오지 못했습니다.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }
  try {
    const { dealId } = await request.json();
    if (!dealId) {
      return NextResponse.json({ error: 'dealId가 필요합니다.' }, { status: 400 });
    }

    const deal = await getDeal(session.userId, dealId);
    if (!deal) {
      return NextResponse.json({ error: '거래를 찾을 수 없습니다.' }, { status: 404 });
    }

    // Idempotent: a quote and its converted invoice are the same transaction,
    // and re-downloading the same document never re-counts.
    if (deal.pdfDownloaded) {
      const settings = await getSettings(session.userId);
      const { limit } = await canDownloadPDF(session.userId);
      return NextResponse.json({ success: true, count: settings.monthlyDealCount, limit });
    }

    const quota = await canDownloadPDF(session.userId);
    if (!quota.allowed) {
      return NextResponse.json(
        { success: false, message: '무료 한도를 초과했습니다.', count: quota.count, limit: quota.limit },
        { status: 403 }
      );
    }

    await updateDeal(session.userId, dealId, { pdfDownloaded: true });
    await incrementDealCount(session.userId);
    const settings = await getSettings(session.userId);

    return NextResponse.json({ success: true, count: settings.monthlyDealCount, limit: quota.limit });
  } catch (error) {
    console.error('Failed to record download:', error);
    return NextResponse.json({ error: '사용량 처리에 실패했습니다.' }, { status: 500 });
  }
}
