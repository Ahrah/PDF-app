import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { listFeedback, countNewFeedback } from '@/lib/db';
import { FeedbackStatus, FeedbackType } from '@/lib/types';

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const typeParam = searchParams.get('type');
    const statusParam = searchParams.get('status');
    const search = searchParams.get('search') || undefined;

    const type: FeedbackType | undefined =
      typeParam === 'feature_request' || typeParam === 'support_issue' ? typeParam : undefined;
    const status: FeedbackStatus | undefined =
      statusParam === 'new' || statusParam === 'in_review' || statusParam === 'done' ? statusParam : undefined;

    const [items, newCount] = await Promise.all([
      listFeedback({ type, status, search }),
      countNewFeedback(),
    ]);

    return NextResponse.json({ items, newCount });
  } catch (error) {
    console.error('Admin feedback list error:', error);
    return NextResponse.json({ error: '접수 목록을 불러오지 못했습니다.' }, { status: 500 });
  }
}
