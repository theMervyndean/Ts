// ============================================================================
// TS LOGISTICS — CONFIGURABLE AUTOMATION WEBHOOK
// ============================================================================
// export const WEBHOOK_URL = "https://hook.us2.make.com/n4xjbwi4or9amfr3l2xeccvfcsvxlly7";
export const WEBHOOK_URL = "https://hook.eu1.make.com/is6wlj8hx8c69iodjvxl7loa7d2vg1gb"

export type FormType =
  | "quote_request"
  | "plan_selection"
  | "call_booking"
  | "support_message"
  | "tracking_lookup";

export interface WebhookPayload<T extends Record<string, unknown> = Record<string, unknown>> {
  formType: FormType;
  referenceId: string;
  submittedAt: string;
  source: "website";
  pageUrl: string;
  data?: never;
  [key: string]: unknown;
}

export interface WebhookResponse {
  ok?: boolean;
  testMode?: boolean;
  referenceId?: string;
  message?: string;
  reply?: string;
  status?: string;
  trackingId?: string;
  origin?: string;
  destination?: string;
  currentHub?: string;
  estimatedDelivery?: string;
  updatedAt?: string;
  rawText?: string;
  [key: string]: unknown;
}

/**
 * Generates a unique TS Logistics reference ID in the format TS-YYYYMMDD-XXXX
 */
export function generateReferenceId(): string {
  const now = new Date();
  const yyyy = now.getFullYear().toString();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 4; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `TS-${yyyy}${mm}${dd}-${suffix}`;
}

export function isWebhookConfigured(): boolean {
  const trimmed = WEBHOOK_URL.trim();
  return Boolean(trimmed) && trimmed !== "PASTE_WEBHOOK_URL_HERE";
}

/**
 * Sends any TS Logistics website form or lookup payload via POST JSON
 * to WEBHOOK_URL. Runs in Test Mode only when WEBHOOK_URL is the placeholder.
 */
export async function sendToWebhook<T extends Record<string, unknown>>(
  formType: FormType,
  data: T
): Promise<WebhookResponse & { referenceId: string; testMode: boolean }> {
  const referenceId = generateReferenceId();
  const submittedAt = new Date().toISOString();
  const pageUrl = typeof window !== "undefined" ? window.location.href : "";

  const payload = {
    formType,
    referenceId,
    submittedAt,
    source: "website" as const,
    pageUrl,
    ...data,
  };

  if (!isWebhookConfigured()) {
    console.log(`[TS Logistics Test Mode] ${formType} payload:`, payload);
    await new Promise((resolve) => setTimeout(resolve, 650));
    return {
      ok: true,
      testMode: true,
      referenceId,
      message: "Test mode submission recorded.",
    };
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/plain, */*",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    console.log(`[TS Logistics Webhook] (${formType}) HTTP ${response.status}`);

    const rawText = await response.text().catch(() => "");

    if (!response.ok) {
      throw new Error(
        `Server responded with HTTP ${response.status}${rawText ? `: ${rawText}` : ""}`
      );
    }

    let parsed: WebhookResponse = {};
    if (rawText.trim()) {
      try {
        const json = JSON.parse(rawText) as unknown;
        if (json && typeof json === "object" && !Array.isArray(json)) {
          parsed = json as WebhookResponse;
        } else {
          parsed = { rawText };
        }
      } catch {
        // Plain-text 2xx replies (such as "Accepted") are valid successes.
        parsed = { rawText };
      }
    }

    return {
      ok: true,
      ...parsed,
      testMode: false,
      referenceId,
    };
  } catch (err) {
    const errorMessage =
      err instanceof DOMException && err.name === "AbortError"
        ? "Request timed out after 12 seconds. Please check your connection and try again."
        : err instanceof Error
          ? err.message
          : "Unexpected network error occurred while submitting your request.";

    console.error(`[TS Logistics Webhook Error] (${formType}): ${errorMessage}`, err);
    throw new Error(errorMessage);
  } finally {
    window.clearTimeout(timeoutId);
  }
}
