import { NextResponse } from 'next/server';
import { getSettings, getMonthlyUsage } from '@/lib/db';

export async function GET() {
  try {
    const settings = await getSettings();
    const usage = await getMonthlyUsage();
    return NextResponse.json({ settings, usage });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}
