import React, { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export interface OrangeSelectOption {
  value: string;
  label: string;
}

interface OrangeSelectProps {
  id: string;
  value: string;
  options: readonly OrangeSelectOption[];
  onChange: (value: string) => void;
  hasError?: boolean;
  className?: string;
  buttonClassName?: string;
  ariaLabel?: string;
}

export const OrangeSelect: React.FC<OrangeSelectProps> = ({
  id,
  value,
  options,
  onChange,
  hasError = false,
  className = "",
  buttonClassName = "",
  ariaLabel,
}) => {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(() =>
    Math.max(
      0,
      options.findIndex((o) => o.value === value)
    )
  );
  const containerRef = useRef<HTMLDivElement | null>(null);
  const listboxId = useId();

  const selectedOption = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    const idx = options.findIndex((o) => o.value === value);
    if (idx >= 0) setActiveIndex(idx);
  }, [value, options]);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const handleSelect = (nextValue: string) => {
    onChange(nextValue);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
      } else {
        setActiveIndex((prev) => (prev + 1) % options.length);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
      } else {
        setActiveIndex((prev) => (prev - 1 + options.length) % options.length);
      }
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
      } else if (options[activeIndex]) {
        handleSelect(options[activeIndex].value);
      }
    } else if (e.key === "Tab" && open) {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-label={ariaLabel}
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        className={`cursor-pointer w-full h-11 min-h-[44px] px-3.5 bg-white border rounded-lg text-sm text-left flex items-center justify-between gap-2 transition-[border-color,background-color,box-shadow] duration-200 hover:border-orange-500 hover:bg-orange-50/40 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 ${
          open ? "border-orange-500 ring-2 ring-orange-500/30" : hasError ? "border-red-400" : "border-slate-300"
        } ${buttonClassName}`}
      >
        <span className="truncate">{selectedOption?.label}</span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
            open ? "rotate-180 text-orange-600" : "text-slate-500"
          }`}
        />
      </button>

      {open && (
        <ul
          id={listboxId}
          role="listbox"
          aria-labelledby={id}
          className="absolute left-0 right-0 mt-1.5 z-50 bg-white border border-slate-200 rounded-lg shadow-xl py-1 max-h-64 overflow-y-auto"
        >
          {options.map((option, idx) => {
            const isSelected = option.value === value;
            const isHighlighted = idx === activeIndex;

            return (
              <li
                key={option.value}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setActiveIndex(idx)}
                onClick={() => handleSelect(option.value)}
                className={`cursor-pointer min-h-[44px] sm:min-h-[38px] px-3.5 py-2 text-sm flex items-center justify-between gap-2 transition-colors duration-150 ${
                  isHighlighted
                    ? "bg-orange-500 text-white font-medium"
                    : isSelected
                      ? "bg-orange-50 text-orange-700 font-semibold"
                      : "text-slate-800 hover:bg-orange-500 hover:text-white"
                }`}
              >
                <span className="truncate">{option.label}</span>
                {isSelected && (
                  <Check
                    className={`w-4 h-4 shrink-0 ${
                      isHighlighted ? "text-white" : "text-orange-600"
                    }`}
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
