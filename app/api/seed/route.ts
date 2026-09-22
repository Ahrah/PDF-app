import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { createClient, createDeal, updateSeller, getClients, getDeals, deleteClient, deleteDeal } from '@/lib/db';

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  try {
    const { action } = await request.json();

    if (action === 'reset') {
      const [clients, deals] = await Promise.all([getClients(session.userId), getDeals(session.userId)]);
      await Promise.all(deals.map((d) => deleteDeal(session.userId, d.id)));
      await Promise.all(clients.map((c) => deleteClient(session.userId, c.id)));
      return NextResponse.json({ success: true, message: '데모 데이터가 초기화되었습니다.' });
    }

    if (action === 'seed') {
      const today = new Date().toISOString().split('T')[0];
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const dueDate = nextMonth.toISOString().split('T')[0];

      const client = await createClient(session.userId, {
        customerType: '사업자',
        name: '김철수',
        company: '스타트업코리아',
        email: 'demo@example.com',
        phone: '010-1234-5678',
      });

      await createDeal(session.userId, {
        clientId: client.id,
        type: 'quote',
        status: '초안',
        issueDate: today,
        validUntil: dueDate,
        lineItems: [
          { id: '1', name: '웹사이트 리뉴얼 디자인', quantity: 1, unitPrice: 3000000 },
          { id: '2', name: '반응형 웹 개발', quantity: 1, unitPrice: 5000000 },
        ],
        discount: 0,
        vatMode: '별도',
        memo: '프로젝트 일정: 4주 소요 예정\n1차 시안 제출 후 2회 수정 가능',
        totalAmount: 8800000,
      });

      await updateSeller(session.userId, {
        name: '홍길동',
        businessName: '(데모) 디자인스튜디오',
        email: 'seller@example.com',
        phone: '010-9876-5432',
        bankAccount: '카카오뱅크 3333-01-1234567',
        businessNumber: '1234567890',
        address: '서울특별시 강남구 테헤란로 123',
      });

      return NextResponse.json({ success: true, message: '데모 데이터가 생성되었습니다.' });
    }

    return NextResponse.json({ success: false, message: '잘못된 요청입니다.' }, { status: 400 });
  } catch (error) {
    console.error('Seed operation failed:', error);
    return NextResponse.json({ success: false, message: '데이터 작업 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
