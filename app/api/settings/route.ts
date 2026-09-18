import { NextResponse } from 'next/server';
import { getSettings, getMonthlyUsage, isUserPremium } from '@/lib/db';
import { getSession, isTrialActive, getRemainingTrialDays } from '@/lib/auth';

export async function GET() {
  try {
    const settings = await getSettings();
    const usage = await getMonthlyUsage();
    const session = await getSession();
    
    let effectiveIsPremium = settings.isPremium;
    let trialInfo = null;
    
    if (session) {
      const userPremium = await isUserPremium(session.userId);
      effectiveIsPremium = effectiveIsPremium || userPremium;
      
      const user = await (async () => {
        const { getUserById } = await import('@/lib/db');
        return getUserById(session.userId);
      })();
      
      if (user) {
        const trialActive = isTrialActive(user.trialEndsAt);
        trialInfo = {
          trialEndsAt: user.trialEndsAt,
          trialActive,
          remainingDays: getRemainingTrialDays(user.trialEndsAt),
        };
      }
    }
    
    return NextResponse.json({ 
      settings: {
        ...settings,
        isPremium: effectiveIsPremium,
      },
      usage,
      trialInfo,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}
