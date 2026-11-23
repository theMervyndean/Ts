import React, { useState } from "react";
import { AlertCircle, Calendar, Check, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { BUTTON_PRIMARY_CLASSES, Reveal, useRippleFeedback } from "../lib/animations";
import {
  getTodayWATDateString,
  isValidEmail,
  isValidNigerianPhone,
  maskNigerianPhone,
} from "../lib/validation";
import { sendToWebhook } from "../lib/webhook";
import { HoneypotField } from "./HoneypotField";

const WAT_QUICK_SLOTS = ["09:00", "11:00", "13:30", "15:00", "16:30"] as const;

function formatWATSlotInLocalTime(dateStr: string, timeStr: string): string | null {
  if (!dateStr || !timeStr) return null;
  try {
    const dt = new Date(`${dateStr}T${timeStr}:00+01:00`);
    if (Number.isNaN(dt.getTime())) return null;
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!tz || tz === "Africa/Lagos") return null;
    const formatted = new Intl.DateTimeFormat(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    }).format(dt);
    return `${formatted} (${tz})`;
  } catch {
    return null;
  }
}

export const BookCallSection: React.FC = () => {
  const minDate = getTodayWATDateString();

  const [date, setDate] = useState(minDate);
  const [time, setTime] = useState("11:00");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<{
    date?: string;
    time?: string;
    name?: string;
    email?: string;
    phone?: string;
  }>({});
  const [shakeCount, setShakeCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<{
    referenceId: string;
    slotLabel: string;
  } | null>(null);
  const { triggerRipple, rippleElement } = useRippleFeedback();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot.trim() !== "") return;

    const nextErrors: typeof errors = {};
    if (!date) nextErrors.date = "Select a preferred date.";
    if (!time) nextErrors.time = "Select a time in WAT (UTC+1).";
    if (name.trim().length < 2) nextErrors.name = "Enter your full name.";
    if (!isValidEmail(email)) nextErrors.email = "Enter a valid email address.";
    if (!isValidNigerianPhone(phone)) {
      nextErrors.phone = "Enter a valid phone number with country code or local digits (e.g. +234 803 123 4567 or +20 10 1234 5678).";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setShakeCount((c) => c + 1);
      const fieldIdMap: Record<keyof typeof errors, string> = {
        date: "call-date",
        time: "call-time",
        name: "call-name",
        email: "call-email",
        phone: "call-phone",
      };
      const firstErrorKey = Object.keys(nextErrors)[0] as keyof typeof errors;
      const firstEl = document.getElementById(fieldIdMap[firstErrorKey]);
      if (firstEl) {
        firstEl.scrollIntoView({ behavior: "smooth", block: "center" });
        firstEl.focus({ preventScroll: true });
      }
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    setConfirmation(null);

    try {
      const response = await sendToWebhook("call_booking", {
        date,
        time,
        timezone: "WAT (UTC+1)",
        scheduledAtWAT: `${date} ${time} WAT`,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
      });

      setConfirmation({
        referenceId: response.referenceId,
        slotLabel: `${date} at ${time} WAT`,
      });
      setName("");
      setEmail("");
      setPhone("");
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Unable to schedule your consultation right now. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="book-call" className="scroll-mt-20 py-14 sm:py-16 lg:py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="bg-navy-900 text-white rounded-2xl p-6 sm:p-10 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-5 space-y-4">
              <p className="text-sm font-semibold text-orange-400">Operations Consultation</p>
              <h2
                className="font-bold tracking-tight text-white text-balance leading-tight"
                style={{ fontSize: "clamp(1.6rem, 2.8vw, 2.15rem)" }}
              >
                Book a 15-minute call with our Lagos dispatch desk
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Need custom multi-drop routes, cold-chain haulage, or Apapa customs clearing advice? Pick a date and time in West Africa Time (WAT, UTC+1).
              </p>
              <div className="pt-2 space-y-2 text-xs sm:text-sm text-slate-300">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-400 shrink-0" />
                  <span>Operating Hours: Mon–Sat, 08:00 – 18:00 WAT (UTC+1)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-orange-400 shrink-0" />
                  <span>Direct callback via phone or WhatsApp at your chosen slot</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 bg-white text-slate-900 rounded-xl p-5 sm:p-7">
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <HoneypotField id="call-hp" value={honeypot} onChange={setHoneypot} />

                {confirmation && (
                  <div
                    role="status"
                    className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-start gap-3 animate-success-pop"
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold">
                        Call booked for{" "}
                        <span className="font-mono tabular-nums">{confirmation.slotLabel}</span>.
                      </p>
                      <p className="mt-1 text-emerald-800">
                        Reference ID:{" "}
                        <span className="font-mono font-semibold tabular-nums">
                          {confirmation.referenceId}
                        </span>
                      </p>
                    </div>
                  </div>
                )}

                {submitError && (
                  <div
                    role="alert"
                    className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-900 flex items-start gap-2.5 text-sm"
                  >
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>{submitError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div key={errors.date ? `cd-${shakeCount}` : "cd"} className={errors.date ? "animate-shake" : ""}>
                    <label htmlFor="call-date" className="block text-xs font-semibold text-slate-700 mb-1">
                      Preferred Date <span className="text-orange-600">*</span>
                    </label>
                    <input
                      id="call-date"
                      type="date"
                      min={minDate}
                      required
                      value={date}
                      onChange={(e) => {
                        setDate(e.target.value);
                        if (errors.date) setErrors((p) => ({ ...p, date: undefined }));
                      }}
                      className={`w-full h-11 min-h-[44px] px-3.5 bg-white border rounded-lg text-sm font-mono text-slate-900 transition-[border-color,box-shadow] duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 ${
                        errors.date ? "border-red-400" : "border-slate-300"
                      }`}
                    />
                    {errors.date && <p className="mt-1 text-xs text-red-600">{errors.date}</p>}
                  </div>

                  <div key={errors.time ? `ct-${shakeCount}` : "ct"} className={errors.time ? "animate-shake" : ""}>
                    <label htmlFor="call-time" className="block text-xs font-semibold text-slate-700 mb-1">
                      Preferred Time (WAT · UTC+1) <span className="text-orange-600">*</span>
                    </label>
                    <input
                      id="call-time"
                      type="time"
                      required
                      value={time}
                      onChange={(e) => {
                        setTime(e.target.value);
                        if (errors.time) setErrors((p) => ({ ...p, time: undefined }));
                      }}
                      className={`w-full h-11 min-h-[44px] px-3.5 bg-white border rounded-lg text-sm font-mono text-slate-900 transition-[border-color,box-shadow] duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 ${
                        errors.time ? "border-red-400" : "border-slate-300"
                      }`}
                    />
                    {errors.time && <p className="mt-1 text-xs text-red-600">{errors.time}</p>}
                  </div>
                </div>

                {/* Quick WAT slot presets + Local Time Preview */}
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-slate-500">Quick WAT slots:</span>
                    {WAT_QUICK_SLOTS.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setTime(slot)}
                        className={`min-h-[44px] sm:min-h-[34px] px-2.5 py-1 rounded-md text-xs font-mono tabular-nums border transition-[background-color,border-color,color,transform] duration-200 active:scale-95 ${
                          time === slot
                            ? "bg-navy-900 text-white border-navy-900"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:border-orange-500"
                        }`}
                      >
                        {slot} WAT
                      </button>
                    ))}
                  </div>
                  {(() => {
                    const localPreview = formatWATSlotInLocalTime(date, time);
                    return localPreview ? (
                      <p className="text-xs text-slate-600">
                        Your local time:{" "}
                        <span className="font-mono font-semibold text-navy-900">{localPreview}</span>
                      </p>
                    ) : null;
                  })()}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div key={errors.name ? `cn-${shakeCount}` : "cn"} className={errors.name ? "animate-shake" : ""}>
                    <label htmlFor="call-name" className="block text-xs font-semibold text-slate-700 mb-1">
                      Your Name <span className="text-orange-600">*</span>
                    </label>
                    <input
                      id="call-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
                      }}
                      placeholder="Tunde Adeyemi"
                      className={`w-full h-11 min-h-[44px] px-3.5 bg-white border rounded-lg text-sm text-slate-900 transition-[border-color,box-shadow] duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 ${
                        errors.name ? "border-red-400" : "border-slate-300"
                      }`}
                    />
                    {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                  </div>

                  <div key={errors.email ? `ce-${shakeCount}` : "ce"} className={errors.email ? "animate-shake" : ""}>
                    <label htmlFor="call-email" className="block text-xs font-semibold text-slate-700 mb-1">
                      Email <span className="text-orange-600">*</span>
                    </label>
                    <input
                      id="call-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
                      }}
                      placeholder="tunde@tradehub.ng"
                      className={`w-full h-11 min-h-[44px] px-3.5 bg-white border rounded-lg text-sm text-slate-900 transition-[border-color,box-shadow] duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 ${
                        errors.email ? "border-red-400" : "border-slate-300"
                      }`}
                    />
                    {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                  </div>

                  <div key={errors.phone ? `cp-${shakeCount}` : "cp"} className={errors.phone ? "animate-shake" : ""}>
                    <label htmlFor="call-phone" className="block text-xs font-semibold text-slate-700 mb-1">
                      Phone <span className="text-orange-600">*</span>
                    </label>
                    <input
                      id="call-phone"
                      type="tel"
                      inputMode="tel"
                      required
                      value={phone}
                      onChange={(e) => {
                        setPhone(maskNigerianPhone(e.target.value));
                        if (errors.phone) setErrors((p) => ({ ...p, phone: undefined }));
                      }}
                      placeholder="+234 803 123 4567 or +20 10 1234 5678"
                      className={`w-full h-11 min-h-[44px] px-3.5 bg-white border rounded-lg text-sm font-mono text-slate-900 transition-[border-color,box-shadow] duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 ${
                        errors.phone ? "border-red-400" : "border-slate-300"
                      }`}
                    />
                    {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  onClick={triggerRipple}
                  className={`${BUTTON_PRIMARY_CLASSES} w-full sm:w-auto h-11 min-h-[44px] px-6 text-sm rounded-lg`}
                >
                  {rippleElement}
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Booking Call...</span>
                    </>
                  ) : confirmation ? (
                    <>
                      <Check className="w-4 h-4 animate-success-pop" />
                      <span>Book Another Call (WAT)</span>
                    </>
                  ) : (
                    <span>Book Consultation Call (WAT)</span>
                  )}
                </button>
              </form>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
