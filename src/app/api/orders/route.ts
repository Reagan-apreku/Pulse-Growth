import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createOrder, listOrders, updateOrder } from "@/lib/store";
import { NewOrderInput } from "@/lib/types";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";
import { initializeTransaction, ghsToPesewas } from "@/lib/paystack";
import { generateOrderId } from "@/lib/services";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET() {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  if (!session) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  const orders = await listOrders();
  return NextResponse.json({ orders });
}

export async function POST(req: NextRequest) {
  // Rate limit: 5 orders per minute per IP
  const ip = getClientIp(req.headers);
  const rl = rateLimit(`orders:${ip}`, 5, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    );
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { platform, serviceName, quantity, targetUrl, ratePer1k, total } = body;

  if (!platform || !serviceName || !quantity || !targetUrl || !ratePer1k || !total) {
    return NextResponse.json({ error: "Missing required order fields." }, { status: 400 });
  }

  const input: NewOrderInput = {
    platform,
    serviceName,
    quantity: Number(quantity),
    targetUrl,
    ratePer1k: Number(ratePer1k),
    total: Number(total),
    paymentMethod: "paystack",
    customerEmail: body.customerEmail,
    customerPhone: body.customerPhone,
    whatsappOptIn: Boolean(body.whatsappOptIn),
    couponCode: body.couponCode,
    discountAmount: body.discountAmount ? Number(body.discountAmount) : undefined,
    isResellerOrder: Boolean(body.isResellerOrder),
    resellerEmail: body.resellerEmail,
  };

  const order = await createOrder(input);
  if (!order) {
    return NextResponse.json({ error: "Could not create order." }, { status: 500 });
  }

  // Record coupon usage if applied
  if (body.couponCode && body.machineId) {
    const { recordCouponUsage } = await import("@/lib/coupons");
    await recordCouponUsage(body.couponCode, body.machineId, body.customerEmail || null, order.id).catch(() => {});
  }

  // Record reseller order stats if reseller
  if (body.isResellerOrder && body.resellerEmail) {
    const { recordResellerOrder } = await import("@/lib/resellers");
    await recordResellerOrder(body.resellerEmail, order.total).catch(() => {});
  }


  // If Paystack is configured, initialize a transaction
  const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
  if (paystackSecret) {
    try {
      const email = input.customerEmail || "customer@pulse.dev";
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
      const callbackUrl = `${baseUrl}/api/paystack/callback?order_id=${encodeURIComponent(order.id)}`;
      const reference = `${order.id}-${Date.now()}`;

      const txn = await initializeTransaction({
        email,
        amount: ghsToPesewas(order.total),
        reference,
        callbackUrl,
        metadata: {
          order_id: order.id,
          platform: order.platform,
          service: order.serviceName,
        },
      });

      // Store the reference on the order
      await updateOrder(order.id, { paystackReference: reference });

      return NextResponse.json(
        {
          order: { ...order, paystackReference: reference },
          paymentUrl: txn.data.authorization_url,
        },
        { status: 201 }
      );
    } catch (err) {
      console.error("Paystack init error:", err);
      // Return the order anyway so they can retry payment
      return NextResponse.json(
        { order, error: "Payment initialization failed. Please try again." },
        { status: 201 }
      );
    }
  }

  // No Paystack configured (local dev) — auto-mark as paid
  await updateOrder(order.id, { paymentStatus: "paid", status: "processing" });
  return NextResponse.json(
    { order: { ...order, paymentStatus: "paid", status: "processing" } },
    { status: 201 }
  );
}
