import { isMongoConfigured } from "./mongodb";
import { Order, NewOrderInput } from "./types";
import {
  localListOrders,
  localGetOrder,
  localGetOrderByPaystackRef,
  localCreateOrder,
  localUpdateOrder,
  localStats,
} from "./local-db";
import {
  mongoListOrders,
  mongoGetOrder,
  mongoGetOrderByPaystackRef,
  mongoCreateOrder,
  mongoUpdateOrder,
  mongoStats,
} from "./mongo-db";

/**
 * Single data-access surface for the whole app.
 *
 * When MONGODB_URI is set, every call is backed by real MongoDB collections.
 * Without it, the app transparently falls back to a local JSON file so the
 * whole product — storefront, tracking, admin — runs immediately with
 * `npm run dev` and no setup. Swap in MongoDB whenever you're ready to
 * deploy for real; no other code needs to change.
 */
export async function listOrders(): Promise<Order[]> {
  return isMongoConfigured ? mongoListOrders() : localListOrders();
}

export async function getOrder(id: string): Promise<Order | null> {
  return isMongoConfigured ? mongoGetOrder(id) : localGetOrder(id);
}

export async function getOrderByPaystackRef(ref: string): Promise<Order | null> {
  return isMongoConfigured ? mongoGetOrderByPaystackRef(ref) : localGetOrderByPaystackRef(ref);
}

export async function createOrder(input: NewOrderInput): Promise<Order | null> {
  return isMongoConfigured ? mongoCreateOrder(input) : localCreateOrder(input);
}

export async function updateOrder(
  id: string,
  patch: Partial<Pick<Order, "status" | "deliveredCount" | "note" | "paymentStatus" | "paystackReference">>
): Promise<Order | null> {
  return isMongoConfigured ? mongoUpdateOrder(id, patch) : localUpdateOrder(id, patch);
}

export async function getStats() {
  return isMongoConfigured ? mongoStats() : localStats();
}
