export interface OrderAddress {
  fullName: string;
  phone: string;
  email: string;
  addressLine: string;
  city: string;
  postalCode: string;
}

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
}

export type DeliveryOption = "standard" | "express";

export interface Order {
  id: string;
  items: OrderItem[];
  address: OrderAddress;
  deliveryOption: DeliveryOption;
  total: number;
  createdAt: string;
}
