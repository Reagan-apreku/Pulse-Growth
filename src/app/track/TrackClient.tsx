"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, CheckCircle2, MessageCircle, AlertCircle, CreditCard, XCircle, FileText } from "lucide-react";
import { Order } from "@/lib/types";
import { StatusStepper } from "@/components/StatusStepper";

const POLL_INTERVAL_MS = 4000;

export function TrackClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialId = searchParams.get("id") || "";
  const justPaid = searchParams.get("paid") === "1";
  const paymentFailed = searchParams.get("payment") === "failed";

  const [inputId, setInputId] = useState(initialId);
  const [order, setOrder] = useState<Order | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchOrder = useCallback(async (id: string, showLoading = true) => {
    if (!id.trim()) return;
    if (showLoading) setLoading(true);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(id.trim())}`);
      if (!res.ok) {
        setOrder(null);
        setNotFound(true);
        return;
      }
      const data = await res.json();
      setOrder(data.order);
      setNotFound(false);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialId) fetchOrder(initialId);
  }, [initialId, fetchOrder]);

  // Live polling — swap for a Supabase Realtime channel subscription
  // (postgres_changes on `orders`, filtered by id) for push-based updates.
  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (order?.id && order.status !== "completed" && order.status !== "cancelled") {
      pollRef.current = setInterval(() => fetchOrder(order.id, false), POLL_INTERVAL_MS);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [order?.id, order?.status, fetchOrder]);

  function handleSearch() {
    router.replace(`/track?id=${encodeURIComponent(inputId.trim())}`);
    fetchOrder(inputId);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="bento p-8 text-center sm:p-10">
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">Track your growth</h1>
        <p className="mx-auto mt-2 max-w-md text-ink-soft">
          Enter your unique order ID to instantly view real-time delivery status, service
          details, and live growth metrics.
        </p>

        {justPaid && (
          <div className="mx-auto mt-5 flex w-fit items-center gap-2 rounded-full bg-signal-soft px-4 py-2 text-sm text-signal">
            <CheckCircle2 className="h-4 w-4" /> Payment confirmed — your order is being processed!
          </div>
        )}

        {paymentFailed && (
          <div className="mx-auto mt-5 flex w-fit items-center gap-2 rounded-full bg-danger-soft px-4 py-2 text-sm text-danger">
            <XCircle className="h-4 w-4" /> Payment was not completed. You can retry below.
          </div>
        )}

        <div className="mx-auto mt-6 flex max-w-md gap-2">
          <input
            value={inputId}
            onChange={(e) => setInputId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Enter Order ID (e.g., SMM-98765)"
            className="w-full rounded-full border border-line bg-canvas-raised px-5 py-3 text-sm placeholder:text-ink-faint"
          />
          <button
            onClick={handleSearch}
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-canvas hover:opacity-90"
          >
            <Search className="h-4 w-4" /> Track
          </button>
        </div>
      </div>

      {loading && <p className="mt-6 text-center text-sm text-ink-soft">Looking up your order…</p>}

      {notFound && !loading && (
        <p className="mt-6 text-center text-sm text-ink-soft">
          We couldn&apos;t find an order with that ID. Double check it and try again.
        </p>
      )}

      {order && !loading && (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Payment status banner */}
          {order.paymentStatus === "unpaid" && (
            <div className="bento flex items-center gap-3 border-warn bg-warn-soft p-5 md:col-span-2">
              <AlertCircle className="h-5 w-5 shrink-0 text-warn" />
              <div className="flex-1">
                <p className="font-medium text-warn">Payment pending</p>
                <p className="text-sm text-ink-soft">
                  This order is awaiting payment. Complete your payment to start processing.
                </p>
              </div>
              <a
                href={`/order`}
                className="shrink-0 rounded-full bg-warn px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
              >
                Retry payment
              </a>
            </div>
          )}

          {order.paymentStatus === "failed" && (
            <div className="bento flex items-center gap-3 border-danger bg-danger-soft p-5 md:col-span-2">
              <XCircle className="h-5 w-5 shrink-0 text-danger" />
              <div className="flex-1">
                <p className="font-medium text-danger">Payment failed</p>
                <p className="text-sm text-ink-soft">
                  Your payment could not be processed. Please try again with a new order.
                </p>
              </div>
            </div>
          )}

          <div className="bento p-6 md:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <p className="font-medium">Order status</p>
              <div className="flex items-center gap-2">
                {order.paymentStatus === "paid" && (
                  <span className="flex items-center gap-1 rounded-full bg-signal-soft px-3 py-1 text-xs font-semibold text-signal">
                    <CreditCard className="h-3 w-3" /> Paid
                  </span>
                )}
                <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold capitalize text-accent">
                  {order.status.replace("_", " ")}
                </span>
              </div>
            </div>
            <StatusStepper status={order.status} updatedAt={order.updatedAt} />
          </div>

          <div className="bento p-6">
            <p className="font-medium">Order details</p>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-soft">Service</dt>
                <dd className="text-right font-medium">{order.serviceName}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-soft">Quantity</dt>
                <dd className="font-data font-medium">{order.quantity.toLocaleString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-soft">Target</dt>
                <dd className="font-data font-medium">{order.targetUrl}</dd>
              </div>
              <div className="flex justify-between border-t border-dashed border-line pt-3">
                <dt className="text-ink-soft">Payment</dt>
                <dd className="font-medium capitalize">{order.paymentMethod}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-soft">Total</dt>
                <dd className="font-data font-semibold">₵{order.total.toFixed(2)}</dd>
              </div>
            </dl>
            {order.paymentStatus === "paid" && (
              <a
                href={`/receipt/${order.id}`}
                className="mt-5 flex items-center justify-center gap-2 rounded-full border border-line px-4 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:bg-canvas hover:text-ink"
              >
                <FileText className="h-4 w-4" /> View Receipt
              </a>
            )}
          </div>

          <div className="bento flex flex-col p-6">
            <div className="flex items-end justify-between">
              <p className="font-medium">Delivery progress</p>
              <p className="font-data text-2xl font-semibold">
                {Math.round((order.deliveredCount / order.quantity) * 100)}%
              </p>
            </div>
            <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-canvas">
              <div
                className="h-full rounded-full bg-accent transition-all duration-700"
                style={{ width: `${Math.min(100, (order.deliveredCount / order.quantity) * 100)}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-ink-soft">
              {order.deliveredCount.toLocaleString()} / {order.quantity.toLocaleString()} delivered
            </p>

            <div className="mt-auto pt-6">
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "233000000000"}?text=${encodeURIComponent(
                  `Hi! I need help with order ${order.id}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-full bg-signal px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
              >
                <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
