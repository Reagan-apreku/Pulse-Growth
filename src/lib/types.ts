export type OrderStatus =
  | "pending"
  | "processing"
  | "in_progress"
  | "completed"
  | "cancelled";

export type PaymentStatus = "unpaid" | "paid" | "failed";

export type PaymentMethod = "paystack";

export interface Order {
  id: string; // e.g. SMM-98765
  platform: string;
  serviceName: string;
  quantity: number;
  targetUrl: string;
  ratePer1k: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paystackReference: string | null;
  status: OrderStatus;
  deliveredCount: number;
  customerEmail: string | null;
  customerPhone: string | null;
  whatsappOptIn: boolean;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NewOrderInput {
  platform: string;
  serviceName: string;
  quantity: number;
  targetUrl: string;
  ratePer1k: number;
  total: number;
  paymentMethod: PaymentMethod;
  customerEmail?: string;
  customerPhone?: string;
  whatsappOptIn?: boolean;
}

export interface Service {
  platform: string;
  icon: string;
  name: string;
  description: string;
  startingPrice: number;
  serviceTypes: { label: string; ratePer1k: number; minOrder?: number }[];
}
