import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getOrder, updateOrder } from "@/lib/store";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";
import { OrderStatus } from "@/lib/types";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const VALID_STATUSES: OrderStatus[] = ["pending", "processing", "in_progress", "completed", "cancelled"];

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Rate limit: 30 lookups per minute per IP
  const ip = getClientIp(_req.headers);
  const rl = rateLimit(`track:${ip}`, 30, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const { id } = await params;
  const order = await getOrder(id);
  if (!order) {
    return NextResponse.json({ error: "No order found with that ID." }, { status: 404 });
  }
  return NextResponse.json({ order });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  if (!session) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const patch: { status?: OrderStatus; deliveredCount?: number; note?: string; paymentStatus?: "unpaid" | "paid" | "failed" } = {};
  if (body.status) {
    if (!VALID_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }
    patch.status = body.status;
  }
  if (body.paymentStatus && ["unpaid", "paid", "failed"].includes(body.paymentStatus)) {
    patch.paymentStatus = body.paymentStatus as "unpaid" | "paid" | "failed";
  }
  if (typeof body.deliveredCount === "number") patch.deliveredCount = body.deliveredCount;
  if (typeof body.note === "string") patch.note = body.note;

  const updated = await updateOrder(id, patch);
  if (!updated) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  // Trigger completion email if the status was just changed to completed
  if (body.status === "completed") {
    const { sendOrderCompleteEmail } = await import("@/lib/mail");
    sendOrderCompleteEmail(updated).catch(console.error);
  }

  return NextResponse.json({ order: updated });
}
