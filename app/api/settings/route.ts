import { NextResponse } from 'next/server';
import { getSettings, getMonthlyUsage, isUserPremium, getUserById } from '@/lib/db';
import { getSession, isTrialActive, getRemainingTrialDays } from '@/lib/auth';

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({
      settings: { isPremium: false, monthlyDealCount: 0, currentMonth: new Date().toISOString().slice(0, 7) },
      usage: { month: new Date().toISOString().slice(0, 7), dealCount: 0, dealIds: [] },
      trialInfo: null,
    });
  }

  try {
    const settings = await getSettings(session.userId);
    const usage = await getMonthlyUsage(session.userId);
    const userPremium = await isUserPremium(session.userId);
    const user = await getUserById(session.userId);

    let trialInfo = null;
    if (user) {
      const trialActive = isTrialActive(user.trialEndsAt);
      trialInfo = {
        trialEndsAt: user.trialEndsAt,
        trialActive,
        remainingDays: getRemainingTrialDays(user.trialEndsAt),
      };
    }

    return NextResponse.json({
      settings: {
        ...settings,
        isPremium: settings.isPremium || userPremium,
      },
      usage,
      trialInfo,
    });
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    return NextResponse.json({ error: '설정을 불러오지 못했습니다.' }, { status: 500 });
  }
}
