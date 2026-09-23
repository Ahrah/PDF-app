import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { updateFeedbackStatus } from '@/lib/db';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
  }

  try {
    const { id } = await context.params;
    const body = await request.json();
    const status = body.status;

    if (status !== 'new' && status !== 'in_review' && status !== 'done') {
      return NextResponse.json({ error: '상태 값이 올바르지 않습니다.' }, { status: 400 });
    }

    const updated = await updateFeedbackStatus(id, status);
    if (!updated) {
      return NextResponse.json({ error: '접수 건을 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Admin feedback status update error:', error);
    return NextResponse.json({ error: '상태를 변경하지 못했습니다.' }, { status: 500 });
  }
}
