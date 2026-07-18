import fs from "fs";
import path from "path";
import { Order, NewOrderInput, OrderStatus, PaymentStatus } from "./types";
import { generateOrderId } from "./services";

const DATA_FILE = path.join(process.cwd(), "src", "lib", "data", "orders.local.json");

function seedOrders(): Order[] {
  const now = new Date();
  const iso = (mins: number) => new Date(now.getTime() - mins * 60000).toISOString();
  return [
    {
      id: "SMM-98765",
      platform: "Instagram",
      serviceName: "Instagram Premium Followers",
      quantity: 5000,
      targetUrl: "@smmgrowth_official",
      ratePer1k: 45,
      total: 225,
      paymentMethod: "paystack",
      paymentStatus: "paid",
      paystackReference: "demo_ref_001",
      status: "in_progress",
      deliveredCount: 3750,
      customerEmail: "demo@customer.test",
      customerPhone: null,
      whatsappOptIn: true,
      note: null,
      createdAt: iso(45),
      updatedAt: iso(5),
    },
    {
      id: "ORD-9921",
      platform: "Instagram",
      serviceName: "IG Followers HQ",
      quantity: 2000,
      targetUrl: "@tech_startup_x",
      ratePer1k: 22,
      total: 44,
      paymentMethod: "paystack",
      paymentStatus: "paid",
      paystackReference: "demo_ref_002",
      status: "completed",
      deliveredCount: 2000,
      customerEmail: "tech_startup_x@mail.test",
      customerPhone: null,
      whatsappOptIn: false,
      note: null,
      createdAt: iso(60 * 24 * 3),
      updatedAt: iso(60 * 24 * 2),
    },
    {
      id: "ORD-9922",
      platform: "X (Twitter)",
      serviceName: "X Retweets Global",
      quantity: 1000,
      targetUrl: "@crypto_daily",
      ratePer1k: 20,
      total: 20,
      paymentMethod: "paystack",
      paymentStatus: "paid",
      paystackReference: "demo_ref_003",
      status: "processing",
      deliveredCount: 220,
      customerEmail: "crypto_daily@mail.test",
      customerPhone: null,
      whatsappOptIn: true,
      note: null,
      createdAt: iso(60 * 24 * 2),
      updatedAt: iso(30),
    },
    {
      id: "ORD-9923",
      platform: "YouTube",
      serviceName: "YT Views Fast",
      quantity: 10000,
      targetUrl: "gaming_channel",
      ratePer1k: 12,
      total: 120,
      paymentMethod: "paystack",
      paymentStatus: "paid",
      paystackReference: "demo_ref_004",
      status: "cancelled",
      deliveredCount: 0,
      customerEmail: "gaming_channel@mail.test",
      customerPhone: null,
      whatsappOptIn: false,
      note: "Customer requested refund — invalid link.",
      createdAt: iso(60 * 24 * 4),
      updatedAt: iso(60 * 24 * 3),
    },
    {
      id: "ORD-9924",
      platform: "Facebook",
      serviceName: "FB Page Likes",
      quantity: 3000,
      targetUrl: "local_biz_y",
      ratePer1k: 32,
      total: 96,
      paymentMethod: "paystack",
      paymentStatus: "paid",
      paystackReference: "demo_ref_005",
      status: "processing",
      deliveredCount: 900,
      customerEmail: "local_biz_y@mail.test",
      customerPhone: null,
      whatsappOptIn: true,
      note: null,
      createdAt: iso(60 * 24),
      updatedAt: iso(10),
    },
  ];
}

function ensureFile(): Order[] {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      const seeded = seedOrders();
      fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
      fs.writeFileSync(DATA_FILE, JSON.stringify(seeded, null, 2));
      return seeded;
    }
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(raw) as Order[];
  } catch {
    return seedOrders();
  }
}

function persist(orders: Order[]) {
  try {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(orders, null, 2));
  } catch {
    // Read-only filesystem (e.g. some serverless hosts) — in-memory only for this request.
  }
}

export function localListOrders(): Order[] {
  return ensureFile().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function localGetOrder(id: string): Order | null {
  const orders = ensureFile();
  return orders.find((o) => o.id.toLowerCase() === id.toLowerCase()) || null;
}

export function localGetOrderByPaystackRef(ref: string): Order | null {
  const orders = ensureFile();
  return orders.find((o) => o.paystackReference === ref) || null;
}

export function localCreateOrder(input: NewOrderInput): Order {
  const orders = ensureFile();
  const now = new Date().toISOString();
  const order: Order = {
    id: generateOrderId(),
    platform: input.platform,
    serviceName: input.serviceName,
    quantity: input.quantity,
    targetUrl: input.targetUrl,
    ratePer1k: input.ratePer1k,
    total: input.total,
    paymentMethod: input.paymentMethod,
    paymentStatus: "unpaid",
    paystackReference: null,
    status: "pending",
    deliveredCount: 0,
    customerEmail: input.customerEmail || null,
    customerPhone: input.customerPhone || null,
    whatsappOptIn: input.whatsappOptIn || false,
    note: null,
    createdAt: now,
    updatedAt: now,
  };
  orders.unshift(order);
  persist(orders);
  return order;
}

export function localUpdateOrder(
  id: string,
  patch: Partial<Pick<Order, "status" | "deliveredCount" | "note" | "paymentStatus" | "paystackReference">>
): Order | null {
  const orders = ensureFile();
  const idx = orders.findIndex((o) => o.id.toLowerCase() === id.toLowerCase());
  if (idx === -1) return null;
  orders[idx] = { ...orders[idx], ...patch, updatedAt: new Date().toISOString() };
  persist(orders);
  return orders[idx];
}

export function localStats() {
  const orders = ensureFile();
  const pending = orders.filter((o) => o.status === "pending" || o.status === "processing").length;
  const revenue = orders
    .filter((o) => o.paymentStatus === "paid")
    .reduce((sum, o) => sum + o.total, 0);
  const activeServices = new Set(orders.map((o) => o.platform)).size;
  return {
    totalOrders: orders.length,
    pendingOrders: pending,
    monthlyRevenue: revenue,
    activeServices,
  };
}

export type { OrderStatus, PaymentStatus };
