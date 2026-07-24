import { getDb } from "./mongodb";
import { Order, NewOrderInput } from "./types";
import { generateOrderId } from "./services";

const COLLECTION = "orders";

/** Map a MongoDB document to the app's Order interface. */
function fromDoc(doc: Record<string, unknown>): Order {
  return {
    id: doc.id as string,
    platform: doc.platform as string,
    serviceName: doc.serviceName as string,
    quantity: doc.quantity as number,
    username: doc.username as string || "Unknown",
    targetUrl: doc.targetUrl as string,
    ratePer1k: Number(doc.ratePer1k),
    total: Number(doc.total),
    paymentMethod: doc.paymentMethod as Order["paymentMethod"],
    paymentStatus: (doc.paymentStatus as Order["paymentStatus"]) || "unpaid",
    paystackReference: (doc.paystackReference as string) || null,
    status: doc.status as Order["status"],
    deliveredCount: (doc.deliveredCount as number) || 0,
    customerEmail: (doc.customerEmail as string) || "",
    customerPhone: (doc.customerPhone as string) || "",
    whatsappOptIn: Boolean(doc.whatsappOptIn),
    note: (doc.note as string) || null,
    couponCode: (doc.couponCode as string) || null,
    discountAmount: doc.discountAmount !== undefined && doc.discountAmount !== null ? Number(doc.discountAmount) : null,
    isResellerOrder: Boolean(doc.isResellerOrder),
    resellerEmail: (doc.resellerEmail as string) || null,
    createdAt: doc.createdAt as string,
    updatedAt: doc.updatedAt as string,
  };
}

export async function mongoListOrders(): Promise<Order[]> {
  const db = await getDb();
  const docs = await db
    .collection(COLLECTION)
    .find({})
    .sort({ createdAt: -1 })
    .toArray();
  return docs.map((d) => fromDoc(d as unknown as Record<string, unknown>));
}

export async function mongoGetOrder(id: string): Promise<Order | null> {
  const db = await getDb();
  const doc = await db
    .collection(COLLECTION)
    .findOne({ id: { $regex: new RegExp(`^${id}$`, "i") } });
  if (!doc) return null;
  return fromDoc(doc as unknown as Record<string, unknown>);
}

export async function mongoGetOrderByPaystackRef(ref: string): Promise<Order | null> {
  const db = await getDb();
  const doc = await db.collection(COLLECTION).findOne({ paystackReference: ref });
  if (!doc) return null;
  return fromDoc(doc as unknown as Record<string, unknown>);
}

export async function mongoCreateOrder(input: NewOrderInput): Promise<Order | null> {
  const db = await getDb();
  const now = new Date().toISOString();
  const order: Order = {
    id: generateOrderId(),
    platform: input.platform,
    serviceName: input.serviceName,
    quantity: input.quantity,
    username: input.username,
    targetUrl: input.targetUrl,
    ratePer1k: input.ratePer1k,
    total: input.total,
    paymentMethod: input.paymentMethod,
    paymentStatus: "unpaid",
    paystackReference: null,
    status: "pending",
    deliveredCount: 0,
    customerEmail: input.customerEmail,
    customerPhone: input.customerPhone,
    whatsappOptIn: input.whatsappOptIn || false,
    couponCode: input.couponCode || null,
    discountAmount: input.discountAmount || null,
    isResellerOrder: Boolean(input.isResellerOrder),
    resellerEmail: input.resellerEmail || null,
    note: null,
    createdAt: now,
    updatedAt: now,
  };


  await db.collection(COLLECTION).insertOne({ ...order });
  return order;
}

export async function mongoUpdateOrder(
  id: string,
  patch: Partial<Pick<Order, "status" | "deliveredCount" | "note" | "paymentStatus" | "paystackReference">>
): Promise<Order | null> {
  const db = await getDb();
  const update: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  if (patch.status !== undefined) update.status = patch.status;
  if (patch.deliveredCount !== undefined) update.deliveredCount = patch.deliveredCount;
  if (patch.note !== undefined) update.note = patch.note;
  if (patch.paymentStatus !== undefined) update.paymentStatus = patch.paymentStatus;
  if (patch.paystackReference !== undefined) update.paystackReference = patch.paystackReference;

  const result = await db
    .collection(COLLECTION)
    .findOneAndUpdate(
      { id: { $regex: new RegExp(`^${id}$`, "i") } },
      { $set: update },
      { returnDocument: "after" }
    );

  if (!result) return null;
  return fromDoc(result as unknown as Record<string, unknown>);
}

export async function mongoStats() {
  const orders = await mongoListOrders();
  const pending = orders.filter((o) => o.status === "pending" || o.status === "processing").length;
  const revenue = orders.filter((o) => o.paymentStatus === "paid").reduce((s, o) => s + o.total, 0);
  const activeServices = new Set(orders.map((o) => o.platform)).size;
  return {
    totalOrders: orders.length,
    pendingOrders: pending,
    monthlyRevenue: revenue,
    activeServices,
  };
}
