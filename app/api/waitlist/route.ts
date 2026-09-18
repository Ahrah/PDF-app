import { NextResponse } from 'next/server';
import { addToWaitlist, getWaitlist } from '@/lib/quota';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: '이메일을 입력해주세요.' },
        { status: 400 }
      );
    }
    
    const result = await addToWaitlist(email);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error('Failed to add to waitlist:', error);
    return NextResponse.json(
      { error: '오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const waitlist = await getWaitlist();
    return NextResponse.json({ waitlist });
  } catch (error) {
    console.error('Failed to get waitlist:', error);
    return NextResponse.json(
      { error: 'Failed to get waitlist' },
      { status: 500 }
    );
  }
}
