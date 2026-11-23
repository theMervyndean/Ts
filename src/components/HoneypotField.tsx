import React from "react";

interface HoneypotFieldProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
}

/**
 * Hidden anti-bot honeypot field present in every TS Logistics form.
 * If filled by an automated script, form submission is blocked.
 */
export const HoneypotField: React.FC<HoneypotFieldProps> = ({ id, value, onChange }) => {
  return (
    <div
      aria-hidden="true"
      className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden opacity-0 pointer-events-none"
    >
      <label htmlFor={id}>Leave this field blank</label>
      <input
        id={id}
        name="company_website_fax"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};
