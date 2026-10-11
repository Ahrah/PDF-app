import { NextRequest, NextResponse } from 'next/server';
import { getStepPayOrder } from '@/lib/steppay';

export async function GET(request: NextRequest) {
  const secretToken = process.env.STEPPAY_SECRET_TOKEN;
  
  if (!secretToken) {
    return NextResponse.json(
      { error: 'StepPay API is not configured', verified: false },
      { status: 503 }
    );
  }

  const orderCode = request.nextUrl.searchParams.get('orderCode');
  
  if (!orderCode) {
    return NextResponse.json(
      { error: 'Order code is required', verified: false },
      { status: 400 }
    );
  }

  try {
    const order = await getStepPayOrder(orderCode, secretToken);
    
    const verified = !!order.paymentDate;
    
    return NextResponse.json({
      verified,
      orderCode: order.orderCode,
      paymentDate: order.paymentDate,
    });
  } catch (error: unknown) {
    console.error('Payment verification error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { 
        error: 'Failed to verify payment',
        verified: false,
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
