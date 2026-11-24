import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { AlertCircle, Check, CheckCircle2, ChevronDown, Search } from "lucide-react";
import {
  ALL_COUNTRIES,
  detectCountryFromPlusInput,
  getCountryOption,
  validatePhone,
  type CountryCode,
} from "../lib/validation";

interface PhoneInputProps {
  id: string;
  label: React.ReactNode;
  value: string;
  country: CountryCode;
  onChange: (value: string) => void;
  onCountryChange: (country: CountryCode) => void;
  placeholder?: string;
  required?: boolean;
  forceShowError?: boolean;
  shakeKey?: number | string;
  resetKey?: number;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  id,
  label,
  value,
  country,
  onChange,
  onCountryChange,
  placeholder = "0803 123 4567 or +44 7700 900123",
  required = true,
  forceShowError = false,
  shakeKey = 0,
  resetKey = 0,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [touched, setTouched] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [hadError, setHadError] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const feedbackId = useId();
  const listboxId = useId();

  useEffect(() => {
    setTouched(false);
    setDirty(false);
    setHadError(false);
  }, [resetKey]);

  const selectedCountry = useMemo(
    () => getCountryOption(country) || ALL_COUNTRIES[0],
    [country]
  );

  const filteredCountries = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return ALL_COUNTRIES;
    return ALL_COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.dialCode.includes(q)
    );
  }, [search]);

  useEffect(() => {
    if (!dropdownOpen) {
      setSearch("");
      return;
    }

    const timer = window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 10);

    const handleOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, [dropdownOpen]);

  const validation = validatePhone(value, country);
  const hasContent = value.trim().length > 0;
  const shouldShowStatus =
    forceShowError || touched || dirty || hadError || hasContent;

  const showError = shouldShowStatus && !validation.valid;
  const showValid = shouldShowStatus && validation.valid && hasContent;

  const handleTextChange = (nextVal: string) => {
    setDirty(true);
    let activeCountry = country;

    if (nextVal.trim().startsWith("+")) {
      const detected = detectCountryFromPlusInput(nextVal, country);
      if (detected && detected !== country) {
        activeCountry = detected;
        onCountryChange(detected);
      }
    }

    const nextValidation = validatePhone(nextVal, activeCountry);
    if (!nextValidation.valid) {
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
    <div
      key={showError && shakeKey ? `phone-${shakeKey}` : "phone"}
      className={showError && shakeKey ? "animate-shake" : ""}
    >
      <label htmlFor={id} className="block text-xs font-semibold text-slate-700 mb-1.5">
        {label}
      </label>

      <div ref={containerRef} className="relative flex flex-col sm:flex-row gap-2">
        {/* Country Selector */}
        <div className="relative shrink-0">
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={dropdownOpen}
            aria-controls={listboxId}
            aria-label={`Country code: ${selectedCountry.name} (${selectedCountry.dialCode})`}
            onClick={() => setDropdownOpen((prev) => !prev)}
            className={`cursor-pointer w-full sm:w-[170px] h-11 min-h-[44px] px-2.5 bg-white border rounded-lg text-xs sm:text-sm text-slate-900 flex items-center justify-between gap-1.5 transition-[border-color,background-color,box-shadow] duration-200 hover:border-orange-500 hover:bg-orange-50/40 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 ${
              dropdownOpen
                ? "border-orange-500 ring-2 ring-orange-500/30"
                : showError
                  ? "border-red-400"
                  : showValid
                    ? "border-emerald-500"
                    : "border-slate-300"
            }`}
          >
            <span className="flex items-center gap-1.5 min-w-0">
              <span aria-hidden="true" className="text-base leading-none shrink-0">
                {selectedCountry.flag}
              </span>
              <span className="truncate font-medium text-slate-800">{selectedCountry.name}</span>
              <span className="font-mono text-xs text-slate-500 shrink-0">
                {selectedCountry.dialCode}
              </span>
            </span>
            <ChevronDown
              className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                dropdownOpen ? "rotate-180 text-orange-600" : "text-slate-500"
              }`}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute left-0 top-full mt-1.5 z-50 w-72 max-w-[calc(100vw-2.5rem)] bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden">
              <div className="p-2 border-b border-slate-100 bg-slate-50">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search country or code..."
                    aria-label="Search country or dial code"
                    className="w-full h-9 pl-8 pr-2.5 bg-white border border-slate-300 rounded-md text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/25"
                  />
                </div>
              </div>

              <ul
                id={listboxId}
                role="listbox"
                aria-label="Select country"
                className="max-h-60 overflow-y-auto py-1"
              >
                {filteredCountries.length === 0 ? (
                  <li className="px-3 py-2.5 text-xs text-slate-500 text-center">
                    No matching countries
                  </li>
                ) : (
                  filteredCountries.map((opt) => {
                    const isSelected = opt.code === selectedCountry.code;
                    return (
                      <li
                        key={opt.code}
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          onCountryChange(opt.code);
                          setDropdownOpen(false);
                        }}
                        className={`cursor-pointer min-h-[40px] px-3 py-2 text-xs sm:text-sm flex items-center justify-between gap-2 transition-colors duration-150 ${
                          isSelected
                            ? "bg-orange-50 text-orange-700 font-semibold"
                            : "text-slate-800 hover:bg-orange-500 hover:text-white"
                        }`}
                      >
                        <span className="flex items-center gap-2 min-w-0">
                          <span aria-hidden="true" className="text-base leading-none shrink-0">
                            {opt.flag}
                          </span>
                          <span className="truncate">{opt.name}</span>
                        </span>
                        <span className="flex items-center gap-1.5 shrink-0">
                          <span className="font-mono text-xs opacity-80">{opt.dialCode}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                        </span>
                      </li>
                    );
                  })
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Phone Number Input */}
        <input
          id={id}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required={required}
          value={value}
          onChange={(e) => handleTextChange(e.target.value)}
          onBlur={handleBlur}
          placeholder={placeholder}
          aria-invalid={showError}
          aria-describedby={shouldShowStatus ? feedbackId : undefined}
          className={`flex-1 min-w-0 h-11 min-h-[44px] px-3.5 bg-white border rounded-lg text-sm font-mono text-slate-900 placeholder:text-slate-400 transition-[border-color,box-shadow] duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 ${
            showError
              ? "border-red-400"
              : showValid
                ? "border-emerald-500"
                : "border-slate-300"
          }`}
        />
      </div>

      {shouldShowStatus && (
        <div id={feedbackId} aria-live="polite" className="mt-1.5 space-y-0.5">
          {showError ? (
            <p className="flex items-start gap-1.5 text-xs text-red-600">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{validation.reason}</span>
            </p>
          ) : showValid ? (
            <>
              <p className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" aria-hidden="true" />
                <span>Looks good</span>
              </p>
              <p className="text-[11px] text-slate-600 font-mono tabular-nums">
                Will be saved as {validation.international}
              </p>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
};
