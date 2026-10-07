/**
 * Spam filtering for form submissions.
 *
 * Bots post straight to the worker (bypassing the page honeypot) and stuff
 * scam links into the message so our confirmation email relays them to the
 * address they typed. Each check returns a reason string when the submission
 * is spam, or null when it looks legitimate.
 */

import { services } from '../../../src/lib/services';

const ALLOWED_ORIGIN_HOSTS = new Set(['heisergroup.com', 'www.heisergroup.com', 'localhost', '127.0.0.1']);
const SERVICE_IDS = new Set<string>(services.map(s => s.id));

const URL_PATTERN = /https?:\/\/|www\.|\b[a-z0-9-]+\.[a-z]{2,}\/\S/i;
const NON_LATIN_LETTER = /(?=\p{L})\P{Script=Latin}/u;
const ANY_LETTER = /\p{L}/u;
// Digits, or a lowercase letter followed by exactly two trailing capitals ("CarlosnumZQ", "JackfitIpGM")
const BOT_NAME_PART = /\d|[a-z][A-Z]{2}$/;
const MAX_NAME_LENGTH = 60;

export function originSpamReason(request: Request): string | null {
  const source = request.headers.get('Origin') || request.headers.get('Referer');
  if (!source) return 'missing origin';

  let host: string;
  try {
    host = new URL(source).hostname;
  } catch {
    return `invalid origin ${source}`;
  }

  const isSitePreview = host.endsWith('.point-dog-digital.workers.dev') && host.includes('heiser');
  if (ALLOWED_ORIGIN_HOSTS.has(host) || isSitePreview) return null;
  return `foreign origin ${host}`;
}

export function contactSpamReason(data: {
  firstName: string;
  lastName: string;
  phone?: string;
  serviceType: string;
  message: string;
}): string | null {
  if (!SERVICE_IDS.has(data.serviceType)) return `unknown service ${data.serviceType}`;

  const fullName = `${data.firstName} ${data.lastName}`;
  const nameReason = nameSpamReason(fullName);
  if (nameReason) return nameReason;

  if (data.phone && !isUsPhone(data.phone)) return 'non-US phone';
  if (URL_PATTERN.test(data.message)) return 'link in message';
  if (NON_LATIN_LETTER.test(fullName + data.message)) return 'non-Latin script';
  if (!ANY_LETTER.test(data.message)) return 'message has no words';
  return null;
}

export function careersSpamReason(
  data: { name: string; phone: string; position: string; message?: string },
  validPositions: Set<string>,
): string | null {
  if (!validPositions.has(data.position)) return `unknown position ${data.position}`;

  const nameReason = nameSpamReason(data.name);
  if (nameReason) return nameReason;

  if (!isUsPhone(data.phone)) return 'non-US phone';
  if (NON_LATIN_LETTER.test(data.name + (data.message || ''))) return 'non-Latin script';
  return null;
}

function nameSpamReason(name: string): string | null {
  if (name.length > MAX_NAME_LENGTH) return 'oversized name';
  if (URL_PATTERN.test(name)) return 'link in name';

  const parts = name.trim().split(/\s+/);
  if (parts.some(part => BOT_NAME_PART.test(part))) return 'bot-pattern name';
  if (parts.length >= 2 && parts[0].toLowerCase() === parts[parts.length - 1].toLowerCase()) {
    return 'repeated name';
  }
  return null;
}

function isUsPhone(phone: string): boolean {
  const digits = phone.split(/x|ext/i)[0].replace(/\D/g, '');
  const national = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;
  return /^[2-9]\d{9}$/.test(national);
}
