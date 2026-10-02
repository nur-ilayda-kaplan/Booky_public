"use client";

import { FormField } from "./FormField";
import type { Dictionary } from "@/lib/getDictionary";

export interface PaymentFormState {
  cardNumber: string;
  cardName: string;
  cardExpiry: string;
  cardCvc: string;
}

export function CheckoutPaymentForm({
  payment,
  onPaymentChange,
  dict,
}: {
  payment: PaymentFormState;
  onPaymentChange: <K extends keyof PaymentFormState>(key: K, value: PaymentFormState[K]) => void;
  dict: Dictionary;
}) {
  return (
    <div className="rounded-lg border border-black/5 bg-white p-5">
      <h2 className="mb-4 font-serif text-lg font-semibold">{dict.checkout.paymentTitle}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label={dict.checkout.cardNumber}
          value={payment.cardNumber}
          onChange={(value) => onPaymentChange("cardNumber", value)}
          required
          maxLength={19}
          className="sm:col-span-2"
        />
        <FormField
          label={dict.checkout.cardName}
          value={payment.cardName}
          onChange={(value) => onPaymentChange("cardName", value)}
          required
          className="sm:col-span-2"
        />
        <FormField
          label={dict.checkout.cardExpiry}
          value={payment.cardExpiry}
          onChange={(value) => onPaymentChange("cardExpiry", value)}
          required
          maxLength={5}
        />
        <FormField
          label={dict.checkout.cardCvc}
          value={payment.cardCvc}
          onChange={(value) => onPaymentChange("cardCvc", value)}
          required
          maxLength={4}
        />
      </div>
    </div>
  );
}
