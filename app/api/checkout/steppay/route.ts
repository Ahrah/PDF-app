import { NextRequest, NextResponse } from 'next/server';
import {
  STEPPAY_PRODUCT_CODE,
  STEPPAY_PRICE_CODE,
  findOrCreateStepPayCustomer,
  createStepPayOrder,
  buildStepPayPaymentUrl,
} from '@/lib/steppay';

export async function POST(request: NextRequest) {
  const secretToken = process.env.STEPPAY_SECRET_TOKEN;
  
  if (!secretToken) {
    return NextResponse.json(
      { error: 'StepPay API is not configured' },
      { status: 503 }
    );
  }

  let body: { email: string; name?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }

  const email = String(body.email || '').trim();
  if (!email) {
    return NextResponse.json(
      { error: 'Email is required' },
      { status: 400 }
    );
  }

  const name = String(body.name || email.split('@')[0] || '고객').trim();

  const productCode = process.env.STEPPAY_PRODUCT_CODE || STEPPAY_PRODUCT_CODE;
  const priceCode = process.env.STEPPAY_PRICE_CODE || STEPPAY_PRICE_CODE;

  try {
    const customer = await findOrCreateStepPayCustomer(email, name, secretToken);
    
    const order = await createStepPayOrder(
      customer.id,
      productCode,
      priceCode,
      secretToken
    );

    const origin = request.nextUrl.origin;
    const paymentUrl = buildStepPayPaymentUrl(
      order.orderCode,
      `${origin}/billing/success?orderCode=${order.orderCode}`,
      `${origin}/billing/fail?orderCode=${order.orderCode}`,
      `${origin}/billing/cancel`
    );

    return NextResponse.json({
      success: true,
      paymentUrl,
      orderCode: order.orderCode,
    });
  } catch (error: unknown) {
    console.error('StepPay checkout error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { 
        error: 'Failed to create payment',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
