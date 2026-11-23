import { useEffect, useState } from "react";

export interface CurrencyOption {
  code: string;
  label: string;
  symbol: string;
}

export const SUPPORTED_CURRENCIES: CurrencyOption[] = [
  { code: "NGN", label: "Nigerian Naira (₦)", symbol: "₦" },
  { code: "USD", label: "US Dollar ($)", symbol: "$" },
  { code: "EGP", label: "Egyptian Pound (E£)", symbol: "E£" },
  { code: "GBP", label: "British Pound (£)", symbol: "£" },
  { code: "EUR", label: "Euro (€)", symbol: "€" },
  { code: "AED", label: "UAE Dirham (AED)", symbol: "AED" },
  { code: "GHS", label: "Ghanaian Cedi (₵)", symbol: "GH₵" },
  { code: "KES", label: "Kenyan Shilling (KSh)", symbol: "KSh" },
  { code: "ZAR", label: "South African Rand (R)", symbol: "R" },
  { code: "CAD", label: "Canadian Dollar (CA$)", symbol: "CA$" },
];

/**
 * Built-in baseline rates relative to 1 NGN so converted prices render immediately
 * without waiting on network I/O or failing offline.
 */
export const FALLBACK_RATES_FROM_NGN: Record<string, number> = {
  NGN: 1,
  USD: 0.00062,
  EGP: 0.0308,
  GBP: 0.00049,
  EUR: 0.00058,
  AED: 0.00228,
  GHS: 0.0098,
  KES: 0.08,
  ZAR: 0.0112,
  CAD: 0.00086,
};

const TIMEZONE_TO_CURRENCY: Record<string, string> = {
  "Africa/Lagos": "NGN",
  "Africa/Cairo": "EGP",
  "Europe/London": "GBP",
  "Africa/Accra": "GHS",
  "Africa/Nairobi": "KES",
  "Africa/Johannesburg": "ZAR",
  "Asia/Dubai": "AED",
  "America/Toronto": "CAD",
  "America/Vancouver": "CAD",
  "America/Montreal": "CAD",
};

const EUROZONE_TIMEZONES = new Set([
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Madrid",
  "Europe/Rome",
  "Europe/Amsterdam",
  "Europe/Brussels",
  "Europe/Vienna",
  "Europe/Dublin",
  "Europe/Lisbon",
  "Europe/Athens",
  "Europe/Helsinki",
]);

export function detectUserCurrency(): { currency: string; timeZone: string } {
  if (typeof window === "undefined") {
    return { currency: "NGN", timeZone: "Africa/Lagos" };
  }

  let timeZone = "";
  try {
    timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  } catch {
    timeZone = "";
  }

  if (TIMEZONE_TO_CURRENCY[timeZone]) {
    return { currency: TIMEZONE_TO_CURRENCY[timeZone], timeZone };
  }
  if (EUROZONE_TIMEZONES.has(timeZone)) {
    return { currency: "EUR", timeZone };
  }
  if (timeZone.startsWith("America/")) {
    return { currency: "USD", timeZone };
  }

  const lang = (navigator.language || "").toLowerCase();
  if (lang.includes("-ng")) return { currency: "NGN", timeZone };
  if (lang.includes("-eg")) return { currency: "EGP", timeZone };
  if (lang.includes("-gb")) return { currency: "GBP", timeZone };
  if (lang.includes("-gh")) return { currency: "GHS", timeZone };
  if (lang.includes("-ke")) return { currency: "KES", timeZone };
  if (lang.includes("-za")) return { currency: "ZAR", timeZone };
  if (lang.includes("-ae")) return { currency: "AED", timeZone };
  if (lang.includes("-ca")) return { currency: "CAD", timeZone };
  if (lang.includes("-us")) return { currency: "USD", timeZone };

  // Default non-Nigerian global fallback to USD
  return { currency: timeZone ? "USD" : "NGN", timeZone };
}

export function formatConvertedFromNaira(
  amountNgn: number,
  currencyCode: string,
  rates: Record<string, number>
): string {
  if (currencyCode === "NGN") {
    return `₦${Math.round(amountNgn).toLocaleString("en-NG")}`;
  }

  const rate = rates[currencyCode] ?? FALLBACK_RATES_FROM_NGN[currencyCode] ?? FALLBACK_RATES_FROM_NGN.USD;
  const converted = amountNgn * rate;

  // Round cleanly for display readability
  const rounded =
    converted >= 1000
      ? Math.round(converted / 10) * 10
      : converted >= 100
        ? Math.round(converted)
        : Math.max(1, Math.round(converted));

  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 0,
    }).format(rounded);
  } catch {
    const option = SUPPORTED_CURRENCIES.find((c) => c.code === currencyCode);
    return `${option?.symbol || currencyCode + " "}${rounded.toLocaleString()}`;
  }
}

export function useAutoCurrency() {
  const [detected] = useState(() => detectUserCurrency());
  const [currency, setCurrency] = useState<string>(detected.currency);
  const [rates, setRates] = useState<Record<string, number>>(FALLBACK_RATES_FROM_NGN);
  const [isLiveRate, setIsLiveRate] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 4000);

    fetch("https://open.er-api.com/v6/latest/NGN", { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { rates?: Record<string, number> } | null) => {
        if (data && data.rates && typeof data.rates.USD === "number") {
          setRates((prev) => ({ ...prev, ...data.rates, NGN: 1 }));
          setIsLiveRate(true);
        }
      })
      .catch(() => {
        // Silently keep built-in fallback rates
      })
      .finally(() => {
        window.clearTimeout(timer);
      });

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, []);

  return {
    currency,
    setCurrency,
    detectedCurrency: detected.currency,
    timeZone: detected.timeZone,
    rates,
    isLiveRate,
  };
}
