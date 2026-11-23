import React, { useEffect, useState } from "react";
import { AlertCircle, Check, CheckCircle2, Loader2, MessageCircle, ShieldCheck } from "lucide-react";
import {
  getWhatsAppUrl,
  SERVICE_TYPE_OPTIONS,
} from "../data/logisticsData";
import { BUTTON_PRIMARY_CLASSES, Reveal, useRippleFeedback } from "../lib/animations";
import {
  getTodayWATDateString,
  isValidEmail,
  isValidNigerianPhone,
  maskNigerianPhone,
  maskWeightKg,
} from "../lib/validation";
import { sendToWebhook } from "../lib/webhook";
import { HoneypotField } from "./HoneypotField";

interface QuoteSectionProps {
  preselectedService: string;
}

interface QuoteFormState {
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  serviceType: string;
  pickupLocation: string;
  deliveryLocation: string;
  packageDescription: string;
  estimatedWeightKg: string;
  preferredPickupDate: string;
  additionalNotes: string;
}

type QuoteErrors = Partial<Record<keyof QuoteFormState, string>>;

export const QuoteSection: React.FC<QuoteSectionProps> = ({ preselectedService }) => {
  const minDate = getTodayWATDateString();

  const [form, setForm] = useState<QuoteFormState>({
    fullName: "",
    email: "",
    phone: "",
    companyName: "",
    serviceType: preselectedService || SERVICE_TYPE_OPTIONS[0],
    pickupLocation: "",
    deliveryLocation: "",
    packageDescription: "",
    estimatedWeightKg: "",
    preferredPickupDate: minDate,
    additionalNotes: "",
  });

  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<QuoteErrors>({});
  const [shakeCount, setShakeCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successRef, setSuccessRef] = useState<string | null>(null);
  const { triggerRipple, rippleElement } = useRippleFeedback();

  useEffect(() => {
    if (preselectedService) {
      setForm((prev) => ({ ...prev, serviceType: preselectedService }));
    }
  }, [preselectedService]);

  const updateField = <K extends keyof QuoteFormState>(field: K, value: QuoteFormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (submitError) setSubmitError(null);
  };

  const validate = (): boolean => {
    const next: QuoteErrors = {};

    if (form.fullName.trim().length < 2) {
      next.fullName = "Enter your full name.";
    }
    if (!isValidEmail(form.email)) {
      next.email = "Enter a valid email address (e.g. name@company.ng).";
    }
    if (!isValidNigerianPhone(form.phone)) {
      next.phone = "Enter a valid phone number (e.g. 0803 123 4567, +234 803 123 4567, or +20 10 1234 5678).";
    }
    if (!form.serviceType) {
      next.serviceType = "Select a logistics service.";
    }
    if (form.pickupLocation.trim().length < 3) {
      next.pickupLocation = "Enter the pickup city or street area.";
    }
    if (form.deliveryLocation.trim().length < 3) {
      next.deliveryLocation = "Enter the destination city or address.";
    }
    if (form.packageDescription.trim().length < 3) {
      next.packageDescription = "Briefly describe the items being shipped.";
    }
    const weightVal = parseFloat(form.estimatedWeightKg);
    if (!form.estimatedWeightKg || Number.isNaN(weightVal) || weightVal <= 0) {
      next.estimatedWeightKg = "Enter an estimated weight greater than 0 kg.";
    }
    if (!form.preferredPickupDate) {
      next.preferredPickupDate = "Select your preferred pickup date.";
    }

    setErrors(next);
    if (Object.keys(next).length > 0) {
      setShakeCount((c) => c + 1);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot.trim() !== "") {
      return;
    }
    if (!validate()) return;

    setSubmitting(true);
    setSubmitError(null);
    setSuccessRef(null);

    try {
      const response = await sendToWebhook("quote_request", {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        companyName: form.companyName.trim(),
        serviceType: form.serviceType,
        pickupLocation: form.pickupLocation.trim(),
        deliveryLocation: form.deliveryLocation.trim(),
        packageDescription: form.packageDescription.trim(),
        estimatedWeightKg: Number(form.estimatedWeightKg),
        preferredPickupDate: form.preferredPickupDate,
        additionalNotes: form.additionalNotes.trim(),
      });

      setSuccessRef(response.referenceId);
      setForm({
        fullName: "",
        email: "",
        phone: "",
        companyName: "",
        serviceType: preselectedService || SERVICE_TYPE_OPTIONS[0],
        pickupLocation: "",
        deliveryLocation: "",
        packageDescription: "",
        estimatedWeightKg: "",
        preferredPickupDate: minDate,
        additionalNotes: "",
      });
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "We could not submit your quote request right now. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass = (hasError?: string) =>
    `w-full h-11 min-h-[44px] px-3.5 bg-white border rounded-lg text-sm text-slate-900 placeholder:text-slate-400 transition-[border-color,box-shadow] duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 ${
      hasError ? "border-red-400" : "border-slate-300"
    }`;

  return (
    <section
      id="quote"
      className="scroll-mt-20 py-14 sm:py-16 lg:py-24 bg-white border-b border-slate-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Dispatch SLA & Route Summary (stacks above form on mobile) */}
          <Reveal className="lg:col-span-5 space-y-6">
            <div>
              <p className="text-sm font-semibold text-orange-600 mb-2">Request a Dispatch Quote</p>
              <h2
                className="font-bold tracking-tight text-navy-900 text-balance leading-tight"
                style={{ fontSize: "clamp(1.75rem, 3vw, 2.35rem)" }}
              >
                Get locked-in Naira pricing in under 15 minutes
              </h2>
              <p className="mt-3 text-base text-slate-600 leading-relaxed">
                Tell our Lagos operations desk what you are moving, where it leaves from, and when you need pickup. We reply with a full route breakdown and tariff sheet.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4">
              <h3 className="text-sm font-bold text-navy-900">Typical Corridor Turnarounds</h3>
              <dl className="divide-y divide-slate-200 text-sm">
                <div className="py-2.5 flex items-center justify-between gap-4">
                  <dt className="text-slate-600">Lagos Intra-City Express</dt>
                  <dd className="font-mono tabular-nums font-semibold text-navy-900">4–6 hours</dd>
                </div>
                <div className="py-2.5 flex items-center justify-between gap-4">
                  <dt className="text-slate-600">Lagos ↔ Abuja / Benin / PH</dt>
                  <dd className="font-mono tabular-nums font-semibold text-navy-900">24–48 hours</dd>
                </div>
                <div className="py-2.5 flex items-center justify-between gap-4">
                  <dt className="text-slate-600">Lagos ↔ Kano / Kaduna</dt>
                  <dd className="font-mono tabular-nums font-semibold text-navy-900">48–72 hours</dd>
                </div>
                <div className="py-2.5 flex items-center justify-between gap-4">
                  <dt className="text-slate-600">Apapa &amp; Tin Can Clearing</dt>
                  <dd className="font-mono tabular-nums font-semibold text-navy-900">48–72 hours</dd>
                </div>
              </dl>
            </div>

            <div className="flex items-start gap-3 text-sm text-slate-600">
              <ShieldCheck className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
              <p>
                Every quote includes verified driver assignment, waybill barcode generation, and baseline Goods-in-Transit insurance.
              </p>
            </div>
          </Reveal>

          {/* Right Main Lead Form (1 col mobile, 2 cols tablet & desktop) */}
          <Reveal delayMs={80} className="lg:col-span-7">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 sm:p-8">
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <HoneypotField id="quote-hp" value={honeypot} onChange={setHoneypot} />

                {successRef && (
                  <div
                    role="status"
                    className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-start gap-3 animate-success-pop"
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold">Quote request received by TS Logistics dispatch.</p>
                      <p className="mt-1 text-emerald-800">
                        Reference ID:{" "}
                        <span className="font-mono font-semibold tabular-nums">{successRef}</span>. Our coordinator will send your Naira tariff shortly.
                      </p>
                    </div>
                  </div>
                )}

                {submitError && (
                  <div
                    role="alert"
                    className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-900 flex items-start gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div className="text-sm space-y-1.5">
                      <p className="font-semibold">Unable to submit quote request</p>
                      <p className="text-red-800">{submitError}</p>
                      <p className="text-red-900">
                        You can also reach dispatch directly on{" "}
                        <a
                          href={getWhatsAppUrl("Hello TS Logistics, I need a delivery quote")}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-semibold underline underline-offset-2 hover:text-orange-700"
                        >
                          <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>WhatsApp</span>
                        </a>
                        .
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div key={errors.fullName ? `fn-${shakeCount}` : "fn"} className={errors.fullName ? "animate-shake" : ""}>
                    <label htmlFor="quote-full-name" className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Full Name <span className="text-orange-600">*</span>
                    </label>
                    <input
                      id="quote-full-name"
                      type="text"
                      required
                      value={form.fullName}
                      onChange={(e) => updateField("fullName", e.target.value)}
                      placeholder="Chinedu Okafor"
                      className={fieldClass(errors.fullName)}
                    />
                    {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>}
                  </div>

                  <div key={errors.email ? `em-${shakeCount}` : "em"} className={errors.email ? "animate-shake" : ""}>
                    <label htmlFor="quote-email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Email Address <span className="text-orange-600">*</span>
                    </label>
                    <input
                      id="quote-email"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder="chinedu@company.ng"
                      className={fieldClass(errors.email)}
                    />
                    {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                  </div>

                  <div key={errors.phone ? `ph-${shakeCount}` : "ph"} className={errors.phone ? "animate-shake" : ""}>
                    <label htmlFor="quote-phone" className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Phone / WhatsApp <span className="text-orange-600">*</span>
                    </label>
                    <input
                      id="quote-phone"
                      type="tel"
                      inputMode="tel"
                      required
                      value={form.phone}
                      onChange={(e) => updateField("phone", maskNigerianPhone(e.target.value))}
                      placeholder="+234 803 123 4567 or +20 10 1234 5678"
                      className={`${fieldClass(errors.phone)} font-mono`}
                    />
                    {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
                  </div>

                  <div>
                    <label htmlFor="quote-company" className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Company Name
                    </label>
                    <input
                      id="quote-company"
                      type="text"
                      value={form.companyName}
                      onChange={(e) => updateField("companyName", e.target.value)}
                      placeholder="Optional (e.g. Eko Retail Ltd)"
                      className={fieldClass()}
                    />
                  </div>

                  <div
                    key={errors.serviceType ? `st-${shakeCount}` : "st"}
                    className={`md:col-span-2 ${errors.serviceType ? "animate-shake" : ""}`}
                  >
                    <label htmlFor="quote-service-type" className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Service Type <span className="text-orange-600">*</span>
                    </label>
                    <select
                      id="quote-service-type"
                      required
                      value={form.serviceType}
                      onChange={(e) => updateField("serviceType", e.target.value)}
                      className={fieldClass(errors.serviceType)}
                    >
                      {SERVICE_TYPE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    {errors.serviceType && <p className="mt-1 text-xs text-red-600">{errors.serviceType}</p>}
                  </div>

                  <div key={errors.pickupLocation ? `pu-${shakeCount}` : "pu"} className={errors.pickupLocation ? "animate-shake" : ""}>
                    <label htmlFor="quote-pickup" className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Pickup Location <span className="text-orange-600">*</span>
                    </label>
                    <input
                      id="quote-pickup"
                      type="text"
                      required
                      value={form.pickupLocation}
                      onChange={(e) => updateField("pickupLocation", e.target.value)}
                      placeholder="Ikeja, Lagos"
                      className={fieldClass(errors.pickupLocation)}
                    />
                    {errors.pickupLocation && (
                      <p className="mt-1 text-xs text-red-600">{errors.pickupLocation}</p>
                    )}
                  </div>

                  <div key={errors.deliveryLocation ? `dl-${shakeCount}` : "dl"} className={errors.deliveryLocation ? "animate-shake" : ""}>
                    <label htmlFor="quote-delivery" className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Delivery Location <span className="text-orange-600">*</span>
                    </label>
                    <input
                      id="quote-delivery"
                      type="text"
                      required
                      value={form.deliveryLocation}
                      onChange={(e) => updateField("deliveryLocation", e.target.value)}
                      placeholder="Wuse II, Abuja"
                      className={fieldClass(errors.deliveryLocation)}
                    />
                    {errors.deliveryLocation && (
                      <p className="mt-1 text-xs text-red-600">{errors.deliveryLocation}</p>
                    )}
                  </div>

                  <div
                    key={errors.packageDescription ? `pk-${shakeCount}` : "pk"}
                    className={`md:col-span-2 ${errors.packageDescription ? "animate-shake" : ""}`}
                  >
                    <label htmlFor="quote-package" className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Package Description <span className="text-orange-600">*</span>
                    </label>
                    <input
                      id="quote-package"
                      type="text"
                      required
                      value={form.packageDescription}
                      onChange={(e) => updateField("packageDescription", e.target.value)}
                      placeholder="12 sealed cartons of packaged electronics / apparel"
                      className={fieldClass(errors.packageDescription)}
                    />
                    {errors.packageDescription && (
                      <p className="mt-1 text-xs text-red-600">{errors.packageDescription}</p>
                    )}
                  </div>

                  <div key={errors.estimatedWeightKg ? `wt-${shakeCount}` : "wt"} className={errors.estimatedWeightKg ? "animate-shake" : ""}>
                    <label htmlFor="quote-weight" className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Estimated Weight (kg) <span className="text-orange-600">*</span>
                    </label>
                    <input
                      id="quote-weight"
                      type="text"
                      inputMode="decimal"
                      required
                      value={form.estimatedWeightKg}
                      onChange={(e) => updateField("estimatedWeightKg", maskWeightKg(e.target.value))}
                      placeholder="45.5"
                      className={`${fieldClass(errors.estimatedWeightKg)} font-mono tabular-nums`}
                    />
                    {errors.estimatedWeightKg && (
                      <p className="mt-1 text-xs text-red-600">{errors.estimatedWeightKg}</p>
                    )}
                  </div>

                  <div key={errors.preferredPickupDate ? `dt-${shakeCount}` : "dt"} className={errors.preferredPickupDate ? "animate-shake" : ""}>
                    <label htmlFor="quote-date" className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Preferred Pickup Date <span className="text-orange-600">*</span>
                    </label>
                    <input
                      id="quote-date"
                      type="date"
                      min={minDate}
                      required
                      value={form.preferredPickupDate}
                      onChange={(e) => updateField("preferredPickupDate", e.target.value)}
                      className={`${fieldClass(errors.preferredPickupDate)} font-mono`}
                    />
                    {errors.preferredPickupDate && (
                      <p className="mt-1 text-xs text-red-600">{errors.preferredPickupDate}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="quote-notes" className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Additional Notes
                    </label>
                    <textarea
                      id="quote-notes"
                      rows={3}
                      value={form.additionalNotes}
                      onChange={(e) => updateField("additionalNotes", e.target.value)}
                      placeholder="Fragile handling instructions, forklift required at drop-off, or gate pass details..."
                      className="w-full p-3.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 transition-[border-color,box-shadow] duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  onClick={triggerRipple}
                  className={`${BUTTON_PRIMARY_CLASSES} w-full h-12 min-h-[48px] px-6 text-sm sm:text-base rounded-lg focus-visible:ring-offset-slate-50`}
                >
                  {rippleElement}
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting Quote Request...</span>
                    </>
                  ) : successRef ? (
                    <>
                      <Check className="w-4 h-4 animate-success-pop" />
                      <span>Request Another Quote</span>
                    </>
                  ) : (
                    <span>Request Dispatch Quote</span>
                  )}
                </button>
              </form>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};
