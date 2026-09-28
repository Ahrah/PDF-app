import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { hasProcessedHubEvent, markHubEventProcessed, setPremiumUntil, getUserById } from '@/lib/db';

// 취미상점 결제 허브가 결제 확정 시 호출하는 권한부여 수신 API.
// 클라이언트는 이 라우트에 접근할 방법이 없다 — plan은 오직 이 서버 간 호출로만 바뀐다.

interface EntitlementTokenPayload {
  eventId: string;
  appId: string;
  externalUserId: string;
  action: { type: string; [key: string]: unknown };
}

function getHubSecret(): Uint8Array {
  const secret = process.env.HUB_AUTH_SECRET;
  if (!secret) throw new Error('HUB_AUTH_SECRET 환경 변수가 설정되지 않았습니다.');
  return new TextEncoder().encode(secret);
}

export async function POST(request: Request) {
  const auth = request.headers.get('authorization');
  const token = auth?.startsWith('Bearer ') ? auth.slice('Bearer '.length) : null;
  if (!token) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  let payload: EntitlementTokenPayload;
  try {
    const verified = await jwtVerify(token, getHubSecret());
    payload = verified.payload as unknown as EntitlementTokenPayload;
  } catch {
    return NextResponse.json({ error: '유효하지 않은 요청입니다.' }, { status: 401 });
  }

  if (payload.appId !== 'quote' || !payload.eventId || !payload.externalUserId || !payload.action) {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 });
  }

  // 같은 이벤트가 재시도로 다시 와도 한 번만 반영한다.
  if (await hasProcessedHubEvent(payload.eventId)) {
    return NextResponse.json({ ok: true, alreadyProcessed: true });
  }

  const user = await getUserById(payload.externalUserId);
  if (!user) {
    return NextResponse.json({ error: '존재하지 않는 사용자입니다.' }, { status: 400 });
  }

  switch (payload.action.type) {
    case 'set_premium': {
      const until = payload.action.until;
      if (typeof until !== 'string') {
        return NextResponse.json({ error: 'until 값이 필요합니다.' }, { status: 400 });
      }
      await setPremiumUntil(user.id, until);
      break;
    }
    default:
      // 견적함이 모르는 action 타입 — 조용히 무시하되 이벤트는 처리된 것으로 기록한다
      // (허브가 계속 재시도하며 쌓이는 걸 막기 위함).
      console.warn('Unknown hub entitlement action type:', payload.action.type);
  }

  await markHubEventProcessed(payload.eventId);
  return NextResponse.json({ ok: true });
}
