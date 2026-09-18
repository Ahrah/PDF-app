import { promises as fs } from 'fs';
import path from 'path';
import { AppData, Client, Deal, SellerInfo, MonthlyUsage, User } from './types';

const DATA_DIR = process.env.VERCEL 
  ? '/tmp' 
  : path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'gyunjukham-db.json');

const defaultData: AppData = {
  clients: [],
  deals: [],
  seller: null,
  settings: {
    isPremium: false,
    monthlyDealCount: 0,
    currentMonth: new Date().toISOString().slice(0, 7),
  },
  users: [],
};

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create data directory:', error);
  }
}

async function readData(): Promise<AppData> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return defaultData;
  }
}

async function writeData(data: AppData): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function getCurrentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

function resetMonthlyCountIfNeeded(data: AppData): AppData {
  const currentMonth = getCurrentMonth();
  if (data.settings.currentMonth !== currentMonth) {
    return {
      ...data,
      settings: {
        ...data.settings,
        monthlyDealCount: 0,
        currentMonth,
      },
    };
  }
  return data;
}

export async function getClients(): Promise<Client[]> {
  const data = await readData();
  return data.clients;
}

export async function getClient(id: string): Promise<Client | null> {
  const data = await readData();
  return data.clients.find(c => c.id === id) || null;
}

export async function createClient(client: Omit<Client, 'id' | 'createdAt'>): Promise<Client> {
  const data = await readData();
  const newClient: Client = {
    ...client,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  data.clients.push(newClient);
  await writeData(data);
  return newClient;
}

export async function updateClient(id: string, updates: Partial<Client>): Promise<Client | null> {
  const data = await readData();
  const index = data.clients.findIndex(c => c.id === id);
  if (index === -1) return null;
  
  data.clients[index] = { ...data.clients[index], ...updates };
  await writeData(data);
  return data.clients[index];
}

export async function deleteClient(id: string): Promise<boolean> {
  const data = await readData();
  const initialLength = data.clients.length;
  data.clients = data.clients.filter(c => c.id !== id);
  data.deals = data.deals.filter(d => d.clientId !== id);
  await writeData(data);
  return data.clients.length < initialLength;
}

export async function getDeals(): Promise<Deal[]> {
  const data = await readData();
  return data.deals;
}

export async function getDeal(id: string): Promise<Deal | null> {
  const data = await readData();
  return data.deals.find(d => d.id === id) || null;
}

export async function createDeal(deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Deal> {
  let data = await readData();
  data = resetMonthlyCountIfNeeded(data);
  
  const newDeal: Deal = {
    ...deal,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  data.deals.push(newDeal);
  await writeData(data);
  return newDeal;
}

export async function updateDeal(id: string, updates: Partial<Deal>): Promise<Deal | null> {
  const data = await readData();
  const index = data.deals.findIndex(d => d.id === id);
  if (index === -1) return null;
  
  data.deals[index] = {
    ...data.deals[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  await writeData(data);
  return data.deals[index];
}

export async function deleteDeal(id: string): Promise<boolean> {
  const data = await readData();
  const initialLength = data.deals.length;
  data.deals = data.deals.filter(d => d.id !== id);
  await writeData(data);
  return data.deals.length < initialLength;
}

export async function getSeller(): Promise<SellerInfo | null> {
  const data = await readData();
  return data.seller;
}

export async function updateSeller(seller: SellerInfo): Promise<SellerInfo> {
  const data = await readData();
  data.seller = seller;
  await writeData(data);
  return seller;
}

export async function getSettings() {
  let data = await readData();
  data = resetMonthlyCountIfNeeded(data);
  await writeData(data);
  return data.settings;
}

export async function incrementDealCount(): Promise<void> {
  let data = await readData();
  data = resetMonthlyCountIfNeeded(data);
  data.settings.monthlyDealCount += 1;
  await writeData(data);
}

export async function canDownloadPDF(): Promise<{ allowed: boolean; count: number; limit: number }> {
  const settings = await getSettings();
  const limit = settings.isPremium ? Infinity : 3;
  return {
    allowed: settings.isPremium || settings.monthlyDealCount < limit,
    count: settings.monthlyDealCount,
    limit: settings.isPremium ? 999 : 3,
  };
}

export async function isUserPremium(userId?: string): Promise<boolean> {
  const settings = await getSettings();
  if (settings.isPremium) return true;
  
  if (!userId) return false;
  
  const user = await getUserById(userId);
  if (!user) return false;
  
  const trialActive = new Date(user.trialEndsAt) > new Date();
  return trialActive;
}

export async function getMonthlyUsage(): Promise<MonthlyUsage> {
  const settings = await getSettings();
  const deals = await getDeals();
  const currentMonth = getCurrentMonth();
  
  const monthlyDeals = deals.filter(deal => 
    deal.createdAt.startsWith(currentMonth) && deal.pdfDownloaded
  );
  
  return {
    month: currentMonth,
    dealCount: settings.monthlyDealCount,
    dealIds: monthlyDeals.map(d => d.id),
  };
}

export async function getUsers(): Promise<User[]> {
  const data = await readData();
  return data.users || [];
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const data = await readData();
  return data.users?.find(u => u.email === email) || null;
}

export async function getUserById(id: string): Promise<User | null> {
  const data = await readData();
  return data.users?.find(u => u.id === id) || null;
}

export async function createUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
  const data = await readData();
  if (!data.users) data.users = [];
  
  const newUser: User = {
    ...user,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  data.users.push(newUser);
  await writeData(data);
  return newUser;
}
