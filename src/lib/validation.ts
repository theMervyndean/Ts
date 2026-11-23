/**
 * Validation and input masking utilities for TS Logistics Nigeria.
 */

export function isValidEmail(email: string): boolean {
  const trimmed = email.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed);
}

/**
 * Validates Nigerian phone numbers in standard local or international formats:
 * - Local: 08031234567, 0812 345 6789, 0701-234-5678, 09051234567, 09121234567
 * - International: +2348031234567, +234 803 123 4567, 2348031234567
 */
export function isValidNigerianPhone(phone: string): boolean {
  const compact = phone.replace(/[\s\-().]/g, "");
  if (/^0(70|80|81|90|91)\d{8}$/.test(compact)) {
    return true;
  }
  if (/^\+?234(70|80|81|90|91)\d{8}$/.test(compact)) {
    return true;
  }
  // Also accept 2340... accidentally typed after +234
  if (/^\+?2340(70|80|81|90|91)\d{8}$/.test(compact)) {
    return true;
  }
  return false;
}

/**
 * Input mask for Nigerian phone numbers:
 * Strips non-digit characters (preserving a leading '+') and formats cleanly
 * as "0803 123 4567" or "+234 803 123 4567".
 */
export function maskNigerianPhone(raw: string): string {
  const trimmed = raw.trimStart();
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");

  if (!digits) {
    return hasPlus ? "+" : "";
  }

  if (hasPlus || digits.startsWith("234")) {
    const capped = digits.slice(0, 13);
    const prefix = capped.slice(0, 3);
    const rest = capped.slice(3);
    const parts = [prefix];
    if (rest.length > 0) parts.push(rest.slice(0, 3));
    if (rest.length > 3) parts.push(rest.slice(3, 6));
    if (rest.length > 6) parts.push(rest.slice(6, 10));
    return `+${parts.join(" ")}`;
  }

  const capped = digits.slice(0, 11);
  if (capped.length <= 4) return capped;
  if (capped.length <= 7) return `${capped.slice(0, 4)} ${capped.slice(4)}`;
  return `${capped.slice(0, 4)} ${capped.slice(4, 7)} ${capped.slice(7, 11)}`;
}

/**
 * Input mask for shipment tracking IDs:
 * Uppercases and restricts to alphanumeric + hyphens (e.g., TS-20261122-1042).
 */
export function maskTrackingId(raw: string): string {
  return raw
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 24);
}

/**
 * Input mask for package weight in kg:
 * Restricts to positive numbers with up to 2 decimal places.
 */
export function maskWeightKg(raw: string): string {
  const cleaned = raw.replace(/[^0-9.]/g, "");
  const firstDot = cleaned.indexOf(".");
  if (firstDot === -1) {
    return cleaned.slice(0, 6);
  }
  const intPart = cleaned.slice(0, firstDot).slice(0, 6);
  const decPart = cleaned
    .slice(firstDot + 1)
    .replace(/\./g, "")
    .slice(0, 2);
  return `${intPart}.${decPart}`;
}

export function getTodayWATDateString(): string {
  // West Africa Time is UTC+1
  const now = new Date();
  const watMs = now.getTime() + 60 * 60 * 1000;
  const watDate = new Date(watMs);
  return watDate.toISOString().split("T")[0];
}
