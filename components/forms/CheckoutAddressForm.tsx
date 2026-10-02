"use client";

import { FormField } from "./FormField";
import type { OrderAddress, DeliveryOption } from "@/types";
import type { Dictionary } from "@/lib/getDictionary";

export function CheckoutAddressForm({
  address,
  onAddressChange,
  deliveryOption,
  onDeliveryChange,
  dict,
}: {
  address: OrderAddress;
  onAddressChange: <K extends keyof OrderAddress>(key: K, value: OrderAddress[K]) => void;
  deliveryOption: DeliveryOption;
  onDeliveryChange: (value: DeliveryOption) => void;
  dict: Dictionary;
}) {
  return (
    <div className="flex flex-col gap-6 rounded-lg border border-black/5 bg-white p-5">
      <div>
        <h2 className="mb-4 font-serif text-lg font-semibold">{dict.checkout.addressTitle}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label={dict.checkout.fullName}
            value={address.fullName}
            onChange={(value) => onAddressChange("fullName", value)}
            required
          />
          <FormField
            label={dict.checkout.phone}
            value={address.phone}
            onChange={(value) => onAddressChange("phone", value)}
            required
            type="tel"
          />
          <FormField
            label={dict.checkout.email}
            value={address.email}
            onChange={(value) => onAddressChange("email", value)}
            required
            type="email"
            className="sm:col-span-2"
          />
          <FormField
            label={dict.checkout.addressLine}
            value={address.addressLine}
            onChange={(value) => onAddressChange("addressLine", value)}
            required
            className="sm:col-span-2"
          />
          <FormField
            label={dict.checkout.city}
            value={address.city}
            onChange={(value) => onAddressChange("city", value)}
            required
          />
          <FormField
            label={dict.checkout.postalCode}
            value={address.postalCode}
            onChange={(value) => onAddressChange("postalCode", value)}
            required
          />
        </div>
      </div>

      <div>
        <h2 className="mb-4 font-serif text-lg font-semibold">{dict.checkout.deliveryTitle}</h2>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-3 rounded-md border border-black/10 p-3 text-base">
            <input
              type="radio"
              name="delivery"
              checked={deliveryOption === "standard"}
              onChange={() => onDeliveryChange("standard")}
            />
            {dict.checkout.deliveryStandard}
          </label>
          <label className="flex items-center gap-3 rounded-md border border-black/10 p-3 text-base">
            <input
              type="radio"
              name="delivery"
              checked={deliveryOption === "express"}
              onChange={() => onDeliveryChange("express")}
            />
            {dict.checkout.deliveryExpress}
          </label>
        </div>
      </div>
    </div>
  );
}
