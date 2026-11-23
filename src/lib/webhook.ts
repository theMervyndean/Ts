// ============================================================================
// TS LOGISTICS — CONFIGURABLE AUTOMATION WEBHOOK
// Replace the placeholder below with your n8n, Make, Zapier, or API endpoint.
// ============================================================================
export const WEBHOOK_URL = "PASTE_WEBHOOK_URL_HERE";

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
 * to WEBHOOK_URL. Runs in Test Mode when WEBHOOK_URL is still the placeholder.
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
    // Simulate realistic brief network latency so loading states are observable
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
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(
        `Server responded with HTTP ${response.status}${errorText ? `: ${errorText}` : ""}`
      );
    }

    const contentType = response.headers.get("content-type") || "";
    let parsed: WebhookResponse = {};
    if (contentType.includes("application/json")) {
      parsed = (await response.json()) as WebhookResponse;
    } else {
      const rawText = await response.text();
      if (rawText) {
        try {
          parsed = JSON.parse(rawText) as WebhookResponse;
        } catch {
          parsed = { message: rawText };
        }
      }
    }

    return {
      ok: true,
      ...parsed,
      testMode: false,
      referenceId: typeof parsed.referenceId === "string" && parsed.referenceId ? parsed.referenceId : referenceId,
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
