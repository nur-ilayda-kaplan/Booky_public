import type { Order } from "@/types";

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  message: string;
}

export interface PaymentProvider {
  processPayment(order: Order): Promise<PaymentResult>;
}
