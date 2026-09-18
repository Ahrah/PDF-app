import { promises as fs } from 'fs';
import path from 'path';

// Simple server-side quota tracking
// For production: use Vercel KV/Blob or external DB
// For MVP: file-based with idempotent tracking

interface QuotaRecord {
  month: string;
  count: number;
  downloads: Set<string>; // dealId_type to track unique downloads
}

interface WaitlistEntry {
  email: string;
  timestamp: string;
}

const QUOTA_DIR = path.join(process.cwd(), 'data');
const QUOTA_FILE = path.join(QUOTA_DIR, 'quota.json');
const WAITLIST_FILE = path.join(QUOTA_DIR, 'waitlist.json');

async function ensureDataDir() {
  try {
    await fs.mkdir(QUOTA_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create data directory:', error);
  }
}

function getCurrentMonth(): string {
  return new Date().toISOString().slice(0, 7); // YYYY-MM
}

async function readQuota(): Promise<QuotaRecord> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(QUOTA_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    // Convert array back to Set
    parsed.downloads = new Set(parsed.downloads || []);
    return parsed;
  } catch (error) {
    return {
      month: getCurrentMonth(),
      count: 0,
      downloads: new Set(),
    };
  }
}

async function writeQuota(quota: QuotaRecord): Promise<void> {
  await ensureDataDir();
  // Convert Set to array for JSON serialization
  const toSave = {
    ...quota,
    downloads: Array.from(quota.downloads),
  };
  await fs.writeFile(QUOTA_FILE, JSON.stringify(toSave, null, 2), 'utf-8');
}

export async function checkQuota(): Promise<{
  allowed: boolean;
  count: number;
  limit: number;
}> {
  let quota = await readQuota();
  const currentMonth = getCurrentMonth();
  
  // Reset if new month
  if (quota.month !== currentMonth) {
    quota = {
      month: currentMonth,
      count: 0,
      downloads: new Set(),
    };
    await writeQuota(quota);
  }
  
  const limit = 3;
  return {
    allowed: quota.count < limit,
    count: quota.count,
    limit,
  };
}

export async function recordDownload(
  dealId: string,
  type: 'quote' | 'invoice'
): Promise<{ success: boolean; count: number }> {
  let quota = await readQuota();
  const currentMonth = getCurrentMonth();
  
  // Reset if new month
  if (quota.month !== currentMonth) {
    quota = {
      month: currentMonth,
      count: 0,
      downloads: new Set(),
    };
  }
  
  // Create unique identifier for this download
  // One deal = quote + invoice counted as ONE
  // So we track by dealId only, not by type
  const downloadId = dealId;
  
  // Check if already downloaded (idempotent)
  if (quota.downloads.has(downloadId)) {
    return { success: true, count: quota.count };
  }
  
  // Check quota
  if (quota.count >= 3) {
    return { success: false, count: quota.count };
  }
  
  // Record download
  quota.downloads.add(downloadId);
  quota.count = quota.downloads.size;
  await writeQuota(quota);
  
  return { success: true, count: quota.count };
}

export async function getQuotaUsage(): Promise<{
  month: string;
  count: number;
  limit: number;
}> {
  let quota = await readQuota();
  const currentMonth = getCurrentMonth();
  
  if (quota.month !== currentMonth) {
    quota = {
      month: currentMonth,
      count: 0,
      downloads: new Set(),
    };
  }
  
  return {
    month: quota.month,
    count: quota.count,
    limit: 3,
  };
}

// Waitlist management
export async function addToWaitlist(email: string): Promise<{ success: boolean; message: string }> {
  try {
    await ensureDataDir();
    
    // Validate email
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
    
    // Check if already on waitlist
    if (waitlist.some(entry => entry.email === email)) {
      return { success: true, message: '이미 등록된 이메일입니다.' };
    }
    
    // Add to waitlist
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
