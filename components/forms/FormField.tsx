"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function FormField({
  label,
  value,
  onChange,
  required,
  type = "text",
  className = "",
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  className?: string;
  maxLength?: number;
}) {
  return (
    <label className={`flex flex-col gap-1 text-base ${className}`}>
      <span className="text-sm font-medium text-foreground/60">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-md border border-black/10 px-3 py-2 text-base focus:border-brand-primary focus:outline-none"
      />
    </label>
  );
}

export function PasswordField({
  label,
  value,
  onChange,
  required,
  showLabel,
  hideLabel,
  autoComplete,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  showLabel: string;
  hideLabel: string;
  autoComplete?: string;
  className?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <label className={`flex flex-col gap-1 text-base ${className}`}>
      <span className="text-sm font-medium text-foreground/60">{label}</span>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          required={required}
          value={value}
          autoComplete={autoComplete}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-md border border-black/10 py-2 pl-3 pr-11 text-base focus:border-brand-primary focus:outline-none"
        />
        <button
          type="button"
          onClick={() => setVisible((prev) => !prev)}
          aria-label={visible ? hideLabel : showLabel}
          aria-pressed={visible}
          title={visible ? hideLabel : showLabel}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-foreground/50 transition hover:text-brand-primary focus:outline-none focus-visible:text-brand-primary"
        >
          {visible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
    </label>
  );
}

export function FormTextarea({
  label,
  value,
  onChange,
  required,
  rows = 5,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  rows?: number;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1 text-base ${className}`}>
      <span className="text-sm font-medium text-foreground/60">{label}</span>
      <textarea
        required={required}
        value={value}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-md border border-black/10 px-3 py-2 text-base focus:border-brand-primary focus:outline-none"
      />
    </label>
  );
}
