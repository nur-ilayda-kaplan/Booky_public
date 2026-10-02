"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { products } from "@/data/products";
import { formatPrice } from "@/lib/formatPrice";
import { localePath } from "@/lib/localePath";
import { paymentProvider } from "@/lib/payment";
import { trackBeginCheckout, trackPurchase } from "@/lib/analytics";
import { CheckoutAddressForm } from "@/components/forms/CheckoutAddressForm";
import { CheckoutPaymentForm, type PaymentFormState } from "@/components/forms/CheckoutPaymentForm";
import { CheckoutAuthStep } from "@/components/cart/CheckoutAuthStep";
import type { Locale } from "@/config/i18n.config";
import type { Dictionary } from "@/lib/getDictionary";
import type { OrderAddress, DeliveryOption, Order, OrderItem } from "@/types";

const EMPTY_ADDRESS: OrderAddress = {
  fullName: "",
  phone: "",
  email: "",
  addressLine: "",
  city: "",
  postalCode: "",
};

const EMPTY_PAYMENT: PaymentFormState = {
  cardNumber: "",
  cardName: "",
  cardExpiry: "",
  cardCvc: "",
};

const DELIVERY_FEES: Record<DeliveryOption, number> = {
  standard: 0,
  express: 49.9,
};

export function CheckoutClient({
  locale,
  dict,
  user,
}: {
  locale: Locale;
  dict: Dictionary;
  user: { name: string; email: string } | null;
}) {
  const { items, totalPrice, clearCart } = useCart();
  const [checkoutStep, setCheckoutStep] = useState<"auth" | "form">(user ? "form" : "auth");
  const [address, setAddress] = useState<OrderAddress>({
    ...EMPTY_ADDRESS,
    fullName: user?.name ?? "",
    email: user?.email ?? "",
  });
  const [deliveryOption, setDeliveryOption] = useState<DeliveryOption>("standard");
  const [payment, setPayment] = useState(EMPTY_PAYMENT);
  const [status, setStatus] = useState<"idle" | "processing" | "success">("idle");
  const [orderId, setOrderId] = useState<string | null>(null);

  function updateAddress<K extends keyof OrderAddress>(key: K, value: OrderAddress[K]) {
    setAddress((prev) => ({ ...prev, [key]: value }));
  }

  function updatePayment<K extends keyof PaymentFormState>(key: K, value: PaymentFormState[K]) {
    setPayment((prev) => ({ ...prev, [key]: value }));
  }

  const deliveryFee = DELIVERY_FEES[deliveryOption];
  const grandTotal = totalPrice + deliveryFee;

  useEffect(() => {
    if (items.length > 0) trackBeginCheckout(items);
    // Only fire once when the checkout page is first reached with items in the cart.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus("processing");

    const orderItems: OrderItem[] = items
      .map((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (!product) return null;
        return {
          productId: product.id,
          title: product.title,
          price: product.price,
          quantity: item.quantity,
        };
      })
      .filter((item): item is OrderItem => item !== null);

    const order: Order = {
      id: `BK-${Date.now().toString().slice(-8)}`,
      items: orderItems,
      address,
      deliveryOption,
      total: grandTotal,
      createdAt: new Date().toISOString(),
    };

    const result = await paymentProvider.processPayment(order);

    if (result.success) {
      trackPurchase(order);
      setOrderId(order.id);
      setStatus("success");
      clearCart();
    } else {
      setStatus("idle");
    }
  }

  if (status === "success" && orderId) {
    return (
      <div className="rounded-lg border border-black/5 bg-white p-12 text-center">
        <h2 className="font-serif text-2xl font-semibold text-green-700">
          {dict.checkout.successTitle}
        </h2>
        <p className="mt-2 text-foreground/70">{dict.checkout.successMessage}</p>
        <p className="mt-4 text-base leading-relaxed text-foreground/50">
          {dict.checkout.orderNumber}: <span className="font-semibold">{orderId}</span>
        </p>
        <Link
          href={localePath(locale, "/bookstore")}
          className="mt-6 inline-block rounded-md bg-brand-primary px-5 py-2.5 text-base font-semibold text-white hover:opacity-90"
        >
          {dict.cart.continueShopping}
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-black/5 bg-white p-12 text-center">
        <p className="text-foreground/60">{dict.checkout.emptyCartNotice}</p>
        <Link
          href={localePath(locale, "/bookstore")}
          className="mt-4 inline-block rounded-md bg-brand-primary px-5 py-2.5 text-base font-semibold text-white hover:opacity-90"
        >
          {dict.cart.continueShopping}
        </Link>
      </div>
    );
  }

  if (checkoutStep === "auth") {
    return (
      <CheckoutAuthStep
        locale={locale}
        dict={dict}
        onContinueAsGuest={() => setCheckoutStep("form")}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <div className="flex flex-col gap-6">
        <CheckoutAddressForm
          address={address}
          onAddressChange={updateAddress}
          deliveryOption={deliveryOption}
          onDeliveryChange={setDeliveryOption}
          dict={dict}
        />
        <CheckoutPaymentForm payment={payment} onPaymentChange={updatePayment} dict={dict} />
      </div>

      <div className="flex h-fit flex-col gap-4 rounded-lg border border-black/5 bg-white p-5">
        <h2 className="font-serif text-lg font-semibold">{dict.checkout.orderSummary}</h2>
        <div className="flex flex-col gap-2 text-base">
          {items.map((item) => {
            const product = products.find((p) => p.id === item.productId);
            if (!product) return null;
            return (
              <div key={item.productId} className="flex items-center justify-between">
                <span className="text-foreground/70">
                  {product.title} × {item.quantity}
                </span>
                <span className="font-medium">
                  {formatPrice(product.price * item.quantity, locale)}
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between border-t border-black/5 pt-3 text-base">
          <span className="text-foreground/60">{dict.common.subtotal}</span>
          <span>{formatPrice(totalPrice, locale)}</span>
        </div>
        <div className="flex items-center justify-between text-base">
          <span className="text-foreground/60">
            {deliveryOption === "standard"
              ? dict.checkout.deliveryStandard
              : dict.checkout.deliveryExpress}
          </span>
          <span>{formatPrice(deliveryFee, locale)}</span>
        </div>
        <div className="flex items-center justify-between border-t border-black/5 pt-3 text-base font-semibold">
          <span>{dict.common.total}</span>
          <span>{formatPrice(grandTotal, locale)}</span>
        </div>
        <button
          type="submit"
          disabled={status === "processing"}
          className="mt-2 rounded-md bg-brand-primary px-4 py-3 text-base font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "processing" ? dict.checkout.processing : dict.checkout.placeOrder}
        </button>
      </div>
    </form>
  );
}
