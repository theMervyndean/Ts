import React, { useEffect, useState } from "react";
import { AlertCircle, Check, CheckCircle2, Globe, Loader2, X } from "lucide-react";
import { PRICING_TIERS, type PricingTier } from "../data/logisticsData";
import { BUTTON_PRIMARY_CLASSES, Reveal, useRippleFeedback } from "../lib/animations";
import {
  formatConvertedFromNaira,
  SUPPORTED_CURRENCIES,
  useAutoCurrency,
} from "../lib/currency";
import { validateEmail } from "../lib/validation";
import { sendToWebhook } from "../lib/webhook";
import { EmailInput } from "./EmailInput";
import { HoneypotField } from "./HoneypotField";
import { OrangeSelect } from "./OrangeSelect";

export const PricingSection: React.FC = () => {
  const { currency, setCurrency, detectedCurrency, rates, isLiveRate } = useAutoCurrency();
  const [selectedPlan, setSelectedPlan] = useState<PricingTier["name"] | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string; company?: string }>({});
  const [submittedAttempt, setSubmittedAttempt] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [shakeCount, setShakeCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successRef, setSuccessRef] = useState<string | null>(null);
  const { triggerRipple, rippleElement } = useRippleFeedback();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedPlan && !submitting) {
        setSelectedPlan(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedPlan, submitting]);

  const openModalForPlan = (planName: PricingTier["name"]) => {
    setSelectedPlan(planName);
    setErrors({});
    setSubmittedAttempt(false);
    setResetKey((k) => k + 1);
    setSubmitError(null);
    setSuccessRef(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;
    if (honeypot.trim() !== "") return;

    setSubmittedAttempt(true);
    const emailResult = validateEmail(email);

    const nextErrors: { name?: string; email?: string; company?: string } = {};
    if (name.trim().length < 2) nextErrors.name = "Enter your full name.";
    if (!emailResult.valid) nextErrors.email = emailResult.reason;
    if (company.trim().length < 2) nextErrors.company = "Enter your business or store name.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setShakeCount((c) => c + 1);
      const fieldIdMap: Record<keyof typeof errors, string> = {
        name: "plan-name",
        email: "plan-email",
        company: "plan-company",
      };
      const firstErrorKey = Object.keys(nextErrors)[0] as keyof typeof errors;
      const firstEl = document.getElementById(fieldIdMap[firstErrorKey]);
      if (firstEl) {
        firstEl.focus();
      }
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await sendToWebhook("plan_selection", {
        name: name.trim(),
        email: email.trim(),
        company: company.trim(),
        plan: selectedPlan,
      });
      setSuccessRef(response.referenceId);
      setSubmittedAttempt(false);
      setResetKey((k) => k + 1);
      setName("");
      setEmail("");
      setCompany("");
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Unable to confirm your plan selection. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="pricing"
      className="scroll-mt-20 py-14 sm:py-16 lg:py-24 bg-slate-50 border-b border-slate-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="relative z-20">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 sm:mb-12">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold text-orange-600 mb-2">Transparent Global Pricing</p>
              <h2
                className="font-bold tracking-tight text-navy-900 text-balance leading-tight"
                style={{ fontSize: "clamp(1.75rem, 3vw, 2.35rem)" }}
              >
                Predictable monthly logistics retainers built to scale
              </h2>
              <p className="mt-3 text-base text-slate-600 leading-relaxed">
                Lock in priority rider allocation, discounted interstate haulage, and faster Cash-on-Delivery bank settlements.
              </p>
            </div>

            <div className="shrink-0 space-y-1.5 w-full sm:w-auto sm:min-w-[260px]">
              <label
                htmlFor="currency-selector"
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-600"
              >
                <Globe className="w-3.5 h-3.5 text-orange-600" />
                <span>
                  Display Currency
                  {currency === detectedCurrency ? " (Auto-detected)" : ""}
                </span>
              </label>
              <OrangeSelect
                id="currency-selector"
                value={currency}
                onChange={setCurrency}
                ariaLabel="Display Currency"
                buttonClassName="font-medium text-navy-900"
                options={SUPPORTED_CURRENCIES.map((opt) => ({
                  value: opt.code,
                  label: `${opt.code} — ${opt.label}`,
                }))}
              />
              {currency !== "NGN" && (
                <p className="text-[11px] text-slate-500">
                  {isLiveRate ? "Live exchange estimate" : "Estimated conversion"} · Base tariff in NGN
                </p>
              )}
            </div>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {PRICING_TIERS.map((tier, idx) => {
            const isHighlighted = Boolean(tier.recommended);
            const tabletSpan = idx === 2 ? "md:col-span-2 lg:col-span-1" : "";

            return (
              <Reveal key={tier.id} delayMs={idx * 80} className={`${tabletSpan} flex`}>
                <div
                  className={`w-full rounded-xl p-6 sm:p-7 flex flex-col justify-between border transition-[transform,border-color,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:border-orange-500/70 hover:shadow-[0_14px_32px_-12px_rgba(249,115,22,0.26)] ${
                    isHighlighted
                      ? "bg-navy-900 text-white border-navy-900"
                      : "bg-white text-slate-900 border-slate-200"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <h3
                        className={`text-xl font-bold ${
                          isHighlighted ? "text-white" : "text-navy-900"
                        }`}
                      >
                        {tier.name}
                      </h3>
                      {isHighlighted && (
                        <span className="text-xs font-semibold text-orange-400">Most Popular</span>
                      )}
                    </div>

                    <p
                      className={`text-sm leading-relaxed mb-6 ${
                        isHighlighted ? "text-slate-300" : "text-slate-600"
                      }`}
                    >
                      {tier.summary}
                    </p>

                  <div className="pb-6 mb-6 border-b border-current/10">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl sm:text-4xl font-bold font-mono tabular-nums tracking-tight">
                        {formatConvertedFromNaira(tier.priceNgn, currency, rates)}
                      </span>
                      <span
                        className={`text-sm ${
                          isHighlighted ? "text-slate-300" : "text-slate-500"
                        }`}
                      >
                        {tier.cadence}
                      </span>
                    </div>
                    {currency !== "NGN" && (
                      <p
                        className={`mt-1 text-xs font-mono tabular-nums ${
                          isHighlighted ? "text-slate-400" : "text-slate-500"
                        }`}
                      >
                        ≈ {tier.priceNaira} NGN
                      </p>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature) => {
                      const displayFeature =
                        tier.insuranceCoverNgn && feature.toLowerCase().includes("goods-in-transit cover")
                          ? `${feature} up to ${formatConvertedFromNaira(tier.insuranceCoverNgn, currency, rates)}`
                          : feature;

                      return (
                        <li key={feature} className="flex items-start gap-2.5 text-sm">
                          <Check
                            className={`w-4 h-4 shrink-0 mt-0.5 ${
                              isHighlighted ? "text-orange-400" : "text-orange-600"
                            }`}
                          />
                          <span className={isHighlighted ? "text-slate-200" : "text-slate-700"}>
                            {displayFeature}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      if (isHighlighted) triggerRipple(e);
                      openModalForPlan(tier.name);
                    }}
                    className={
                      isHighlighted
                        ? `${BUTTON_PRIMARY_CLASSES} w-full h-11 min-h-[44px] px-5 rounded-lg text-sm focus-visible:ring-offset-navy-900`
                        : "cursor-pointer w-full h-11 min-h-[44px] px-5 rounded-lg font-semibold text-sm bg-navy-900 hover:bg-navy-800 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] text-white transition-[transform,background-color] duration-200 ease-out whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
                    }
                  >
                    {isHighlighted ? rippleElement : null}
                    <span>Choose Plan</span>
                  </button>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>

      {/* Plan Selection Modal */}
      {selectedPlan && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="plan-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/75 backdrop-blur-xs"
        >
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md p-6 sm:p-7 shadow-2xl relative animate-success-pop">
            <button
              type="button"
              onClick={() => !submitting && setSelectedPlan(null)}
              aria-label="Close plan selection form"
              className="absolute top-3.5 right-3.5 w-11 h-11 rounded-lg inline-flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            >
              <X className="w-5 h-5" />
            </button>

            <p className="text-xs font-semibold text-orange-600 mb-1">TS Logistics Retainer</p>
            <h3 id="plan-modal-title" className="text-xl font-bold text-navy-900 mb-1">
              Activate {selectedPlan} Plan
            </h3>
            <p className="text-sm text-slate-600 mb-5">
              Complete your company details and our account onboarding team will activate your rate card.
            </p>

            {successRef ? (
              <div className="space-y-4">
                <div
                  role="status"
                  className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-start gap-3 animate-success-pop"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold">{selectedPlan} plan request confirmed.</p>
                    <p className="mt-1 text-emerald-800">
                      Reference ID:{" "}
                      <span className="font-mono font-semibold tabular-nums">{successRef}</span>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPlan(null)}
                  className="cursor-pointer w-full h-11 min-h-[44px] bg-navy-900 hover:bg-navy-800 text-white font-semibold text-sm rounded-lg transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <HoneypotField id="plan-hp" value={honeypot} onChange={setHoneypot} />

                {submitError && (
                  <div
                    role="alert"
                    className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-900 flex items-start gap-2.5 text-xs"
                  >
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>{submitError}</span>
                  </div>
                )}

                <div>
                  <label htmlFor="plan-select" className="block text-xs font-semibold text-slate-700 mb-1">
                    Selected Plan
                  </label>
                  <OrangeSelect
                    id="plan-select"
                    value={selectedPlan}
                    onChange={(val) => setSelectedPlan(val as PricingTier["name"])}
                    ariaLabel="Selected Plan"
                    buttonClassName="bg-slate-50 font-semibold text-navy-900"
                    options={PRICING_TIERS.map((tier) => ({
                      value: tier.name,
                      label: `${tier.name} (${formatConvertedFromNaira(tier.priceNgn, currency, rates)} / month)`,
                    }))}
                  />
                </div>

                <div key={errors.name ? `pn-${shakeCount}` : "pn"} className={errors.name ? "animate-shake" : ""}>
                  <label htmlFor="plan-name" className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name <span className="text-orange-600">*</span>
                  </label>
                  <input
                    id="plan-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
                    }}
                    placeholder="Amina Bello"
                    className={`w-full h-11 min-h-[44px] px-3.5 bg-white border rounded-lg text-sm text-slate-900 transition-[border-color,box-shadow] duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 ${
                      errors.name ? "border-red-400" : "border-slate-300"
                    }`}
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                </div>

                <EmailInput
                  id="plan-email"
                  label={
                    <>
                      Work Email <span className="text-orange-600">*</span>
                    </>
                  }
                  value={email}
                  onChange={(val) => {
                    setEmail(val);
                    if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
                  }}
                  placeholder="amina@zuriatelier.ng"
                  forceShowError={submittedAttempt}
                  shakeKey={shakeCount}
                  resetKey={resetKey}
                />

                <div key={errors.company ? `pc-${shakeCount}` : "pc"} className={errors.company ? "animate-shake" : ""}>
                  <label htmlFor="plan-company" className="block text-xs font-semibold text-slate-700 mb-1">
                    Company Name <span className="text-orange-600">*</span>
                  </label>
                  <input
                    id="plan-company"
                    type="text"
                    required
                    value={company}
                    onChange={(e) => {
                      setCompany(e.target.value);
                      if (errors.company) setErrors((p) => ({ ...p, company: undefined }));
                    }}
                    placeholder="Zuri Commerce Nigeria Ltd"
                    className={`w-full h-11 min-h-[44px] px-3.5 bg-white border rounded-lg text-sm text-slate-900 transition-[border-color,box-shadow] duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 ${
                      errors.company ? "border-red-400" : "border-slate-300"
                    }`}
                  />
                  {errors.company && <p className="mt-1 text-xs text-red-600">{errors.company}</p>}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  onClick={triggerRipple}
                  className={`${BUTTON_PRIMARY_CLASSES} w-full h-11 min-h-[44px] px-5 text-sm rounded-lg`}
                >
                  {rippleElement}
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting Plan...</span>
                    </>
                  ) : (
                    <span>Confirm {selectedPlan} Plan</span>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
