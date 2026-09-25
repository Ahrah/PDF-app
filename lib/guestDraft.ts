'use client';

import { LineItem } from './types';

/**
 * Client-side-only draft of a guest quote, used purely to survive the
 * redirect through signup/login so the user doesn't have to retype
 * everything. This is NOT the abuse-prevention mechanism (that's the
 * server-side IP check in /api/guest/quote-quota) and it's never sent to
 * an analytics log — only read/written here and, on explicit save,
 * POSTed once to the normal authenticated /api/clients + /api/deals
 * endpoints.
 */
export interface GuestQuoteDraft {
  sellerName: string;
  sellerEmail: string;
  sellerPhone: string;
  clientName: string;
  clientCompany: string;
  issueDate: string;
  lineItems: LineItem[];
}

const STORAGE_KEY = 'guestQuoteDraft';

export function saveGuestDraft(draft: GuestQuoteDraft) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // localStorage can throw (private mode, quota) — losing the draft
    // cache is fine, it's a convenience, not a requirement.
  }
}

export function loadGuestDraft(): GuestQuoteDraft | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearGuestDraft() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
