import { NextRequest, NextResponse } from "next/server";
import { verifyTransaction } from "@/lib/paystack";
import { getOrderByPaystackRef, updateOrder, getOrder } from "@/lib/store";
import { notifyAdminTelegram } from "@/lib/telegram-notify";
import { sendAdminOrderAlert, sendCustomerReceipt } from "@/lib/mail";

/**
 * Paystack callback redirect.
 * After payment, Paystack redirects the customer here.
 * We verify the transaction and redirect to the tracking page.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("order_id");
  const reference = searchParams.get("reference") || searchParams.get("trxref");
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  if (!orderId) {
    return NextResponse.redirect(`${baseUrl}/track`);
  }

  // Verify the transaction with Paystack
  if (reference) {
    try {
      const txn = await verifyTransaction(reference);
      if (txn.data.status === "success") {
        let order = await getOrderByPaystackRef(reference);
        
        // Fallback to orderId from metadata or URL
        if (!order) {
          const metadataOrderId = txn.data.metadata?.order_id as string | undefined;
          const targetOrderId = metadataOrderId || orderId;
          if (targetOrderId) {
            order = await getOrder(targetOrderId);
          }
        }

        if (order && order.paymentStatus !== "paid") {
          const updated = await updateOrder(order.id, {
            paymentStatus: "paid",
            status: order.status === "pending" ? "processing" : order.status,
          });
          if (updated) {
            // Send email receipts and alerts
            sendAdminOrderAlert(updated).catch(console.error);
            sendCustomerReceipt(updated).catch(console.error);
            
            // Notify admin via Telegram
            notifyAdminTelegram(updated).catch(console.error);
          }
        }
        return NextResponse.redirect(`${baseUrl}/track?id=${encodeURIComponent(orderId)}&paid=1`);
      } else {
        // Payment failed or was abandoned
        let order = await getOrder(orderId);
        if (order && order.paymentStatus === "unpaid") {
          await updateOrder(order.id, { paymentStatus: "failed" });
        }
        return NextResponse.redirect(`${baseUrl}/track?id=${encodeURIComponent(orderId)}&payment=failed`);
      }
    } catch (err) {
      console.error("Paystack verify error:", err);
    }
  }

  // Fallback: redirect to tracking page
  return NextResponse.redirect(`${baseUrl}/track?id=${encodeURIComponent(orderId)}`);
}
