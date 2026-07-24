"use client";

import { Order } from "@/lib/types";
import { Zap, Printer, Share2, CheckCircle2 } from "lucide-react";

export function ReceiptView({ order }: { order: Order }) {
  const isPaid = order.paymentStatus === "paid";

  function handlePrint() {
    window.print();
  }

  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: `Receipt — ${order.id}`, url });
    } else {
      await navigator.clipboard.writeText(url);
      alert("Receipt link copied to clipboard!");
    }
  }

  return (
    <div className="min-h-screen bg-canvas px-5 py-10 sm:px-8 sm:py-14">
      {/* Action bar — hidden in print */}
      <div className="mx-auto mb-6 flex max-w-xl items-center justify-between print:hidden">
        <a href={`/track?id=${order.id}`} className="text-sm font-medium text-accent hover:underline">
          ← Back to tracking
        </a>
        <div className="flex gap-2">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-canvas-raised"
          >
            <Share2 className="h-3.5 w-3.5" /> Share
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-canvas hover:opacity-90"
          >
            <Printer className="h-3.5 w-3.5" /> Print
          </button>
        </div>
      </div>

      {/* Receipt card */}
      <div className="mx-auto max-w-xl rounded-2xl border border-line bg-canvas-raised p-8 shadow-sm print:shadow-none print:border-0 sm:p-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-display text-lg font-semibold">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-canvas">
              <Zap className="h-4 w-4" strokeWidth={2.5} />
            </span>
            Pulse
          </div>
          <div className="text-right">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">Receipt</p>
            <p className="font-data text-sm font-semibold">{order.id}</p>
          </div>
        </div>

        {/* Payment status */}
        <div className="mt-6 flex items-center gap-2">
          {isPaid ? (
            <span className="flex items-center gap-1.5 rounded-full bg-signal-soft px-3 py-1.5 text-sm font-semibold text-signal">
              <CheckCircle2 className="h-4 w-4" /> Payment Confirmed
            </span>
          ) : (
            <span className="rounded-full bg-warn-soft px-3 py-1.5 text-sm font-semibold text-warn">
              Awaiting Payment
            </span>
          )}
        </div>

        {/* Divider */}
        <div className="my-6 border-t border-dashed border-line" />

        {/* Order details */}
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-ink-soft">Service</span>
            <span className="text-right font-medium">{order.serviceName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-soft">Platform</span>
            <span className="font-medium">{order.platform}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-soft">Target Username</span>
            <span className="font-data font-medium text-right">{order.username}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-soft">Target URL</span>
            <span className="font-data font-medium text-right break-all ml-4 max-w-[200px]">{order.targetUrl}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-soft">Quantity</span>
            <span className="font-data font-medium">{order.quantity.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-soft">Rate per 1k</span>
            <span className="font-data font-medium">₵{order.ratePer1k.toFixed(2)}</span>
          </div>
        </div>

        {/* Total */}
        <div className="my-6 border-t border-dashed border-line" />
        <div className="flex items-end justify-between">
          <span className="text-sm font-medium text-ink-soft">Total Paid</span>
          <span className="font-data text-3xl font-semibold">₵{order.total.toFixed(2)}</span>
        </div>

        {/* Footer */}
        <div className="my-6 border-t border-dashed border-line" />
        <div className="space-y-1.5 text-xs text-ink-faint">
          <div className="flex justify-between">
            <span>Payment method</span>
            <span className="capitalize">{order.paymentMethod}</span>
          </div>
          {order.paystackReference && (
            <div className="flex justify-between">
              <span>Reference</span>
              <span className="font-data">{order.paystackReference}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Date</span>
            <span>{new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
          </div>
          {order.customerEmail && (
            <div className="flex justify-between">
              <span>Email</span>
              <span>{order.customerEmail}</span>
            </div>
          )}
        </div>

        <p className="mt-8 text-center text-xs text-ink-faint">
          © {new Date().getFullYear()} Pulse Growth Labs · Thank you for your order
        </p>
      </div>
    </div>
  );
}
