import { NextResponse } from 'next/server';
import { getSeller, updateSeller } from '@/lib/db';

export async function GET() {
  try {
    const seller = await getSeller();
    return NextResponse.json(seller);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch seller' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const seller = await updateSeller(body);
    return NextResponse.json(seller);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update seller' }, { status: 500 });
  }
}
