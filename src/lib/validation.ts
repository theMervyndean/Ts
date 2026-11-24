import {
  AsYouType,
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
  validatePhoneNumberLength,
  type CountryCode,
} from "libphonenumber-js";
import metadata from "libphonenumber-js/metadata.min.json";

export type { CountryCode };

export interface CountryOption {
  code: CountryCode;
  name: string;
  dialCode: string;
  flag: string;
}

export interface EmailValidationResult {
  valid: boolean;
  reason: string;
  normalized: string;
  suggestion: string | null;
}

export interface PhoneValidationResult {
  valid: boolean;
  reason: string;
  e164: string;
  international: string;
  country: CountryCode | "";
}

const COMMON_EMAIL_DOMAIN_TYPOS: Record<string, string> = {
  "gmail.con": "gmail.com",
  "gmial.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gmaill.com": "gmail.com",
  "gmail.co": "gmail.com",
  "yahooo.com": "yahoo.com",
  "yaho.com": "yahoo.com",
  "yahoo.con": "yahoo.com",
  "hotmial.com": "hotmail.com",
  "hotmal.com": "hotmail.com",
  "hotmail.con": "hotmail.com",
  "outlok.com": "outlook.com",
  "outllok.com": "outlook.com",
  "outlook.con": "outlook.com",
};

export function getCountryFlagEmoji(countryCode: string): string {
  const upper = countryCode.toUpperCase();
  if (!/^[A-Z]{2}$/.test(upper)) return "🌐";
  return String.fromCodePoint(
    127397 + upper.charCodeAt(0),
    127397 + upper.charCodeAt(1)
  );
}

const regionDisplayNames =
  typeof Intl !== "undefined" && typeof Intl.DisplayNames === "function"
    ? new Intl.DisplayNames(["en"], { type: "region" })
    : null;

export const ALL_COUNTRIES: CountryOption[] = (() => {
  const list: CountryOption[] = getCountries().map((code) => {
    let name: string = code;
    try {
      name = regionDisplayNames?.of(code) || code;
    } catch {
      name = code;
    }
    return {
      code,
      name,
      dialCode: `+${getCountryCallingCode(code)}`,
      flag: getCountryFlagEmoji(code),
    };
  });

  // Sort alphabetically, keeping Nigeria (NG) at the top as the default
  list.sort((a, b) => {
    if (a.code === "NG") return -1;
    if (b.code === "NG") return 1;
    return a.name.localeCompare(b.name);
  });

  return list;
})();

const COUNTRY_BY_CODE = new Map<CountryCode, CountryOption>(
  ALL_COUNTRIES.map((item) => [item.code, item])
);

export function getCountryOption(code: string): CountryOption | undefined {
  return COUNTRY_BY_CODE.get(code.toUpperCase() as CountryCode);
}

/**
 * Strips invisible directional/zero-width Unicode marks (common when copy-pasting
 * from WhatsApp or Contacts) and converts Arabic-Indic digits (٠-٩ / ۰-۹) to ASCII 0-9.
 */
function normalizePhoneText(raw: string): string {
  return raw
    .replace(/[\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g, "")
    .replace(/[\u0660-\u0669]/g, (ch) => String(ch.charCodeAt(0) - 0x0660))
    .replace(/[\u06F0-\u06F9]/g, (ch) => String(ch.charCodeAt(0) - 0x06f0));
}

function stripPhoneFormatting(raw: string): string {
  return normalizePhoneText(raw).trim().replace(/[\s\-().]+/g, "");
}

function resolvePrimaryCountryForCallingCode(
  callingCode: string | undefined,
  preferredCountry?: CountryCode
): CountryCode | undefined {
  if (!callingCode) return undefined;
  const mapping = (metadata.country_calling_codes as Record<string, CountryCode[]>)[callingCode];
  if (!mapping || mapping.length === 0) return undefined;
  if (preferredCountry && mapping.includes(preferredCountry)) {
    return preferredCountry;
  }
  return mapping[0];
}

/**
 * Detects a matching CountryCode when the user enters an international number starting with "+".
 * Returns null if the number does not start with "+" or has not yet resolved to a country code.
 */
export function detectCountryFromPlusInput(
  raw: string,
  currentCountry: CountryCode
): CountryCode | null {
  const cleaned = stripPhoneFormatting(raw);
  if (!cleaned.startsWith("+")) return null;
  if (/[a-zA-Z\p{L}]/u.test(cleaned)) return null;

  const parsed = parsePhoneNumberFromString(cleaned);
  if (parsed?.country) {
    return parsed.country;
  }

  const ayt = new AsYouType();
  ayt.input(cleaned);
  const aytCountry = ayt.getCountry();
  if (aytCountry) {
    return aytCountry;
  }

  const callingCode = parsed?.countryCallingCode || ayt.getCallingCode();
  if (callingCode) {
    // Keep current country if it already shares the same calling code (e.g. CA +1 while typing +1)
    if (getCountryCallingCode(currentCountry) === callingCode) {
      return currentCountry;
    }
    return resolvePrimaryCountryForCallingCode(callingCode, currentCountry) ?? null;
  }

  return null;
}

/**
 * Validates any phone number worldwide via libphonenumber-js.
 * - Rejects letters, invalid symbols, too-short/too-long inputs, and invalid numbers for the country.
 * - Strips spaces, dashes, brackets, and dots before parsing.
 * - Supports UK Ofcom reserved test range (+44 7700 900xxx) alongside all real international numbers.
 */
export function validatePhone(
  raw: string,
  selectedCountry: CountryCode = "NG"
): PhoneValidationResult {
  const normalized = normalizePhoneText(raw).trim();
  if (!normalized) {
    return {
      valid: false,
      reason: "Enter a phone number.",
      e164: "",
      international: "",
      country: "",
    };
  }

  if (/[a-zA-Z\p{L}]/u.test(normalized)) {
    return {
      valid: false,
      reason: "Phone number cannot contain letters.",
      e164: "",
      international: "",
      country: "",
    };
  }

  // Allow only digits, optional leading +, spaces, hyphens, parentheses, and dots
  if (/[^0-9+\s\-().]/.test(normalized) || normalized.indexOf("+", 1) !== -1) {
    return {
      valid: false,
      reason: "Use only digits, +, spaces, dashes, or brackets.",
      e164: "",
      international: "",
      country: "",
    };
  }

  const compact = stripPhoneFormatting(normalized);
  const digitsOnly = compact.replace(/\D/g, "");
  if (digitsOnly.length < 4) {
    return {
      valid: false,
      reason: "This phone number is too short.",
      e164: "",
      international: "",
      country: "",
    };
  }

  const isInternationalPlus = compact.startsWith("+");
  const parseDefaultCountry = isInternationalPlus ? undefined : selectedCountry;

  const lengthCheck = validatePhoneNumberLength(compact, parseDefaultCountry);
  const parsed = parsePhoneNumberFromString(compact, parseDefaultCountry);

  if (!parsed) {
    return {
      valid: false,
      reason: isInternationalPlus
        ? "Invalid country dial code or phone number."
        : "This number is not valid for the selected country.",
      e164: "",
      international: "",
      country: "",
    };
  }

  // Handle UK Ofcom official reserved test/drama mobile range (07700 900000 - 07700 900999)
  const isUkOfcomTestRange =
    parsed.countryCallingCode === "44" && /^7700900\d{3}$/.test(parsed.nationalNumber);

  if (lengthCheck === "TOO_SHORT") {
    return {
      valid: false,
      reason: "This number is too short for the selected country.",
      e164: "",
      international: "",
      country:
        parsed.country ||
        resolvePrimaryCountryForCallingCode(parsed.countryCallingCode, selectedCountry) ||
        "",
    };
  }

  if (lengthCheck === "TOO_LONG") {
    return {
      valid: false,
      reason: "This number is too long for the selected country.",
      e164: "",
      international: "",
      country:
        parsed.country ||
        resolvePrimaryCountryForCallingCode(parsed.countryCallingCode, selectedCountry) ||
        "",
    };
  }

  if (lengthCheck === "INVALID_COUNTRY") {
    return {
      valid: false,
      reason: "Invalid country dial code.",
      e164: "",
      international: "",
      country: "",
    };
  }

  if (!parsed.isValid() && !isUkOfcomTestRange) {
    return {
      valid: false,
      reason: "This number is not valid for the selected country.",
      e164: "",
      international: "",
      country:
        parsed.country ||
        resolvePrimaryCountryForCallingCode(parsed.countryCallingCode, selectedCountry) ||
        "",
    };
  }

  const detectedCountry =
    parsed.country ||
    resolvePrimaryCountryForCallingCode(
      parsed.countryCallingCode,
      isInternationalPlus ? undefined : selectedCountry
    ) ||
    selectedCountry;

  return {
    valid: true,
    reason: "Looks good",
    e164: parsed.number,
    international: parsed.formatInternational(),
    country: detectedCountry,
  };
}

/**
 * Validates any email address globally (international domains, subdomains, plus-addressing, IDNs).
 * Trims leading/trailing spaces and lowercases the domain before checking.
 */
export function validateEmail(raw: string): EmailValidationResult {
  const trimmed = raw.trim();

  if (!trimmed) {
    return {
      valid: false,
      reason: "Enter a valid email, like name@company.com",
      normalized: "",
      suggestion: null,
    };
  }

  if (/\s/.test(trimmed)) {
    return {
      valid: false,
      reason: "Email address cannot contain spaces.",
      normalized: trimmed,
      suggestion: null,
    };
  }

  const atParts = trimmed.split("@");
  if (atParts.length === 1) {
    return {
      valid: false,
      reason: "Enter a valid email, like name@company.com",
      normalized: trimmed,
      suggestion: null,
    };
  }

  if (atParts.length > 2) {
    return {
      valid: false,
      reason: "Email address cannot contain multiple @ symbols.",
      normalized: trimmed,
      suggestion: null,
    };
  }

  const [localPart, rawDomain] = atParts;
  const domain = rawDomain.toLowerCase();
  const normalized = `${localPart}@${domain}`;

  if (!localPart) {
    return {
      valid: false,
      reason: "Enter the name before @, like name@company.com.",
      normalized,
      suggestion: null,
    };
  }

  if (!domain) {
    return {
      valid: false,
      reason: "Enter a domain after @, like name@company.com.",
      normalized,
      suggestion: null,
    };
  }

  if (
    localPart.startsWith(".") ||
    localPart.endsWith(".") ||
    domain.startsWith(".") ||
    domain.endsWith(".")
  ) {
    return {
      valid: false,
      reason: "Email cannot start or end with a dot.",
      normalized,
      suggestion: null,
    };
  }

  if (localPart.includes("..") || domain.includes("..")) {
    return {
      valid: false,
      reason: "Email cannot contain consecutive dots (..).",
      normalized,
      suggestion: null,
    };
  }

  // Local part: internationalized letters/numbers + standard RFC local-part symbols
  if (localPart.length > 64 || !/^[\p{L}\p{N}!#$%&'*+/=?^_`{|}~.-]+$/u.test(localPart)) {
    return {
      valid: false,
      reason: "Enter a valid email, like name@company.com",
      normalized,
      suggestion: null,
    };
  }

  if (!domain.includes(".")) {
    return {
      valid: false,
      reason: "Domain must include a dot, like company.com.",
      normalized,
      suggestion: null,
    };
  }

  const labels = domain.split(".");
  if (domain.length > 253 || labels.some((label) => label.length === 0 || label.length > 63)) {
    return {
      valid: false,
      reason: "Enter a valid email domain, like company.com.",
      normalized,
      suggestion: null,
    };
  }

  const invalidLabel = labels.some(
    (label) =>
      label.startsWith("-") ||
      label.endsWith("-") ||
      !/^[\p{L}\p{N}-]+$/u.test(label)
  );
  if (invalidLabel) {
    return {
      valid: false,
      reason: "Domain contains invalid characters.",
      normalized,
      suggestion: null,
    };
  }

  const tld = labels[labels.length - 1];
  if (tld.length < 2 || /^\d+$/.test(tld)) {
    return {
      valid: false,
      reason: "Enter a valid email ending, like .com, .ng, or .co.uk.",
      normalized,
      suggestion: null,
    };
  }

  const suggestedDomain = COMMON_EMAIL_DOMAIN_TYPOS[domain] ?? null;
  const suggestion = suggestedDomain ? `${localPart}@${suggestedDomain}` : null;

  return {
    valid: true,
    reason: "Looks good",
    normalized,
    suggestion,
  };
}

export function isValidEmail(email: string): boolean {
  return validateEmail(email).valid;
}

export function isValidPhone(
  phone: string,
  country: CountryCode = "NG"
): boolean {
  return validatePhone(phone, country).valid;
}

export const isValidNigerianPhone = isValidPhone;

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
