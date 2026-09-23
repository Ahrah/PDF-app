/**
 * Common disposable/throwaway email domains, used to raise the bar for
 * signing up many free-trial accounts. Not exhaustive — new disposable
 * services appear constantly — so this is one layer alongside the
 * per-IP signup rate limit, not a complete solution on its own.
 */
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'mailinator.com',
  'guerrillamail.com',
  'guerrillamail.info',
  '10minutemail.com',
  '10minutemail.net',
  'tempmail.com',
  'temp-mail.org',
  'throwawaymail.com',
  'yopmail.com',
  'yopmail.fr',
  'trashmail.com',
  'getnada.com',
  'dispostable.com',
  'fakeinbox.com',
  'sharklasers.com',
  'maildrop.cc',
  'mintemail.com',
  'mohmal.com',
  'moakt.com',
  'emailondeck.com',
  'mailnesia.com',
  'discard.email',
  'spamgourmet.com',
]);

export function isDisposableEmail(email: string): boolean {
  const domain = email.trim().toLowerCase().split('@')[1];
  if (!domain) return false;
  return DISPOSABLE_EMAIL_DOMAINS.has(domain);
}
