/**
 * Spam filtering for form submissions.
 *
 * Bots post straight to the worker (bypassing the page honeypot) and stuff
 * scam links into the message so our confirmation email relays them to the
 * address they typed. Each check returns a reason string when the submission
 * is spam, or null when it looks legitimate.
 */

import { CONTACT_SERVICE_IDS } from './service-ids';

/** Bumped when spam rules change; surfaced in worker logs for deploy verification. */
export const SPAM_FILTER_BUILD = '2026-10-08a';

const SERVICE_IDS = new Set<string>(CONTACT_SERVICE_IDS);

const URL_PATTERN = /https?:\/\/|www\.|\b[a-z0-9-]+\.[a-z]{2,}\/\S/i;
const NON_LATIN_LETTER = /(?=\p{L})\P{Script=Latin}/u;
const CYRILLIC_LETTER = /[\u0400-\u04FF]/;
const ANY_LETTER = /\p{L}/u;
const ZERO_WIDTH = /[\u200B-\u200D\uFEFF]/g;
// Digits, or a lowercase letter followed by exactly two trailing capitals ("CarlosnumZQ", "JackfitIpGM")
const BOT_NAME_PART = /\d|[a-z][A-Z]{2}$/;
const MAX_NAME_LENGTH = 60;

/** Normalize user text before validation and spam checks. */
export function normalizeFormField(value: string): string {
  return value.replace(ZERO_WIDTH, '').replace(/\u00A0/g, ' ').trim();
}

export function originSpamReason(request: Request): string | null {
  const source = request.headers.get('Origin') || request.headers.get('Referer');
  if (!source) return 'missing origin';

  let host: string;
  try {
    host = new URL(source).hostname;
  } catch {
    return `invalid origin ${source}`;
  }

  const allowed = new Set(['heisergroup.com', 'www.heisergroup.com', 'localhost', '127.0.0.1']);
  const isSitePreview = host.endsWith('.point-dog-digital.workers.dev') && host.includes('heiser');
  if (allowed.has(host) || isSitePreview) return null;
  return `foreign origin ${host}`;
}

export function contactSpamReason(data: {
  firstName: string;
  lastName: string;
  phone?: string;
  serviceType: string;
  message: string;
  email?: string;
}): string | null {
  if (!SERVICE_IDS.has(data.serviceType)) return `unknown service ${data.serviceType}`;

  const firstName = normalizeFormField(data.firstName);
  const lastName = normalizeFormField(data.lastName);
  const message = normalizeFormField(data.message);
  const phone = data.phone ? normalizeFormField(data.phone) : '';
  const email = data.email ? normalizeFormField(data.email) : '';

  const nameReason =
    nameSpamReason(firstName)
    ?? nameSpamReason(lastName)
    ?? nameSpamReason(`${firstName} ${lastName}`)
    ?? repeatedFirstLastReason(firstName, lastName);
  if (nameReason) return nameReason;

  const linkBlob = [firstName, lastName, message].filter(Boolean).join('\n');
  const scriptBlob = [firstName, lastName, message, email, phone].filter(Boolean).join('\n');

  if (phone && !isUsPhone(phone)) return 'non-US phone';
  if (URL_PATTERN.test(linkBlob)) return 'link in submission';
  if (containsNonLatinScript(scriptBlob)) return 'non-Latin script';
  if (!ANY_LETTER.test(message)) return 'message has no words';
  return null;
}

export function careersSpamReason(
  data: { name: string; phone: string; position: string; message?: string; email?: string },
  validPositions: Set<string>,
): string | null {
  if (!validPositions.has(data.position)) return `unknown position ${data.position}`;

  const name = normalizeFormField(data.name);
  const phone = normalizeFormField(data.phone);
  const message = normalizeFormField(data.message || '');
  const email = data.email ? normalizeFormField(data.email) : '';

  const nameReason = nameSpamReason(name);
  if (nameReason) return nameReason;

  if (!isUsPhone(phone)) return 'non-US phone';

  const linkBlob = [name, message].filter(Boolean).join('\n');
  const scriptBlob = [name, message, email, phone].filter(Boolean).join('\n');
  if (URL_PATTERN.test(linkBlob)) return 'link in submission';
  if (containsNonLatinScript(scriptBlob)) return 'non-Latin script';
  return null;
}

function repeatedFirstLastReason(firstName: string, lastName: string): string | null {
  if (!firstName || !lastName) return null;
  if (firstName.toLowerCase() === lastName.toLowerCase()) return 'repeated name';
  return null;
}

function nameSpamReason(name: string): string | null {
  if (!name) return null;
  if (name.length > MAX_NAME_LENGTH) return 'oversized name';
  if (URL_PATTERN.test(name)) return 'link in name';

  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.some(part => BOT_NAME_PART.test(part))) return 'bot-pattern name';
  if (parts.length >= 2 && parts[0].toLowerCase() === parts[parts.length - 1].toLowerCase()) {
    return 'repeated name';
  }
  return null;
}

function containsNonLatinScript(text: string): boolean {
  if (!text) return false;
  if (CYRILLIC_LETTER.test(text)) return true;
  try {
    return NON_LATIN_LETTER.test(text);
  } catch {
    return CYRILLIC_LETTER.test(text);
  }
}

function isUsPhone(phone: string): boolean {
  const digits = phone.split(/x|ext/i)[0].replace(/\D/g, '');
  const national = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;
  return /^[2-9]\d{9}$/.test(national);
}
