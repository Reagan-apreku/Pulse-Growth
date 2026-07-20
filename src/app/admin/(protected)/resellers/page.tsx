"use client";

import { useEffect, useState } from "react";
import { Users, Power, AlertCircle, Check, DollarSign, ShoppingBag } from "lucide-react";
import { clsx } from "clsx";
import { ResellerAccount } from "@/lib/types";

export default function AdminResellersPage() {
  const [resellers, setResellers] = useState<ResellerAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function loadResellers() {
    setLoading(true);
    try {
      const res = await fetch("/api/resellers");
      if (res.ok) {
        const data = await res.json();
        setResellers(data.resellers || []);
      }
    } catch {
      setError("Failed to load resellers.");
    }
    setLoading(false);
  }

  useEffect(() => {
    loadResellers();
  }, []);

  async function handleToggle(id: string, currentStatus: "active" | "inactive") {
    setError(null);
    setSuccess(null);
    const nextStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      const res = await fetch("/api/resellers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: nextStatus }),
      });
      if (res.ok) {
        setResellers((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: nextStatus } : r))
        );
        setSuccess(`Reseller status updated to ${nextStatus}.`);
      }
    } catch {
      setError("Failed to update reseller status.");
    }
  }

  const activeCount = resellers.filter((r) => r.status === "active").length;
  const totalResellerSpent = resellers.reduce((sum, r) => sum + r.totalSpent, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Reseller Management</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Monitor partners using the 10% wholesale reseller program.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-danger-soft p-4 text-sm text-danger">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-xl bg-signal-soft p-4 text-sm text-signal">
          <Check className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="bento p-5">
          <div className="flex items-center justify-between">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft text-accent">
              <Users className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 font-data text-2xl font-semibold">{resellers.length}</p>
          <p className="text-sm text-ink-soft">Total Resellers ({activeCount} Active)</p>
        </div>

        <div className="bento p-5">
          <div className="flex items-center justify-between">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-signal-soft text-signal">
              <DollarSign className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 font-data text-2xl font-semibold">₵{totalResellerSpent.toFixed(2)}</p>
          <p className="text-sm text-ink-soft">Total Reseller Volume</p>
        </div>

        <div className="bento p-5">
          <div className="flex items-center justify-between">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-warn-soft text-warn">
              <ShoppingBag className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 font-data text-2xl font-semibold">
            {resellers.reduce((s, r) => s + r.totalOrders, 0)}
          </p>
          <p className="text-sm text-ink-soft">Reseller Client Orders</p>
        </div>
      </div>

      {/* Resellers Table */}
      <div className="bento p-6">
        <h2 className="mb-4 font-medium">All Reseller Accounts</h2>
        {loading ? (
          <p className="py-8 text-center text-sm text-ink-soft">Loading resellers…</p>
        ) : resellers.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink-soft">No resellers registered yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-faint">
                  <th className="py-2.5 pr-4 font-medium">Reseller Name</th>
                  <th className="py-2.5 pr-4 font-medium">Business</th>
                  <th className="py-2.5 pr-4 font-medium">Email / Phone</th>
                  <th className="py-2.5 pr-4 font-medium">Discount Rate</th>
                  <th className="py-2.5 pr-4 font-medium">Orders / Total</th>
                  <th className="py-2.5 pr-4 font-medium">Status</th>
                  <th className="py-2.5 pr-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {resellers.map((r) => (
                  <tr key={r.id} className="border-b border-line/70 last:border-0">
                    <td className="py-3 pr-4 font-medium">{r.name}</td>
                    <td className="py-3 pr-4 text-ink-soft">{r.businessName || "Personal"}</td>
                    <td className="py-3 pr-4 text-xs font-data">
                      <div>{r.email}</div>
                      {r.phone && <div className="text-ink-faint">{r.phone}</div>}
                    </td>
                    <td className="py-3 pr-4 font-data font-semibold text-accent">
                      {r.discountPercentage}% OFF
                    </td>
                    <td className="py-3 pr-4 font-data text-xs">
                      {r.totalOrders} orders · ₵{r.totalSpent.toFixed(2)}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={clsx(
                          "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
                          r.status === "active" ? "bg-signal-soft text-signal" : "bg-warn-soft text-warn"
                        )}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <button
                        onClick={() => handleToggle(r.id, r.status)}
                        className={clsx(
                          "inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
                          r.status === "active"
                            ? "bg-canvas text-ink-soft hover:bg-warn-soft hover:text-warn"
                            : "bg-signal-soft text-signal hover:opacity-80"
                        )}
                      >
                        <Power className="h-3.5 w-3.5" />
                        {r.status === "active" ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
