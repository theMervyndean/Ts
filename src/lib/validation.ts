/**
 * Global validation and input masking utilities for TS Logistics.
 */

export function isValidEmail(email: string): boolean {
  const trimmed = email.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed);
}

/**
 * Validates both Nigerian and international phone numbers:
 * - Nigerian local: 0803 123 4567, 070..., 081..., 090..., 091...
 * - International E.164: +20 10 1234 5678, +44 7700 900077, +1 415 555 0192, +234 803 123 4567
 * - Other local mobile numbers: 8 to 15 digits
 */
export function isValidPhone(phone: string): boolean {
  const compact = phone.replace(/[\s\-().]/g, "");
  if (/^0(70|80|81|90|91)\d{8}$/.test(compact)) {
    return true;
  }
  if (/^\+[1-9]\d{7,14}$/.test(compact)) {
    return true;
  }
  if (/^\d{8,15}$/.test(compact)) {
    return true;
  }
  return false;
}

// Preserved export name for backwards compatibility
export const isValidNigerianPhone = isValidPhone;

/**
 * Input mask for Nigerian and international phone numbers:
 * - Formats "+..." international numbers cleanly while allowing any country code (up to 15 digits)
 * - Formats Nigerian local "070/080/081/090/091" numbers as "0803 123 4567"
 * - Allows other local numbers cleanly up to 15 digits
 */
export function maskPhoneNumber(raw: string): string {
  const trimmed = raw.trimStart();
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");

  if (!digits) {
    return hasPlus ? "+" : "";
  }

  if (hasPlus) {
    const capped = digits.slice(0, 15);
    // Format Nigerian +234 cleanly as +234 803 123 4567
    if (capped.startsWith("234")) {
      const prefix = capped.slice(0, 3);
      const rest = capped.slice(3);
      const parts = [prefix];
      if (rest.length > 0) parts.push(rest.slice(0, 3));
      if (rest.length > 3) parts.push(rest.slice(3, 6));
      if (rest.length > 6) parts.push(rest.slice(6, 10));
      return `+${parts.join(" ")}`;
    }
    // Generic readable international grouping: +CC XXX XXX XXXX
    const groups = capped.match(/.{1,3}/g) || [capped];
    if (groups.length > 1 && groups[0].length === 3 && capped.length <= 12) {
      return `+${capped.slice(0, 2)} ${capped.slice(2).replace(/(\d{3})(?=\d)/g, "$1 ")}`.trim();
    }
    return `+${groups.join(" ")}`;
  }

  if (/^0(70|80|81|90|91)/.test(digits)) {
    const capped = digits.slice(0, 11);
    if (capped.length <= 4) return capped;
    if (capped.length <= 7) return `${capped.slice(0, 4)} ${capped.slice(4)}`;
    return `${capped.slice(0, 4)} ${capped.slice(4, 7)} ${capped.slice(7, 11)}`;
  }

  const capped = digits.slice(0, 15);
  return capped.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

// Preserved export name for backwards compatibility
export const maskNigerianPhone = maskPhoneNumber;

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
