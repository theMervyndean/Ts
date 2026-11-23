# TS Logistics — Automation Practice Website

Welcome to the **TS Logistics** practice website. This is a fictional Nigerian logistics and delivery company site built for our team to practise building real **sales, customer support, and accounts automations** using tools like Make, n8n, Zapier, Google Sheets, Slack, and email/CRM workflows.

---

## 1. Project Overview

**TS Logistics** simulates a commercial courier, haulage, warehousing, and port-clearing business operating across Nigeria (Lagos, Abuja, Port Harcourt, Kano, and international corridors).

Every interactive form on the page—quoting, pricing plan sign-ups, consultation call bookings, live support chat, and shipment tracking—sends structured JSON payloads through a single webhook helper so you can connect and test end-to-end automations without touching UI code.

---

## 2. Tech Stack & Folder Structure

- **Framework:** React 19 + TypeScript + Vite
- **Styling & Animation:** Tailwind CSS v4 + Lucide Icons + Motion
- **Build Output:** Static SPA (`dist/`)

```text
├── index.html               # HTML entry point, page title, metadata & Google Fonts
├── package.json             # Project dependencies and npm scripts
├── vite.config.ts           # Vite build configuration
└── src/
    ├── App.tsx              # Main single-page layout assembling all sections
    ├── index.css            # Global theme colors, fonts, cursors & CSS animations
    ├── assets/              # Bundled local images (compressed WebP logistics photos)
    ├── components/          # UI sections (Navbar, Hero, Services, Track, Quote, Pricing, Book Call, FAQ/Support, Footer)
    ├── data/                # Static website content (services, Naira pricing, FAQ, sample tracking records, image imports)
    └── lib/                 # Shared logic: webhook.ts (POST + Test Mode), validation.ts (email/phone masks), animations.tsx
```

---

## 3. Running Locally

Make sure you have **Node.js (v18+)** installed, then run:

```bash
npm install
npm run dev
```

Vite will start the development server at `http://localhost:3000`.

---

## 4. Building & Deploying to Netlify

To build the production site locally:

```bash
npm run build
```

This creates a ready-to-deploy static bundle inside the **`dist/`** folder.

### Deploy to Netlify
1. Push your repository to GitHub (or drag-and-drop the `dist/` folder in Netlify).
2. Set the **Build command** to:
   ```text
   npm run build
   ```
3. Set the **Publish directory** to:
   ```text
   dist
   ```
4. Deploy! All WebP images and scripts are bundled inside `dist/` automatically.

---

## 5. Webhook Setup & Test Mode

Every form and lookup on the website sends an HTTP `POST` request with a JSON body via one reusable function: `sendToWebhook(formType, data)` inside **`src/lib/webhook.ts`**.

At the top of `src/lib/webhook.ts` (line 5), you will find:

```ts
export const WEBHOOK_URL = "PASTE_WEBHOOK_URL_HERE";
```

### How Test Mode Works
While `WEBHOOK_URL` is still set to `"PASTE_WEBHOOK_URL_HERE"` (or left empty):
- The website automatically runs in **Test Mode**.
- No network request is sent.
- The full JSON payload is printed in your browser's **Developer Console** (`F12` → Console) prefixed with `[TS Logistics Test Mode]`.
- The UI still shows the loading spinner and success confirmation with a generated `referenceId` (`TS-YYYYMMDD-XXXX`), and tracking/support boxes display realistic fallback responses.

### Connecting Your Real Webhook
1. Create a Custom Webhook trigger in Make, n8n, or Zapier and copy its URL.
2. Open **`src/lib/webhook.ts`**.
3. Replace `"PASTE_WEBHOOK_URL_HERE"` with your personal test webhook URL while practising locally:
   ```ts
   export const WEBHOOK_URL = "https://your-automation-provider.example/webhook/your-id";
   ```
4. Save the file and submit any form on the site to see live data arrive in your scenario.

> **Important:** Never commit your personal or live webhook URL back to Git. See **Team Rules** below.

---

## 6. Payload Reference by `formType`

All form submissions call `sendToWebhook(formType, data)` and send a flat JSON object containing the automation metadata fields plus the form's fields.

| `formType` | Website Section / Form | Payload Fields (Exact Code Names) |
| :--- | :--- | :--- |
| `quote_request` | **Get a Quote** (`QuoteSection.tsx`) | `fullName`, `email`, `phone`, `companyName`, `serviceType`, `pickupLocation`, `deliveryLocation`, `packageDescription`, `estimatedWeightKg`, `preferredPickupDate`, `additionalNotes` |
| `plan_selection` | **Pricing → Choose Plan** (`PricingSection.tsx`) | `name`, `email`, `company`, `plan` |
| `call_booking` | **Book a Call** (`BookCallSection.tsx`) | `date`, `time`, `timezone`, `scheduledAtWAT`, `name`, `email`, `phone` |
| `support_message` | **Contact / Support Chat** (`FaqAndContactSection.tsx`) | `message` |
| `tracking_lookup` | **Track Shipment** (`TrackShipmentSection.tsx`) | `trackingId` |

### Notes on Expected Webhook JSON Responses
- **`tracking_lookup`:** Your webhook can return JSON with `{ "status": "In Transit", "origin": "...", "destination": "...", "currentHub": "...", "estimatedDelivery": "...", "updatedAt": "...", "message": "..." }`. Valid `status` values are `"Order Received"`, `"Picked Up"`, `"In Transit"`, `"Out for Delivery"`, and `"Delivered"`.
- **`support_message`:** Your webhook can return JSON with `{ "reply": "Your custom response text here" }` (or `"message"`), and the chat box will display it directly to the visitor.

---

## 7. Automation Metadata Fields (Included in Every Payload)

`sendToWebhook` automatically attaches these five fields to **every** payload:

| Field | Format / Example | Purpose |
| :--- | :--- | :--- |
| `formType` | `"quote_request"` | Lets one single webhook route to different automation branches (Router/Switch) |
| `referenceId` | `"TS-20261123-K7M4"` | Unique tracking/ticket ID (`TS-YYYYMMDD-XXXX`) to store in sheets, emails, and replies |
| `submittedAt` | `"2026-11-23T09:28:00.000Z"` | UTC ISO 8601 timestamp of submission |
| `source` | `"website"` | Identifies submissions coming from this landing page |
| `pageUrl` | `"https://your-site.netlify.app/#quote"` | Exact page URL where the user submitted the form |

---

## 8. Team Practice Exercises

Start by creating one main router in Make or n8n that splits on `formType`, then build these 5 workflows:

1. **`quote_request` (Sales Lead Pipeline)**
   - **Flow:** Webhook receives `quote_request` → append row to a *Quotes* Google Sheet (using `referenceId` as key) → use an AI step to draft a polite Naira estimate & next steps → send confirmation email to `email` → post a Slack/Teams alert for Sales with `fullName`, `serviceType`, `pickupLocation`, `deliveryLocation`, and `estimatedWeightKg`.
2. **`plan_selection` (Accounts & Retainer Onboarding)**
   - **Flow:** Webhook receives `plan_selection` → log new retainer request in an *Accounts* tracker (`company`, `plan`, `referenceId`) → generate a draft pro-forma invoice or onboarding checklist → email `email` with the selected plan summary → notify Accounts channel.
3. **`call_booking` (Sales Consultation Scheduling)**
   - **Flow:** Webhook receives `call_booking` → parse `date` and `time` in `WAT (UTC+1)` (`scheduledAtWAT`) → create a Google Calendar event → send calendar invite to `email` → send an internal reminder 15 minutes before the call.
4. **`support_message` (AI Customer Support Responder)**
   - **Flow:** Webhook receives `support_message` → pass `message` to an AI assistant loaded with TS Logistics' FAQ/SLA rules → return a Webhook Response (`200 OK` JSON) containing `{ "reply": "..." }` so the visitor sees the live AI answer right inside the chat box!
5. **`tracking_lookup` (Live Shipment Lookup)**
   - **Flow:** Webhook receives `tracking_lookup` → search a *Shipments* Google Sheet or Airtable base for `trackingId` → return a Webhook Response (`200 OK` JSON) with `{ "status": "In Transit", "origin": "...", "destination": "...", "currentHub": "...", "estimatedDelivery": "..." }` so the 5-stage progress bar updates dynamically.

---

## 9. Team Rules

1. **Use fake test data only.** Never enter real customer names, real personal phone numbers, real emails, or real shipment details when practising.
2. **Never rename payload fields without telling the automation owner.** Changing a field like `estimatedWeightKg` or `referenceId` in React will silently break everyone's Make/n8n/Zapier mappings.
3. **Never commit secrets or real endpoints to Git.** Before running `git commit`, make sure `WEBHOOK_URL` in `src/lib/webhook.ts` is still `"PASTE_WEBHOOK_URL_HERE"`, and never commit real WhatsApp numbers, API keys, or customer records.

---

## 10. Troubleshooting

### CORS Errors in Browser Console
- **Symptom:** Console shows `Access to fetch at '...' from origin '...' has been blocked by CORS policy`.
- **Fix:** Make sure your webhook endpoint allows cross-origin `POST` requests (`Access-Control-Allow-Origin: *` and `Access-Control-Allow-Headers: Content-Type, Accept`). In Make/n8n/Zapier, ensure your Webhook node responds properly to browser preflight (`OPTIONS`) requests or test with a proxy/Netlify function if your tool blocks browser `POST` headers.

### Make / n8n Scenario Not Receiving Data
- **Checklist:**
  1. Confirm `WEBHOOK_URL` in `src/lib/webhook.ts` is **not** `"PASTE_WEBHOOK_URL_HERE"` (if it is, Test Mode logs to the console instead of calling the network).
  2. In Make, click **"Run once"** (or turn the scenario **ON**) so the webhook is actively listening. In n8n, use the **Production URL** when active or click **"Listen for test event"** when using the Test URL.
  3. Open browser DevTools (`F12`) → **Network** tab and check if the `POST` request returned `200 OK` or `404`/`410`.
  4. Remember that every form has a hidden anti-bot honeypot field—do not auto-fill hidden fields with browser autofill extensions.

### Images Not Loading
- **Checklist:**
  1. Always run `npm run build` and deploy the **`dist/`** directory—do not deploy the raw `src/` folder directly.
  2. Check that all `.webp` files exist in `src/assets/images/` and are imported in `src/data/logisticsData.ts`.
  3. If an image fails due to an offline network drop, the card and hero sections automatically display a solid deep-navy fallback background so the layout stays intact.
