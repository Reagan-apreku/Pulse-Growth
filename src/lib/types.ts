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
  username: string;
  targetUrl: string;
  ratePer1k: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paystackReference: string | null;
  status: OrderStatus;
  deliveredCount: number;
  customerEmail: string;
  customerPhone: string;
  whatsappOptIn: boolean;
  note: string | null;
  couponCode?: string | null;
  discountAmount?: number | null;
  isResellerOrder?: boolean;
  resellerEmail?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NewOrderInput {
  platform: string;
  serviceName: string;
  quantity: number;
  username: string;
  targetUrl: string;
  ratePer1k: number;
  total: number;
  paymentMethod: PaymentMethod;
  customerEmail: string;
  customerPhone: string;
  whatsappOptIn?: boolean;
  couponCode?: string;
  discountAmount?: number;
  isResellerOrder?: boolean;
  resellerEmail?: string;
}

export interface Service {
  platform: string;
  icon: string;
  name: string;
  description: string;
  startingPrice: number;
  serviceTypes: { label: string; ratePer1k: number; minOrder?: number }[];
}

export type DiscountType = "percentage" | "fixed";

export interface Coupon {
  id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  maxUses: number | null;
  usedCount: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CouponUsage {
  id: string;
  couponCode: string;
  customerEmail: string | null;
  machineId: string;
  orderId: string;
  usedAt: string;
}

export interface ResellerAccount {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  businessName: string | null;
  phone: string | null;
  status: "pending" | "active" | "inactive";
  discountPercentage: number; // default 10
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
  updatedAt: string;
}



