import { NextResponse } from 'next/server';
import { checkQuota, recordDownload, getQuotaUsage } from '@/lib/quota';

export async function GET() {
  try {
    const usage = await getQuotaUsage();
    return NextResponse.json(usage);
  } catch (error) {
    console.error('Failed to get quota:', error);
    return NextResponse.json(
      { error: 'Failed to get quota' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { dealId, type } = await request.json();
    
    if (!dealId || !type) {
      return NextResponse.json(
        { error: 'Missing dealId or type' },
        { status: 400 }
      );
    }
    
    // Check quota first
    const quotaCheck = await checkQuota();
    if (!quotaCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: '무료 한도를 초과했습니다.',
          count: quotaCheck.count,
          limit: quotaCheck.limit,
        },
        { status: 403 }
      );
    }
    
    // Record download
    const result = await recordDownload(dealId, type);
    
    return NextResponse.json({
      success: result.success,
      count: result.count,
      limit: 3,
    });
  } catch (error) {
    console.error('Failed to record download:', error);
    return NextResponse.json(
      { error: 'Failed to record download' },
      { status: 500 }
    );
  }
}
