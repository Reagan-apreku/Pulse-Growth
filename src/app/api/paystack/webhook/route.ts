import { NextRequest, NextResponse } from "next/server";
import { isValidWebhookSignature } from "@/lib/paystack";
import { getOrderByPaystackRef, updateOrder, getOrder } from "@/lib/store";
import { notifyAdminTelegram } from "@/lib/telegram-notify";

/**
 * Paystack webhook endpoint.
 * Docs: https://paystack.com/docs/payments/webhooks/
 *
 * Paystack sends POST requests here when a payment event occurs.
 * We verify the signature and update the order accordingly.
 */
export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  if (!isValidWebhookSignature(body, signature)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let event: { event: string; data: { reference: string; status: string; amount: number } };
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (event.event === "charge.success") {
    const reference = event.data.reference;
    let order = await getOrderByPaystackRef(reference);

    // Fallback: try to find by metadata.order_id
    if (!order && (event.data as any).metadata?.order_id) {
      order = await getOrder((event.data as any).metadata.order_id);
    }

    if (order) {
      const updated = await updateOrder(order.id, {
        paymentStatus: "paid",
        status: order.status === "pending" ? "processing" : order.status,
      });

      // Notify admin via Telegram
      if (updated) {
        notifyAdminTelegram(updated).catch(console.error);
      }
    }
  }

  // Always return 200 to acknowledge receipt
  return NextResponse.json({ received: true });
}
