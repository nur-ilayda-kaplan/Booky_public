"use client";

export function QuantityPicker({
  value,
  onChange,
  max,
}: {
  value: number;
  onChange: (value: number) => void;
  max: number;
}) {
  return (
    <div className="inline-flex items-center rounded-md border border-black/10">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        className="px-3 py-2 text-lg leading-none"
        aria-label="-"
      >
        −
      </button>
      <span className="w-12 text-center text-base font-medium">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        className="px-3 py-2 text-lg leading-none"
        aria-label="+"
      >
        +
      </button>
    </div>
  );
}
