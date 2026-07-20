import fs from "fs";
import path from "path";
import { Order, NewOrderInput, OrderStatus, PaymentStatus } from "./types";
import { generateOrderId } from "./services";

const DATA_FILE = path.join(process.cwd(), "src", "lib", "data", "orders.local.json");

function seedOrders(): Order[] {
  return [];
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
    couponCode: input.couponCode || null,
    discountAmount: input.discountAmount || null,
    isResellerOrder: Boolean(input.isResellerOrder),
    resellerEmail: input.resellerEmail || null,
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
