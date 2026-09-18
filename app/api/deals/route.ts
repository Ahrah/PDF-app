import { NextResponse } from 'next/server';
import { getDeals, createDeal } from '@/lib/db';

export async function GET() {
  try {
    const deals = await getDeals();
    return NextResponse.json(deals);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch deals' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const deal = await createDeal(body);
    return NextResponse.json(deal);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create deal' }, { status: 500 });
  }
}
