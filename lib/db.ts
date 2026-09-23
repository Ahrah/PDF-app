import { getSupabaseAdmin } from './supabase';
import { Client, Deal, SellerInfo, MonthlyUsage, User, Settings, CustomerType, FeedbackSubmission, FeedbackType, FeedbackStatus } from './types';

function getCurrentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

// ---------- mapping helpers (snake_case DB <-> camelCase app) ----------

function mapClient(row: any): Client {
  return {
    id: row.id,
    userId: row.user_id,
    customerType: row.customer_type as CustomerType,
    name: row.name,
    company: row.company ?? undefined,
    contactName: row.contact_name ?? undefined,
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    businessNumber: row.business_number ?? undefined,
    address: row.address ?? undefined,
    memo: row.memo ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapDeal(row: any): Deal {
  return {
    id: row.id,
    userId: row.user_id,
    clientId: row.client_id,
    type: row.type,
    status: row.status,
    title: row.deal_title ?? undefined,
    issueDate: row.issue_date,
    validUntil: row.valid_until ?? undefined,
    dueDate: row.due_date ?? undefined,
    lineItems: row.line_items ?? [],
    discount: Number(row.discount),
    vatMode: row.vat_mode,
    memo: row.memo ?? undefined,
    paymentMemo: row.payment_memo ?? undefined,
    totalAmount: Number(row.total_amount),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    pdfDownloaded: row.pdf_downloaded ?? false,
  };
}

function mapSeller(row: any): SellerInfo {
  return {
    userId: row.user_id,
    name: row.name,
    businessName: row.business_name ?? undefined,
    businessType: row.business_type ?? undefined,
    businessItem: row.business_item ?? undefined,
    email: row.email,
    phone: row.phone,
    bankAccount: row.bank_account,
    businessNumber: row.business_number ?? undefined,
    address: row.address ?? undefined,
  };
}

function mapUser(row: any): User {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    displayName: row.display_name ?? undefined,
    phone: row.phone ?? undefined,
    trialEndsAt: row.trial_ends_at,
    isPremium: row.is_premium,
    monthlyDealCount: row.monthly_deal_count,
    currentMonth: row.current_month,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ---------- clients ----------

export async function getClients(userId: string): Promise<Client[]> {
  const { data, error } = await getSupabaseAdmin()
    .from('clients')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapClient);
}

export async function getClient(userId: string, id: string): Promise<Client | null> {
  const { data, error } = await getSupabaseAdmin()
    .from('clients')
    .select('*')
    .eq('user_id', userId)
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapClient(data) : null;
}

export interface ClientInput {
  customerType?: CustomerType;
  name?: string;
  company?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  businessNumber?: string;
  address?: string;
  memo?: string;
}

export async function createClient(userId: string, input: ClientInput): Promise<Client> {
  const name = (input.name || input.company || '').trim();
  if (!name) {
    throw new Error('고객명 또는 회사명을 입력해 주세요.');
  }
  const { data, error } = await getSupabaseAdmin()
    .from('clients')
    .insert({
      user_id: userId,
      customer_type: input.customerType || '개인',
      name,
      company: input.company || null,
      contact_name: input.contactName || null,
      email: input.email || null,
      phone: input.phone || null,
      business_number: input.businessNumber || null,
      address: input.address || null,
      memo: input.memo || null,
    })
    .select('*')
    .single();
  if (error) throw error;
  return mapClient(data);
}

export async function updateClient(
  userId: string,
  id: string,
  updates: Partial<ClientInput>
): Promise<Client | null> {
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (updates.customerType !== undefined) patch.customer_type = updates.customerType;
  if (updates.name !== undefined) patch.name = updates.name;
  if (updates.company !== undefined) patch.company = updates.company || null;
  if (updates.contactName !== undefined) patch.contact_name = updates.contactName || null;
  if (updates.email !== undefined) patch.email = updates.email || null;
  if (updates.phone !== undefined) patch.phone = updates.phone || null;
  if (updates.businessNumber !== undefined) patch.business_number = updates.businessNumber || null;
  if (updates.address !== undefined) patch.address = updates.address || null;
  if (updates.memo !== undefined) patch.memo = updates.memo || null;

  const { data, error } = await getSupabaseAdmin()
    .from('clients')
    .update(patch)
    .eq('user_id', userId)
    .eq('id', id)
    .select('*')
    .maybeSingle();
  if (error) throw error;
  return data ? mapClient(data) : null;
}

export async function deleteClient(userId: string, id: string): Promise<boolean> {
  const { data, error } = await getSupabaseAdmin()
    .from('clients')
    .delete()
    .eq('user_id', userId)
    .eq('id', id)
    .select('id');
  if (error) throw error;
  return (data || []).length > 0;
}

// Find duplicate candidates for bulk import (same user only).
export async function findDuplicateClient(
  userId: string,
  candidate: { businessNumber?: string; email?: string; phone?: string; company?: string; name?: string }
): Promise<Client | null> {
  const admin = getSupabaseAdmin();

  if (candidate.businessNumber) {
    const { data } = await admin
      .from('clients')
      .select('*')
      .eq('user_id', userId)
      .eq('business_number', candidate.businessNumber)
      .maybeSingle();
    if (data) return mapClient(data);
  }
  if (candidate.email) {
    const { data } = await admin
      .from('clients')
      .select('*')
      .eq('user_id', userId)
      .eq('email', candidate.email)
      .maybeSingle();
    if (data) return mapClient(data);
  }
  if (candidate.phone) {
    const { data } = await admin
      .from('clients')
      .select('*')
      .eq('user_id', userId)
      .eq('phone', candidate.phone)
      .maybeSingle();
    if (data) return mapClient(data);
  }
  if (candidate.company) {
    const { data } = await admin
      .from('clients')
      .select('*')
      .eq('user_id', userId)
      .eq('company', candidate.company)
      .maybeSingle();
    if (data) return mapClient(data);
  }
  return null;
}

// ---------- deals ----------

export async function getDeals(userId: string): Promise<Deal[]> {
  const { data, error } = await getSupabaseAdmin()
    .from('deals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapDeal);
}

export async function getDeal(userId: string, id: string): Promise<Deal | null> {
  const { data, error } = await getSupabaseAdmin()
    .from('deals')
    .select('*')
    .eq('user_id', userId)
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapDeal(data) : null;
}

export async function createDeal(
  userId: string,
  deal: Omit<Deal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<Deal> {
  // ownership check: the client must belong to this user
  const client = await getClient(userId, deal.clientId);
  if (!client) {
    throw new Error('선택한 고객을 찾을 수 없습니다.');
  }

  const { data, error } = await getSupabaseAdmin()
    .from('deals')
    .insert({
      user_id: userId,
      client_id: deal.clientId,
      type: deal.type,
      status: deal.status,
      deal_title: deal.title || null,
      issue_date: deal.issueDate,
      valid_until: deal.validUntil || null,
      due_date: deal.dueDate || null,
      line_items: deal.lineItems,
      discount: deal.discount,
      vat_mode: deal.vatMode,
      memo: deal.memo || null,
      payment_memo: deal.paymentMemo || null,
      total_amount: deal.totalAmount,
      pdf_downloaded: deal.pdfDownloaded || false,
    })
    .select('*')
    .single();
  if (error) throw error;

  // Quota counts unique documents on first PDF *download* (see /api/quota),
  // not on creation — otherwise converting a quote to an invoice would
  // double-count one transaction as two.
  return mapDeal(data);
}

export async function updateDeal(
  userId: string,
  id: string,
  updates: Partial<Deal>
): Promise<Deal | null> {
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (updates.status !== undefined) patch.status = updates.status;
  if (updates.title !== undefined) patch.deal_title = updates.title || null;
  if (updates.issueDate !== undefined) patch.issue_date = updates.issueDate;
  if (updates.validUntil !== undefined) patch.valid_until = updates.validUntil || null;
  if (updates.dueDate !== undefined) patch.due_date = updates.dueDate || null;
  if (updates.lineItems !== undefined) patch.line_items = updates.lineItems;
  if (updates.discount !== undefined) patch.discount = updates.discount;
  if (updates.vatMode !== undefined) patch.vat_mode = updates.vatMode;
  if (updates.memo !== undefined) patch.memo = updates.memo || null;
  if (updates.paymentMemo !== undefined) patch.payment_memo = updates.paymentMemo || null;
  if (updates.totalAmount !== undefined) patch.total_amount = updates.totalAmount;
  if (updates.pdfDownloaded !== undefined) patch.pdf_downloaded = updates.pdfDownloaded;

  const { data, error } = await getSupabaseAdmin()
    .from('deals')
    .update(patch)
    .eq('user_id', userId)
    .eq('id', id)
    .select('*')
    .maybeSingle();
  if (error) throw error;
  return data ? mapDeal(data) : null;
}

export async function deleteDeal(userId: string, id: string): Promise<boolean> {
  const { data, error } = await getSupabaseAdmin()
    .from('deals')
    .delete()
    .eq('user_id', userId)
    .eq('id', id)
    .select('id');
  if (error) throw error;
  return (data || []).length > 0;
}

// ---------- seller ----------

export async function getSeller(userId: string): Promise<SellerInfo | null> {
  const { data, error } = await getSupabaseAdmin()
    .from('seller_info')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data ? mapSeller(data) : null;
}

export async function updateSeller(userId: string, seller: Omit<SellerInfo, 'userId'>): Promise<SellerInfo> {
  const { data, error } = await getSupabaseAdmin()
    .from('seller_info')
    .upsert({
      user_id: userId,
      name: seller.name,
      business_name: seller.businessName || null,
      business_type: seller.businessType || null,
      business_item: seller.businessItem || null,
      email: seller.email,
      phone: seller.phone,
      bank_account: seller.bankAccount,
      business_number: seller.businessNumber || null,
      address: seller.address || null,
      updated_at: new Date().toISOString(),
    })
    .select('*')
    .single();
  if (error) throw error;
  return mapSeller(data);
}

// ---------- settings / quota (per-user) ----------

function resetMonthIfNeeded(user: User): { changed: boolean; count: number; month: string } {
  const currentMonth = getCurrentMonth();
  if (user.currentMonth !== currentMonth) {
    return { changed: true, count: 0, month: currentMonth };
  }
  return { changed: false, count: user.monthlyDealCount || 0, month: user.currentMonth || currentMonth };
}

export async function getSettings(userId: string): Promise<Settings> {
  const user = await getUserById(userId);
  if (!user) {
    return { isPremium: false, monthlyDealCount: 0, currentMonth: getCurrentMonth() };
  }
  const reset = resetMonthIfNeeded(user);
  if (reset.changed) {
    await getSupabaseAdmin()
      .from('app_users')
      .update({ monthly_deal_count: 0, current_month: reset.month })
      .eq('id', userId);
  }
  return {
    isPremium: !!user.isPremium,
    monthlyDealCount: reset.count,
    currentMonth: reset.month,
  };
}

export async function incrementDealCount(userId: string): Promise<void> {
  const settings = await getSettings(userId);
  await getSupabaseAdmin()
    .from('app_users')
    .update({ monthly_deal_count: settings.monthlyDealCount + 1, current_month: settings.currentMonth })
    .eq('id', userId);
}

export async function canDownloadPDF(userId: string): Promise<{ allowed: boolean; count: number; limit: number }> {
  const settings = await getSettings(userId);
  const premium = settings.isPremium || (await isUserPremium(userId));
  const limit = premium ? Infinity : 3;
  return {
    allowed: premium || settings.monthlyDealCount < limit,
    count: settings.monthlyDealCount,
    limit: premium ? 999 : 3,
  };
}

export async function isUserPremium(userId: string): Promise<boolean> {
  const user = await getUserById(userId);
  if (!user) return false;
  if (user.isPremium) return true;
  return !!user.trialEndsAt && new Date(user.trialEndsAt) > new Date();
}

export async function getMonthlyUsage(userId: string): Promise<MonthlyUsage> {
  const settings = await getSettings(userId);
  const deals = await getDeals(userId);
  const currentMonth = getCurrentMonth();

  const monthlyDeals = deals.filter(
    (deal) => deal.createdAt.startsWith(currentMonth) && deal.pdfDownloaded
  );

  return {
    month: currentMonth,
    dealCount: settings.monthlyDealCount,
    dealIds: monthlyDeals.map((d) => d.id),
  };
}

// ---------- users ----------

export async function getUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await getSupabaseAdmin()
    .from('app_users')
    .select('*')
    .eq('email', email.toLowerCase().trim())
    .maybeSingle();
  if (error) throw error;
  return data ? mapUser(data) : null;
}

export async function getUserById(id: string): Promise<User | null> {
  const { data, error } = await getSupabaseAdmin()
    .from('app_users')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapUser(data) : null;
}

export async function createUser(
  user: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'isPremium' | 'monthlyDealCount' | 'currentMonth'>
): Promise<User> {
  const { data, error } = await getSupabaseAdmin()
    .from('app_users')
    .insert({
      email: user.email.toLowerCase().trim(),
      password_hash: user.passwordHash,
      display_name: user.displayName || null,
      phone: user.phone || null,
      trial_ends_at: user.trialEndsAt,
      current_month: getCurrentMonth(),
    })
    .select('*')
    .single();
  if (error) throw error;
  return mapUser(data);
}

/**
 * Starts the 30-day trial for a user who hasn't started one yet. Returns
 * the new trialEndsAt, or null if the user already has one (trial already
 * started — active or expired, we never restart it).
 */
export async function startTrial(userId: string): Promise<string | null> {
  const user = await getUserById(userId);
  if (!user || user.trialEndsAt) return null;

  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 30);
  const iso = trialEndsAt.toISOString();

  const { error } = await getSupabaseAdmin()
    .from('app_users')
    .update({ trial_ends_at: iso, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .is('trial_ends_at', null);
  if (error) throw error;
  return iso;
}

// ---------- signup abuse prevention ----------

const SIGNUP_RATE_LIMIT_WINDOW_HOURS = 24;
const SIGNUP_RATE_LIMIT_MAX_PER_IP = 2;

/** True if this IP has already used up its signups for the rate-limit window. */
export async function isSignupRateLimited(ip: string): Promise<boolean> {
  const since = new Date(Date.now() - SIGNUP_RATE_LIMIT_WINDOW_HOURS * 60 * 60 * 1000).toISOString();
  const { count, error } = await getSupabaseAdmin()
    .from('signup_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('ip', ip)
    .gte('created_at', since);
  if (error) throw error;
  return (count ?? 0) >= SIGNUP_RATE_LIMIT_MAX_PER_IP;
}

export async function recordSignupAttempt(ip: string, email: string): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from('signup_attempts')
    .insert({ ip, email: email.toLowerCase().trim() });
  if (error) throw error;
}

export async function updateUserPassword(userId: string, passwordHash: string): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from('app_users')
    .update({ password_hash: passwordHash, updated_at: new Date().toISOString() })
    .eq('id', userId);
  if (error) throw error;
}

export async function updateUserProfile(
  userId: string,
  updates: { displayName?: string; phone?: string }
): Promise<User | null> {
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (updates.displayName !== undefined) patch.display_name = updates.displayName || null;
  if (updates.phone !== undefined) patch.phone = updates.phone || null;

  const { data, error } = await getSupabaseAdmin()
    .from('app_users')
    .update(patch)
    .eq('id', userId)
    .select('*')
    .maybeSingle();
  if (error) throw error;
  return data ? mapUser(data) : null;
}

// ---------- feedback / support submissions ----------

function mapFeedback(row: any): FeedbackSubmission {
  return {
    id: row.id,
    type: row.type,
    category: row.category,
    title: row.title ?? undefined,
    content: row.content,
    userId: row.user_id,
    userName: row.user_name ?? undefined,
    userEmail: row.user_email,
    pagePath: row.page_path ?? undefined,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export interface CreateFeedbackInput {
  type: FeedbackType;
  category: string;
  title?: string;
  content: string;
  userId: string;
  userName?: string;
  userEmail: string;
  pagePath?: string;
}

export async function createFeedback(input: CreateFeedbackInput): Promise<FeedbackSubmission> {
  const { data, error } = await getSupabaseAdmin()
    .from('feedback_submissions')
    .insert({
      type: input.type,
      category: input.category,
      title: input.title || null,
      content: input.content,
      user_id: input.userId,
      user_name: input.userName || null,
      user_email: input.userEmail,
      page_path: input.pagePath || null,
    })
    .select('*')
    .single();
  if (error) throw error;
  return mapFeedback(data);
}

export interface ListFeedbackFilters {
  type?: FeedbackType;
  status?: FeedbackStatus;
  search?: string;
}

export async function listFeedback(filters: ListFeedbackFilters): Promise<FeedbackSubmission[]> {
  let query = getSupabaseAdmin()
    .from('feedback_submissions')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters.type) query = query.eq('type', filters.type);
  if (filters.status) query = query.eq('status', filters.status);
  if (filters.search) {
    const term = filters.search.replace(/[%_]/g, '\\$&');
    query = query.or(`user_email.ilike.%${term}%,title.ilike.%${term}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(mapFeedback);
}

export async function countNewFeedback(): Promise<number> {
  const { count, error } = await getSupabaseAdmin()
    .from('feedback_submissions')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'new');
  if (error) throw error;
  return count ?? 0;
}

export async function updateFeedbackStatus(id: string, status: FeedbackStatus): Promise<FeedbackSubmission | null> {
  const { data, error } = await getSupabaseAdmin()
    .from('feedback_submissions')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .maybeSingle();
  if (error) throw error;
  return data ? mapFeedback(data) : null;
}
