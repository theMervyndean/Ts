import React, { useEffect, useId, useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { validateEmail } from "../lib/validation";

interface EmailInputProps {
  id: string;
  label: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  forceShowError?: boolean;
  shakeKey?: number | string;
  resetKey?: number;
  inputClassName?: string;
}

export const EmailInput: React.FC<EmailInputProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder = "name@company.com",
  required = true,
  forceShowError = false,
  shakeKey = 0,
  resetKey = 0,
  inputClassName = "",
}) => {
  const [touched, setTouched] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [hadError, setHadError] = useState(false);
  const feedbackId = useId();

  useEffect(() => {
    setTouched(false);
    setDirty(false);
    setHadError(false);
  }, [resetKey]);

  const validation = validateEmail(value);
  const hasContent = value.trim().length > 0;
  const shouldShowStatus =
    forceShowError || touched || dirty || hadError || hasContent;

  const showError = shouldShowStatus && !validation.valid;
  const showValid = shouldShowStatus && validation.valid && hasContent;

  const handleChange = (nextVal: string) => {
    setDirty(true);
    const nextResult = validateEmail(nextVal);
    if (!nextResult.valid) {
      setHadError(true);
    }
    onChange(nextVal);
  };

  const handleBlur = () => {
    setTouched(true);
    if (!validation.valid) {
      setHadError(true);
    }
  };

  return (
    <div key={showError && shakeKey ? `email-${shakeKey}` : "email"} className={showError && shakeKey ? "animate-shake" : ""}>
      <label htmlFor={id} className="block text-xs font-semibold text-slate-700 mb-1.5">
        {label}
      </label>
      <input
        id={id}
        type="email"
        inputMode="email"
        autoComplete="email"
        required={required}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={handleBlur}
        placeholder={placeholder}
        aria-invalid={showError}
        aria-describedby={shouldShowStatus ? feedbackId : undefined}
        className={`w-full h-11 min-h-[44px] px-3.5 bg-white border rounded-lg text-sm text-slate-900 placeholder:text-slate-400 transition-[border-color,box-shadow] duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 ${
          showError
            ? "border-red-400"
            : showValid
              ? "border-emerald-500"
              : "border-slate-300"
        } ${inputClassName}`}
      />

      {shouldShowStatus && (
        <div id={feedbackId} aria-live="polite" className="mt-1.5 space-y-1">
          {showError ? (
            <p className="flex items-start gap-1.5 text-xs text-red-600">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{validation.reason}</span>
            </p>
          ) : showValid ? (
            <p className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" aria-hidden="true" />
              <span>Looks good</span>
            </p>
          ) : null}

          {validation.suggestion && (
            <p className="text-xs text-slate-600">
              Did you mean{" "}
              <button
                type="button"
                onClick={() => handleChange(validation.suggestion!)}
                className="cursor-pointer font-semibold text-orange-600 hover:text-orange-700 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded px-0.5"
              >
                {validation.suggestion}
              </button>
              ?
            </p>
          )}
        </div>
      )}
    </div>
  );
};
