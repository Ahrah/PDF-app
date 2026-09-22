import { promises as fs } from 'fs';
import path from 'path';

// Per-user PDF download quota now lives in lib/db.ts (app_users.monthly_deal_count),
// scoped by session and enforced from /api/quota. This file only keeps the
// pre-launch waitlist capture, which has no per-user scoping requirement.

interface WaitlistEntry {
  email: string;
  timestamp: string;
}

const QUOTA_DIR = path.join(process.cwd(), 'data');
const WAITLIST_FILE = path.join(QUOTA_DIR, 'waitlist.json');

async function ensureDataDir() {
  try {
    await fs.mkdir(QUOTA_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create data directory:', error);
  }
}

export async function addToWaitlist(email: string): Promise<{ success: boolean; message: string }> {
  try {
    await ensureDataDir();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, message: '유효한 이메일 주소를 입력해주세요.' };
    }

    let waitlist: WaitlistEntry[] = [];
    try {
      const data = await fs.readFile(WAITLIST_FILE, 'utf-8');
      waitlist = JSON.parse(data);
    } catch (error) {
      // File doesn't exist yet
    }

    if (waitlist.some(entry => entry.email === email)) {
      return { success: true, message: '이미 등록된 이메일입니다.' };
    }

    waitlist.push({
      email,
      timestamp: new Date().toISOString(),
    });

    await fs.writeFile(WAITLIST_FILE, JSON.stringify(waitlist, null, 2), 'utf-8');

    return { success: true, message: '출시 알림 신청이 완료되었습니다.' };
  } catch (error) {
    console.error('Failed to add to waitlist:', error);
    return { success: false, message: '오류가 발생했습니다. 다시 시도해주세요.' };
  }
}

export async function getWaitlist(): Promise<WaitlistEntry[]> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(WAITLIST_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}
