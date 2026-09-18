import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { AppData } from '@/lib/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'db.json');

export async function POST(request: Request) {
  try {
    const { action } = await request.json();
    
    if (action === 'reset') {
      await fs.mkdir(DATA_DIR, { recursive: true });
      
      const emptyData: AppData = {
        clients: [],
        deals: [],
        seller: null,
        settings: {
          isPremium: false,
          monthlyDealCount: 0,
          currentMonth: new Date().toISOString().slice(0, 7),
        },
      };
      
      await fs.writeFile(DATA_FILE, JSON.stringify(emptyData, null, 2), 'utf-8');
      
      return NextResponse.json({ success: true, message: '데모 데이터가 초기화되었습니다.' });
    }
    
    if (action === 'seed') {
      await fs.mkdir(DATA_DIR, { recursive: true });
      
      const today = new Date().toISOString().split('T')[0];
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const dueDate = nextMonth.toISOString().split('T')[0];
      
      const demoData: AppData = {
        clients: [
          {
            id: 'demo-client-1',
            name: '김철수',
            company: '스타트업코리아',
            email: 'demo@example.com',
            phone: '010-1234-5678',
            createdAt: new Date().toISOString(),
          },
        ],
        deals: [
          {
            id: 'demo-deal-1',
            clientId: 'demo-client-1',
            type: 'quote',
            status: '초안',
            issueDate: today,
            validUntil: dueDate,
            lineItems: [
              {
                id: '1',
                name: '웹사이트 리뉴얼 디자인',
                quantity: 1,
                unitPrice: 3000000,
              },
              {
                id: '2',
                name: '반응형 웹 개발',
                quantity: 1,
                unitPrice: 5000000,
              },
            ],
            discount: 0,
            vatMode: '별도',
            memo: '프로젝트 일정: 4주 소요 예정\n1차 시안 제출 후 2회 수정 가능',
            totalAmount: 8800000,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        seller: {
          name: '홍길동',
          businessName: '(데모) 디자인스튜디오',
          email: 'seller@example.com',
          phone: '010-9876-5432',
          bankAccount: '카카오뱅크 3333-01-1234567',
          businessNumber: '123-45-67890',
          address: '서울특별시 강남구 테헤란로 123',
        },
        settings: {
          isPremium: false,
          monthlyDealCount: 0,
          currentMonth: new Date().toISOString().slice(0, 7),
        },
      };
      
      await fs.writeFile(DATA_FILE, JSON.stringify(demoData, null, 2), 'utf-8');
      
      return NextResponse.json({ success: true, message: '데모 데이터가 생성되었습니다.' });
    }
    
    return NextResponse.json({ success: false, message: '잘못된 요청입니다.' }, { status: 400 });
  } catch (error) {
    console.error('Seed operation failed:', error);
    return NextResponse.json(
      { success: false, message: '데이터 작업 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
