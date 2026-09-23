import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { createFeedback, getUserById } from '@/lib/db';
import {
  FeedbackType,
  FEATURE_REQUEST_CATEGORIES,
  SUPPORT_ISSUE_CATEGORIES,
} from '@/lib/types';

const CONTENT_LIMITS: Record<FeedbackType, { min: number; max: number }> = {
  feature_request: { min: 10, max: 2000 },
  support_issue: { min: 10, max: 3000 },
};
const TITLE_MAX = 100;

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const type: FeedbackType = body.type;
    const category = typeof body.category === 'string' ? body.category.trim() : '';
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const content = typeof body.content === 'string' ? body.content.trim() : '';
    // 접수 당시 페이지 경로는 컨텍스트 정보일 뿐이라 클라이언트 값을 그대로
    // 써도 되지만(회원 정보처럼 신뢰 판단에 쓰이지 않음), 형식은 검증한다.
    const pagePath =
      typeof body.pagePath === 'string' && body.pagePath.startsWith('/') ? body.pagePath.slice(0, 200) : undefined;

    if (type !== 'feature_request' && type !== 'support_issue') {
      return NextResponse.json({ error: '접수 유형이 올바르지 않습니다.' }, { status: 400 });
    }

    const validCategories: readonly string[] =
      type === 'feature_request' ? FEATURE_REQUEST_CATEGORIES : SUPPORT_ISSUE_CATEGORIES;
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: '유형을 선택해주세요.' }, { status: 400 });
    }

    if (type === 'support_issue') {
      if (!title) {
        return NextResponse.json({ error: '제목을 입력해주세요.' }, { status: 400 });
      }
      if (title.length > TITLE_MAX) {
        return NextResponse.json({ error: `제목은 ${TITLE_MAX}자 이하로 입력해주세요.` }, { status: 400 });
      }
    }

    const { min, max } = CONTENT_LIMITS[type];
    if (content.length < min || content.length > max) {
      return NextResponse.json(
        { error: `내용은 ${min}~${max}자 사이로 입력해주세요.` },
        { status: 400 }
      );
    }

    // 회원 ID/이름/이메일은 요청 본문을 신뢰하지 않고 서버 세션에서 조회한다.
    const user = await getUserById(session.userId);
    if (!user) {
      return NextResponse.json({ error: '사용자 정보를 확인할 수 없습니다.' }, { status: 401 });
    }

    const feedback = await createFeedback({
      type,
      category,
      title: type === 'support_issue' ? title : undefined,
      content,
      userId: user.id,
      userName: user.displayName,
      userEmail: user.email,
      pagePath,
    });

    return NextResponse.json(feedback);
  } catch (error) {
    console.error('Feedback submission error:', error);
    return NextResponse.json({ error: '접수하지 못했어요. 내용을 유지했으니 다시 시도해주세요.' }, { status: 500 });
  }
}
