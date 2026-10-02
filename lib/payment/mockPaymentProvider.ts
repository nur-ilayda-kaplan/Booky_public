import type { Order } from "@/types";
import type { PaymentProvider, PaymentResult } from "./types";

// Mock implementation used while there is no real payment provider wired up.
// To go live, implement PaymentProvider with İyzico/Stripe/PayTR (or similar)
// and swap the export in ./index.ts — call sites never need to change.
export class MockPaymentProvider implements PaymentProvider {
  async processPayment(order: Order): Promise<PaymentResult> {
    await new Promise((resolve) => setTimeout(resolve, 800));

    return {
      success: true,
      transactionId: `mock_${order.id}_${Date.now()}`,
      message: "Ödeme başarıyla tamamlandı (mock).",
    };
  }
}
