import { MockPaymentProvider } from "./mockPaymentProvider";

export type { PaymentProvider, PaymentResult } from "./types";

export const paymentProvider = new MockPaymentProvider();
