/**
 * Global validation and input masking utilities for TS Logistics.
 */

export function isValidEmail(email: string): boolean {
  const trimmed = email.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed);
}

/**
 * Strips invisible Unicode directional/zero-width marks (often inserted when copying
 * phone numbers from WhatsApp or iOS/Android Contacts) and converts Arabic-Indic
 * / Extended Arabic-Indic numerals (٠-٩, ۰-۹) to ASCII digits 0-9.
 */
function normalizePhoneText(raw: string): string {
  return raw
    .replace(/[\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g, "")
    .replace(/[\u0660-\u0669]/g, (ch) => String(ch.charCodeAt(0) - 0x0660))
    .replace(/[\u06F0-\u06F9]/g, (ch) => String(ch.charCodeAt(0) - 0x06f0));
}

/**
 * Validates both Nigerian and international phone numbers:
 * - Nigerian local: 0803 123 4567, 070..., 081..., 090..., 091...
 * - Egyptian local & international: 010 1234 5678, +20 10 1234 5678, +20 010 1234 5678, 02 2345 6789
 * - International E.164: + followed by 7 to 15 digits
 * - Local / 00-prefixed numbers: 7 to 15 digits
 */
export function isValidPhone(phone: string): boolean {
  const compact = normalizePhoneText(phone).replace(/[\s\-().\/]+/g, "");
  if (/^0(70|80|81|90|91)\d{8}$/.test(compact)) {
    return true;
  }
  if (/^\+[1-9]\d{6,14}$/.test(compact)) {
    return true;
  }
  if (/^\d{7,15}$/.test(compact)) {
    return true;
  }
  return false;
}

// Preserved export name for backwards compatibility
export const isValidNigerianPhone = isValidPhone;

/**
 * Input mask for Nigerian, Egyptian, and international phone numbers:
 * - Normalizes Arabic-Indic digits and strips invisible copy-paste marks
 * - Formats "+..." international numbers cleanly up to 15 digits without jumping country codes
 * - Formats Nigerian local "070/080/081/090/091" numbers as "0803 123 4567"
 * - Formats Egyptian local "010/011/012/015" numbers as "010 1234 5678"
 */
export function maskPhoneNumber(raw: string): string {
  const normalized = normalizePhoneText(raw).trimStart();
  const hasPlus = normalized.startsWith("+");
  const digits = normalized.replace(/\D/g, "").slice(0, 15);

  if (!digits) {
    return hasPlus ? "+" : "";
  }

  if (hasPlus) {
    // Nigerian +234 -> +234 803 123 4567
    if (digits.startsWith("234")) {
      const rest = digits.slice(3);
      const parts = ["234"];
      if (rest.length > 0) parts.push(rest.slice(0, 3));
      if (rest.length > 3) parts.push(rest.slice(3, 6));
      if (rest.length > 6) parts.push(rest.slice(6, 10));
      return `+${parts.join(" ")}`;
    }
    // Egyptian +20 -> +20 10 1234 5678 (or +20 010 1234 5678)
    if (digits.startsWith("20")) {
      const rest = digits.slice(2);
      if (!rest) return "+20";
      if (rest.startsWith("0")) {
        const parts = ["20", rest.slice(0, 3)];
        if (rest.length > 3) parts.push(rest.slice(3, 7));
        if (rest.length > 7) parts.push(rest.slice(7, 11));
        return `+${parts.join(" ")}`;
      }
      if (/^(10|11|12|15)/.test(rest)) {
        const parts = ["20", rest.slice(0, 2)];
        if (rest.length > 2) parts.push(rest.slice(2, 6));
        if (rest.length > 6) parts.push(rest.slice(6, 10));
        return `+${parts.join(" ")}`;
      }
      return `+20 ${rest.replace(/(\d{4})(?=\d)/g, "$1 ").trim()}`;
    }
    // Generic international: preserve clean single spaces if typed, otherwise group in 3s
    if (/[\s-]/.test(normalized)) {
      let digitCount = 0;
      let cleaned = "+";
      for (const ch of normalized.slice(1)) {
        if (/\d/.test(ch)) {
          if (digitCount >= 15) break;
          cleaned += ch;
          digitCount++;
        } else if ((ch === " " || ch === "-") && !cleaned.endsWith(" ") && cleaned !== "+") {
          cleaned += " ";
        }
      }
      return cleaned;
    }
    return `+${digits.replace(/(\d{3})(?=\d)/g, "$1 ").trim()}`;
  }

  // Nigerian local mobile: 0803 123 4567
  if (/^0(70|80|81|90|91)/.test(digits)) {
    const capped = digits.slice(0, 11);
    if (capped.length <= 4) return capped;
    if (capped.length <= 7) return `${capped.slice(0, 4)} ${capped.slice(4)}`;
    return `${capped.slice(0, 4)} ${capped.slice(4, 7)} ${capped.slice(7, 11)}`;
  }

  // Egyptian local mobile: 010 1234 5678
  if (/^01[0125]/.test(digits)) {
    const capped = digits.slice(0, 11);
    if (capped.length <= 3) return capped;
    if (capped.length <= 7) return `${capped.slice(0, 3)} ${capped.slice(3)}`;
    return `${capped.slice(0, 3)} ${capped.slice(3, 7)} ${capped.slice(7, 11)}`;
  }

  return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
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
