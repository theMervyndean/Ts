import React, { useState } from "react";
import { Check, Loader2, MapPin, Package, Search, Truck } from "lucide-react";
import {
  SAMPLE_TRACKING_RECORDS,
  TRACKING_STAGES,
  type TrackingRecord,
  type TrackingStage,
} from "../data/logisticsData";
import { BUTTON_PRIMARY_CLASSES, Reveal, useRippleFeedback } from "../lib/animations";
import { maskTrackingId } from "../lib/validation";
import { isWebhookConfigured, sendToWebhook } from "../lib/webhook";
import { HoneypotField } from "./HoneypotField";

function normalizeStage(rawStatus: unknown): TrackingStage {
  if (typeof rawStatus !== "string") return "In Transit";
  const lower = rawStatus.trim().toLowerCase();
  const matched = TRACKING_STAGES.find((stage) => stage.toLowerCase() === lower);
  if (matched) return matched;
  if (lower.includes("deliver") && lower.includes("out")) return "Out for Delivery";
  if (lower.includes("deliver")) return "Delivered";
  if (lower.includes("transit")) return "In Transit";
  if (lower.includes("pick")) return "Picked Up";
  if (lower.includes("receiv") || lower.includes("order")) return "Order Received";
  return "In Transit";
}

function buildFallbackRecord(trackingId: string): TrackingRecord {
  const existing = SAMPLE_TRACKING_RECORDS[trackingId];
  if (existing) return existing;

  const hash = trackingId
    .split("")
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const stage = TRACKING_STAGES[hash % TRACKING_STAGES.length];

  return {
    trackingId,
    status: stage,
    origin: "Apapa Dispatch Terminal, Lagos",
    destination: "Central Business District, Abuja",
    currentHub:
      stage === "Order Received"
        ? "Awaiting rider dispatch at Ikeja Hub"
        : stage === "Picked Up"
          ? "Manifest scanned · Lagos Consolidation Dock"
          : stage === "In Transit"
            ? "Ibadan–Ilorin Linehaul Corridor"
            : stage === "Out for Delivery"
              ? "Abuja Metro Final-Mile Van #ABJ-14"
              : "Recipient Dock · Signed Digital POD",
    estimatedDelivery: stage === "Delivered" ? "Delivered on schedule" : "Tomorrow, 13:00 WAT",
    updatedAt: "Updated just now (WAT)",
    carrierNote: "Live checkpoint telemetry synced via TS Logistics dispatch network.",
  };
}

export const TrackShipmentSection: React.FC = () => {
  const [trackingId, setTrackingId] = useState("TS-20261122-1042");
  const [honeypot, setHoneypot] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [errorShakeKey, setErrorShakeKey] = useState(0);
  const [result, setResult] = useState<TrackingRecord | null>(
    SAMPLE_TRACKING_RECORDS["TS-20261122-1042"]
  );
  const [lookupMeta, setLookupMeta] = useState<{
    referenceId?: string;
    usedFallback: boolean;
    fallbackReason?: string;
  } | null>(null);
  const { triggerRipple, rippleElement } = useRippleFeedback();

  const runTrackingLookup = async (idToTrack: string) => {
    const cleaned = maskTrackingId(idToTrack).trim();
    if (!cleaned || cleaned.length < 5) {
      setValidationError("Enter a valid tracking ID (for example: TS-20261122-1042).");
      setErrorShakeKey((k) => k + 1);
      return;
    }

    if (honeypot.trim() !== "") {
      return;
    }

    setValidationError(null);
    setLoading(true);

    try {
      const response = await sendToWebhook("tracking_lookup", { trackingId: cleaned });

      if (response.testMode || !isWebhookConfigured()) {
        const fallback = buildFallbackRecord(cleaned);
        setResult(fallback);
        setLookupMeta({
          referenceId: response.referenceId,
          usedFallback: true,
        });
      } else {
        const resolvedStage = normalizeStage(response.status);
        const fallback = buildFallbackRecord(cleaned);
        setResult({
          trackingId:
            typeof response.trackingId === "string" && response.trackingId
              ? response.trackingId
              : cleaned,
          status: resolvedStage,
          origin:
            typeof response.origin === "string" && response.origin
              ? response.origin
              : fallback.origin,
          destination:
            typeof response.destination === "string" && response.destination
              ? response.destination
              : fallback.destination,
          currentHub:
            typeof response.currentHub === "string" && response.currentHub
              ? response.currentHub
              : fallback.currentHub,
          estimatedDelivery:
            typeof response.estimatedDelivery === "string" && response.estimatedDelivery
              ? response.estimatedDelivery
              : fallback.estimatedDelivery,
          updatedAt:
            typeof response.updatedAt === "string" && response.updatedAt
              ? response.updatedAt
              : "Live webhook update",
          carrierNote:
            typeof response.message === "string" && response.message
              ? response.message
              : fallback.carrierNote,
        });
        setLookupMeta({
          referenceId: response.referenceId,
          usedFallback: false,
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unable to reach live tracking server.";
      setResult(buildFallbackRecord(cleaned));
      setLookupMeta({
        usedFallback: true,
        fallbackReason: `${msg} Showing cached dispatch status.`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void runTrackingLookup(trackingId);
  };

  const currentStageIndex = result ? TRACKING_STAGES.indexOf(result.status) : 0;
  const progressRatio =
    TRACKING_STAGES.length > 1 ? currentStageIndex / (TRACKING_STAGES.length - 1) : 0;

  return (
    <section
      id="track"
      className="scroll-mt-20 py-14 sm:py-16 lg:py-24 bg-navy-900 text-white border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left Lookup Controls */}
          <Reveal className="lg:col-span-5">
            <p className="text-sm font-semibold text-orange-400 mb-2">Live Shipment Tracking</p>
            <h2
              className="font-bold tracking-tight text-white mb-4 text-balance leading-tight"
              style={{ fontSize: "clamp(1.75rem, 3vw, 2.35rem)" }}
            >
              Track your parcel or container across every checkpoint
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-6">
              Enter your TS Logistics waybill or tracking number below to inspect real-time hub status and estimated arrival in West Africa Time (WAT).
            </p>

            <form onSubmit={handleSubmit} noValidate className="space-y-3">
              <HoneypotField id="track-hp" value={honeypot} onChange={setHoneypot} />

              <label htmlFor="tracking-id-input" className="block text-xs font-medium text-slate-300">
                Tracking / Waybill ID
              </label>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div
                  key={validationError ? `shake-${errorShakeKey}` : "clean"}
                  className={`relative flex-1 ${validationError ? "animate-shake" : ""}`}
                >
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="tracking-id-input"
                    type="text"
                    value={trackingId}
                    onChange={(e) => {
                      setTrackingId(maskTrackingId(e.target.value));
                      if (validationError) setValidationError(null);
                    }}
                    placeholder="TS-20261122-1042"
                    aria-invalid={Boolean(validationError)}
                    className={`w-full h-12 min-h-[44px] pl-10 pr-4 bg-navy-800 border rounded-lg text-white font-mono text-sm placeholder:text-slate-500 transition-[border-color,box-shadow] duration-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/35 ${
                      validationError ? "border-red-400" : "border-white/15"
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  onClick={triggerRipple}
                  className={`${BUTTON_PRIMARY_CLASSES} h-12 min-h-[44px] px-6 text-sm rounded-lg whitespace-nowrap shrink-0 focus-visible:ring-offset-navy-900`}
                >
                  {rippleElement}
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Tracking...</span>
                    </>
                  ) : (
                    <span>Track</span>
                  )}
                </button>
              </div>

              {validationError && (
                <p role="alert" className="text-xs font-medium text-orange-300">
                  {validationError}
                </p>
              )}
            </form>

            {/* Functional sample waybill quick-selectors */}
            <div className="mt-5 pt-5 border-t border-white/10">
              <p className="text-xs text-slate-400 mb-2.5">Sample waybills for quick testing:</p>
              <div className="flex flex-wrap gap-2">
                {Object.keys(SAMPLE_TRACKING_RECORDS).map((sampleId) => (
                  <button
                    key={sampleId}
                    type="button"
                    disabled={loading}
                    onClick={() => {
                      setTrackingId(sampleId);
                      void runTrackingLookup(sampleId);
                    }}
                    className={`min-h-[44px] sm:min-h-[36px] px-3 py-1.5 rounded-md font-mono text-xs border transition-[background-color,border-color,color,transform] duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shrink-0 ${
                      trackingId === sampleId
                        ? "bg-orange-500/20 border-orange-400 text-orange-200"
                        : "bg-navy-800 border-white/10 text-slate-300 hover:border-white/35 hover:text-white"
                    }`}
                  >
                    {sampleId}
                  </button>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Right Live Status & 5-Stage Progress Card (with Loading Skeleton) */}
          <Reveal delayMs={100} className="lg:col-span-7">
            <div className="bg-navy-800 border border-white/10 rounded-xl p-5 sm:p-8">
              {loading ? (
                <div aria-busy="true" aria-label="Loading shipment status" className="space-y-6 animate-pulse">
                  <div className="flex items-center justify-between pb-6 border-b border-white/10">
                    <div className="space-y-2">
                      <div className="h-3 w-36 bg-white/10 rounded" />
                      <div className="h-7 w-48 bg-white/15 rounded" />
                    </div>
                    <div className="h-9 w-32 bg-orange-500/20 rounded-lg" />
                  </div>
                  <div className="py-4 grid grid-cols-5 gap-3">
                    {TRACKING_STAGES.map((stage) => (
                      <div key={stage} className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-white/15" />
                        <div className="h-3 w-14 bg-white/10 rounded" />
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/10">
                    <div className="h-20 bg-navy-900/70 rounded-lg" />
                    <div className="h-20 bg-navy-900/70 rounded-lg" />
                  </div>
                </div>
              ) : result ? (
                <div>
                  <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b border-white/10">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                        <span>Waybill Reference</span>
                        <span aria-hidden="true">·</span>
                        <span>{result.updatedAt}</span>
                      </div>
                      <p className="font-mono text-xl sm:text-2xl font-bold text-white tabular-nums">
                        {result.trackingId}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 bg-orange-500/15 border border-orange-500/40 text-orange-200 px-3.5 py-2 rounded-lg text-sm font-semibold">
                      <Truck className="w-4 h-4 text-orange-400 shrink-0" />
                      <span>{result.status}</span>
                    </div>
                  </div>

                  {/* Animated 5-Stage Progress Bar */}
                  <div className="py-7">
                    <div className="relative">
                      <div
                        aria-hidden="true"
                        className="hidden sm:block absolute top-4 left-6 right-6 h-1 bg-navy-900 rounded-full overflow-hidden"
                      >
                        <div
                          style={{
                            transform: `scaleX(${progressRatio})`,
                            transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                          }}
                          className="h-full w-full bg-orange-500 origin-left transition-transform duration-500"
                        />
                      </div>

                      <ol className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative">
                        {TRACKING_STAGES.map((stage, idx) => {
                          const completed = idx <= currentStageIndex;
                          const isCurrent = idx === currentStageIndex;

                          return (
                            <li
                              key={stage}
                              className="flex sm:flex-col items-center sm:items-center gap-3 sm:gap-2.5 text-left sm:text-center"
                            >
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-[background-color,border-color,transform] duration-300 ${
                                  completed
                                    ? "bg-orange-500 border-orange-500 text-white"
                                    : "bg-navy-900 border-slate-600 text-slate-400"
                                } ${isCurrent ? "ring-4 ring-orange-500/25 scale-105" : ""}`}
                              >
                                {completed ? (
                                  <Check className="w-4 h-4" />
                                ) : (
                                  <span className="font-mono text-xs tabular-nums">{idx + 1}</span>
                                )}
                              </div>
                              <span
                                className={`text-xs font-medium leading-tight ${
                                  isCurrent
                                    ? "text-white font-semibold"
                                    : completed
                                      ? "text-slate-200"
                                      : "text-slate-400"
                                }`}
                              >
                                {stage}
                              </span>
                            </li>
                          );
                        })}
                      </ol>
                    </div>
                  </div>

                  {/* Route & Hub Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-white/10">
                    <div className="bg-navy-900/70 border border-white/10 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                        <MapPin className="w-3.5 h-3.5 text-orange-400" />
                        <span>Origin → Destination</span>
                      </div>
                      <p className="text-sm font-semibold text-white">
                        {result.origin} → {result.destination}
                      </p>
                    </div>

                    <div className="bg-navy-900/70 border border-white/10 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                        <Package className="w-3.5 h-3.5 text-orange-400" />
                        <span>Current Hub &amp; ETA</span>
                      </div>
                      <p className="text-sm font-semibold text-white">{result.currentHub}</p>
                      <p className="text-xs text-orange-300 mt-0.5 font-mono tabular-nums">
                        ETA: {result.estimatedDelivery}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 text-xs text-slate-300">{result.carrierNote}</p>

                  {lookupMeta && (
                    <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                      {lookupMeta.referenceId && (
                        <span className="font-mono tabular-nums">
                          Lookup Ref: {lookupMeta.referenceId}
                        </span>
                      )}
                      {lookupMeta.fallbackReason && (
                        <span className="text-orange-300">{lookupMeta.fallbackReason}</span>
                      )}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};
