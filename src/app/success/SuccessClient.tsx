"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Package, ArrowRight, Zap } from "lucide-react";
import { Order } from "@/lib/types";

export function SuccessClient() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    fetch(`/api/orders/${encodeURIComponent(id)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => setOrder(data.order))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <p className="text-center text-ink-soft py-10">Verifying your payment...</p>;
  }

  return (
    <div className="bento flex flex-col items-center justify-center p-8 sm:p-14 text-center relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-signal/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="bg-signal-soft text-signal rounded-full p-4 mb-6 relative">
        <CheckCircle2 className="h-12 w-12" />
        <div className="absolute inset-0 rounded-full border-2 border-signal animate-ping opacity-20" />
      </div>
      
      <h1 className="font-display text-3xl font-semibold sm:text-4xl text-ink">Thank you for your order!</h1>
      <p className="mt-4 text-ink-soft max-w-lg mx-auto text-lg">
        Your payment was completely successful. We have received your order and our automated systems are processing it at the fastest possible time.
      </p>

      {order && (
        <div className="w-full mt-10 p-6 bg-canvas rounded-2xl border border-line text-left relative overflow-hidden">
          <div className="flex items-center gap-2 mb-4 text-ink font-medium">
            <Package className="h-5 w-5 text-signal" />
            Order Details
          </div>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-sm">
            <div>
              <dt className="text-ink-faint mb-1">Order ID</dt>
              <dd className="font-data font-medium text-ink">{order.id}</dd>
            </div>
            <div>
              <dt className="text-ink-faint mb-1">Service</dt>
              <dd className="font-medium text-ink">{order.serviceName}</dd>
            </div>
            <div>
              <dt className="text-ink-faint mb-1">Quantity</dt>
              <dd className="font-data font-medium text-ink">{order.quantity.toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-ink-faint mb-1">Total Paid</dt>
              <dd className="font-data font-semibold text-signal">₵{order.total.toFixed(2)}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-ink-faint mb-1">Target URL</dt>
              <dd className="font-medium text-ink break-all bg-canvas-raised p-2 rounded border border-line/50 mt-1">{order.targetUrl}</dd>
            </div>
          </dl>
          
          <div className="mt-6 flex items-start gap-3 p-4 bg-signal/5 border border-signal/20 rounded-xl">
            <Zap className="h-5 w-5 text-signal shrink-0 mt-0.5" />
            <p className="text-sm text-ink-soft">
              <strong className="text-ink font-medium">Everything is working smoothly!</strong> Your order has been placed into our priority queue and delivery will begin shortly based on the service speed.
            </p>
          </div>
        </div>
      )}

      <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        <a 
          href={`/track?id=${id || ""}`}
          className="flex items-center justify-center gap-2 px-8 py-4 bg-ink text-canvas rounded-full font-semibold hover:bg-ink/90 transition-transform active:scale-95"
        >
          Track Order Live
          <ArrowRight className="h-4 w-4" />
        </a>
        <a 
          href="/"
          className="flex items-center justify-center gap-2 px-8 py-4 bg-canvas text-ink border border-line rounded-full font-semibold hover:bg-canvas-raised transition-transform active:scale-95"
        >
          Place Another Order
        </a>
      </div>
    </div>
  );
}
