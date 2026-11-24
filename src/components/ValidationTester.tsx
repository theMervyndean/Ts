import React, { useEffect, useState } from "react";
import { CheckCircle2, FlaskConical, XCircle } from "lucide-react";
import {
  detectCountryFromPlusInput,
  getCountryOption,
  validateEmail,
  validatePhone,
  type CountryCode,
} from "../lib/validation";
import { EmailInput } from "./EmailInput";
import { PhoneInput } from "./PhoneInput";

interface TestCaseItem {
  id: string;
  type: "email" | "phone";
  value: string;
  expectedValid: boolean;
  defaultCountry?: CountryCode;
}

const VALIDATION_TEST_CASES: TestCaseItem[] = [
  // Valid examples
  { id: "v-email-1", type: "email", value: "name@company.com", expectedValid: true },
  { id: "v-email-2", type: "email", value: "first.last+tag@sub.example.co.uk", expectedValid: true },
  { id: "v-phone-1", type: "phone", value: "+44 7700 900123", expectedValid: true },
  { id: "v-phone-2", type: "phone", value: "0803 123 4567", expectedValid: true, defaultCountry: "NG" },
  { id: "v-phone-3", type: "phone", value: "+1 202 555 0143", expectedValid: true },
  // Invalid examples
  { id: "i-email-1", type: "email", value: "name@", expectedValid: false },
  { id: "i-email-2", type: "email", value: "name@company", expectedValid: false },
  { id: "i-email-3", type: "email", value: "name@@company.com", expectedValid: false },
  { id: "i-email-4", type: "email", value: "name company@gmail.com", expectedValid: false },
  { id: "i-phone-1", type: "phone", value: "12345", expectedValid: false, defaultCountry: "NG" },
  { id: "i-phone-2", type: "phone", value: "+234 123", expectedValid: false },
  { id: "i-phone-3", type: "phone", value: "abc12345", expectedValid: false, defaultCountry: "NG" },
  { id: "i-phone-4", type: "phone", value: "+999 999 999", expectedValid: false },
];

function isValidationTestUrl(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.location.hash === "#validation-test" ||
    window.location.href.endsWith("#validation-test")
  );
}

export const ValidationTester: React.FC = () => {
  const [visible, setVisible] = useState<boolean>(() => isValidationTestUrl());
  const [email, setEmail] = useState("name@company.com");
  const [phone, setPhone] = useState("0803 123 4567");
  const [phoneCountry, setPhoneCountry] = useState<CountryCode>("NG");

  useEffect(() => {
    const sync = () => setVisible(isValidationTestUrl());
    sync();
    window.addEventListener("hashchange", sync);
    window.addEventListener("popstate", sync);
    return () => {
      window.removeEventListener("hashchange", sync);
      window.removeEventListener("popstate", sync);
    };
  }, []);

  if (!visible) return null;

  const emailResult = validateEmail(email);
  const phoneResult = validatePhone(phone, phoneCountry);
  const detectedCountryOption = phoneResult.country
    ? getCountryOption(phoneResult.country)
    : undefined;

  const handleTryCase = (item: TestCaseItem) => {
    if (item.type === "email") {
      setEmail(item.value);
      return;
    }

    if (item.value.trim().startsWith("+")) {
      const detected = detectCountryFromPlusInput(item.value, "NG");
      setPhoneCountry(detected || "NG");
    } else {
      setPhoneCountry(item.defaultCountry || "NG");
    }
    setPhone(item.value);
  };

  return (
    <section
      id="validation-test"
      aria-label="Validation Tester"
      className="py-12 sm:py-16 bg-slate-100 border-t-4 border-orange-500"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-lg bg-navy-900 text-orange-400 inline-flex items-center justify-center shrink-0">
              <FlaskConical className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-navy-900">
                Validation Tester (Practice Mode)
              </h2>
              <p className="text-xs text-slate-600">
                Visible only when the URL ends with <code className="font-mono">#validation-test</code>
              </p>
            </div>
          </div>
        </div>

        {/* Interactive Inputs & Live Result */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <EmailInput
              id="tester-email"
              label="Test Email Address"
              value={email}
              onChange={setEmail}
              forceShowError
            />

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-slate-600">Status:</span>
                <span
                  className={`inline-flex items-center gap-1 font-semibold ${
                    emailResult.valid ? "text-emerald-700" : "text-red-600"
                  }`}
                >
                  {emailResult.valid ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5" />
                  )}
                  <span>{emailResult.valid ? "Valid" : "Invalid"}</span>
                </span>
              </div>
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold text-slate-600 shrink-0">Reason:</span>
                <span className="text-right text-slate-800">{emailResult.reason}</span>
              </div>
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold text-slate-600 shrink-0">Normalised:</span>
                <span className="font-mono text-right text-navy-900 break-all">
                  {emailResult.normalized || "—"}
                </span>
              </div>
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold text-slate-600 shrink-0">Detected Country:</span>
                <span className="font-mono text-right text-slate-500">N/A (Email)</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <PhoneInput
              id="tester-phone"
              label="Test Phone Number"
              value={phone}
              country={phoneCountry}
              onChange={setPhone}
              onCountryChange={setPhoneCountry}
              forceShowError
            />

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-slate-600">Status:</span>
                <span
                  className={`inline-flex items-center gap-1 font-semibold ${
                    phoneResult.valid ? "text-emerald-700" : "text-red-600"
                  }`}
                >
                  {phoneResult.valid ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5" />
                  )}
                  <span>{phoneResult.valid ? "Valid" : "Invalid"}</span>
                </span>
              </div>
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold text-slate-600 shrink-0">Reason:</span>
                <span className="text-right text-slate-800">{phoneResult.reason}</span>
              </div>
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold text-slate-600 shrink-0">Normalised (E.164):</span>
                <span className="font-mono text-right text-navy-900 break-all">
                  {phoneResult.e164 || "—"}
                </span>
              </div>
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold text-slate-600 shrink-0">Detected Country:</span>
                <span className="font-mono text-right text-navy-900">
                  {phoneResult.country
                    ? `${detectedCountryOption?.flag || ""} ${phoneResult.country}${
                        detectedCountryOption ? ` (${detectedCountryOption.name})` : ""
                      }`
                    : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Ready-Made Test Cases */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
          <h3 className="text-sm font-bold text-navy-900 mb-3">
            Ready-Made Test Cases
          </h3>
          <div className="divide-y divide-slate-200">
            {VALIDATION_TEST_CASES.map((item) => {
              const actualValid =
                item.type === "email"
                  ? validateEmail(item.value).valid
                  : validatePhone(item.value, item.defaultCountry || "NG").valid;
              const passed = actualValid === item.expectedValid;

              return (
                <div
                  key={item.id}
                  className="py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm"
                >
                  <div className="flex flex-wrap items-center gap-2 min-w-0">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px] uppercase">
                      {item.type}
                    </span>
                    <code className="font-mono text-navy-900 break-all">{item.value}</code>
                    <span className="text-xs text-slate-500">
                      (Expected: {item.expectedValid ? "Valid" : "Invalid"})
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-semibold ${
                        passed ? "text-emerald-700" : "text-red-600"
                      }`}
                    >
                      {passed ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      <span>{passed ? "Pass" : "Fail"}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleTryCase(item)}
                      className="cursor-pointer min-h-[36px] px-3 py-1 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                    >
                      Try it
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
