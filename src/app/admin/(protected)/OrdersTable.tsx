"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, ChevronDown, CreditCard, Save, Copy, Check } from "lucide-react";
import { clsx } from "clsx";
import { Order, OrderStatus, PaymentStatus } from "@/lib/types";

const STATUS_OPTIONS: OrderStatus[] = ["pending", "processing", "in_progress", "completed", "cancelled"];

const STATUS_STYLE: Record<OrderStatus, string> = {
  pending: "bg-warn-soft text-warn",
  processing: "bg-accent-soft text-accent",
  in_progress: "bg-accent-soft text-accent",
  completed: "bg-signal-soft text-signal",
  cancelled: "bg-danger-soft text-danger",
};

const PAYMENT_STYLE: Record<PaymentStatus, string> = {
  unpaid: "bg-warn-soft text-warn",
  paid: "bg-signal-soft text-signal",
  failed: "bg-danger-soft text-danger",
};

export function OrdersTable({ limit, showControls = true }: { limit?: number; showControls?: boolean }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [editingDelivered, setEditingDelivered] = useState<string | null>(null);
  const [deliveredValue, setDeliveredValue] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/orders");
    if (res.ok) {
      const data = await res.json();
      setOrders(data.orders);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    // Poll every 5s to stay in sync
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  async function updateStatus(id: string, status: OrderStatus) {
    setUpdatingId(id);
    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const data = await res.json();
      setOrders((prev) => prev.map((o) => (o.id === id ? data.order : o)));
    }
    setUpdatingId(null);
  }

  async function updatePaymentStatus(id: string, paymentStatus: PaymentStatus) {
    setUpdatingId(id);
    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentStatus }),
    });
    if (res.ok) {
      const data = await res.json();
      setOrders((prev) => prev.map((o) => (o.id === id ? data.order : o)));
    }
    setUpdatingId(null);
  }

  async function updateDelivered(id: string) {
    const count = parseInt(deliveredValue, 10);
    if (isNaN(count) || count < 0) return;
    setUpdatingId(id);
    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deliveredCount: count }),
    });
    if (res.ok) {
      const data = await res.json();
      setOrders((prev) => prev.map((o) => (o.id === id ? data.order : o)));
    }
    setUpdatingId(null);
    setEditingDelivered(null);
  }

  const filtered = useMemo(() => {
    let result = orders;
    if (statusFilter !== "all") result = result.filter((o) => o.status === statusFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.targetUrl.toLowerCase().includes(q) ||
          o.serviceName.toLowerCase().includes(q)
      );
    }
    return limit ? result.slice(0, limit) : result;
  }, [orders, statusFilter, search, limit]);

  return (
    <div className="bento p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-medium">{limit ? "Recent orders" : "All orders"}</p>
        {showControls && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-full border border-line bg-canvas px-3 py-1.5">
              <Search className="h-3.5 w-3.5 text-ink-faint" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search orders…"
                className="w-32 bg-transparent text-xs outline-none placeholder:text-ink-faint sm:w-44"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "all")}
              className="rounded-full border border-line bg-canvas px-3 py-1.5 text-xs font-medium capitalize"
            >
              <option value="all">All statuses</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s.replace("_", " ")}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <p className="py-8 text-center text-sm text-ink-soft">Loading orders…</p>
      ) : filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-ink-soft">No orders match.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-faint">
                <th className="py-2 pr-4 font-medium">Order ID</th>
                <th className="py-2 pr-4 font-medium">Service</th>
                <th className="py-2 pr-4 font-medium">Target</th>
                <th className="py-2 pr-4 font-medium">Total</th>
                <th className="py-2 pr-4 font-medium">Payment</th>
                <th className="py-2 pr-4 font-medium">Delivered</th>
                <th className="py-2 pr-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order.id} className="border-b border-line/70 last:border-0">
                  <td className="py-3 pr-4 font-data text-xs font-medium">{order.id}</td>
                  <td className="py-3 pr-4">{order.serviceName}</td>
                  <td className="py-3 pr-4">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(order.targetUrl);
                        setCopiedId(order.id);
                        setTimeout(() => setCopiedId(null), 2000);
                      }}
                      title="Click to copy"
                      className="group flex max-w-[200px] items-center gap-1.5 rounded-lg border border-transparent px-2 py-1 font-data text-xs text-ink-soft transition-colors hover:border-line hover:bg-canvas"
                    >
                      <span className="truncate">{order.targetUrl}</span>
                      {copiedId === order.id ? (
                        <Check className="h-3 w-3 shrink-0 text-signal" />
                      ) : (
                        <Copy className="h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                      )}
                    </button>
                  </td>
                  <td className="py-3 pr-4 font-data font-medium">₵{order.total.toFixed(2)}</td>
                  <td className="py-3 pr-4">
                    <div className="relative inline-block">
                      <select
                        value={order.paymentStatus}
                        disabled={updatingId === order.id}
                        onChange={(e) => updatePaymentStatus(order.id, e.target.value as PaymentStatus)}
                        className={clsx(
                          "appearance-none rounded-full py-1 pl-7 pr-7 text-xs font-semibold capitalize outline-none",
                          PAYMENT_STYLE[order.paymentStatus]
                        )}
                      >
                        <option value="unpaid">Unpaid</option>
                        <option value="paid">Paid</option>
                        <option value="failed">Failed</option>
                      </select>
                      <CreditCard className="pointer-events-none absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2" />
                      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2" />
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    {editingDelivered === order.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={0}
                          max={order.quantity}
                          value={deliveredValue}
                          onChange={(e) => setDeliveredValue(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && updateDelivered(order.id)}
                          className="w-20 rounded border border-line bg-canvas px-2 py-1 font-data text-xs"
                          autoFocus
                        />
                        <button
                          onClick={() => updateDelivered(order.id)}
                          className="rounded p-1 text-signal hover:bg-signal-soft"
                          title="Save"
                        >
                          <Save className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingDelivered(order.id);
                          setDeliveredValue(String(order.deliveredCount));
                        }}
                        className="font-data text-xs hover:underline"
                        title="Click to edit"
                      >
                        {order.deliveredCount.toLocaleString()} / {order.quantity.toLocaleString()}
                      </button>
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    <div className="relative inline-block">
                      <select
                        value={order.status}
                        disabled={updatingId === order.id}
                        onChange={(e) => updateStatus(order.id, e.target.value as OrderStatus)}
                        className={clsx(
                          "appearance-none rounded-full py-1 pl-3 pr-7 text-xs font-semibold capitalize outline-none",
                          STATUS_STYLE[order.status]
                        )}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s.replace("_", " ")}</option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
