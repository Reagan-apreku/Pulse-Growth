"use client";

import { useEffect, useState } from "react";
import { Tag, Plus, Check, X, Trash2, Power, AlertCircle } from "lucide-react";
import { clsx } from "clsx";
import { Coupon, DiscountType } from "@/lib/types";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<DiscountType>("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [creating, setCreating] = useState(false);

  async function loadCoupons() {
    setLoading(true);
    try {
      const res = await fetch("/api/coupons");
      if (res.ok) {
        const data = await res.json();
        setCoupons(data.coupons || []);
      }
    } catch {
      setError("Failed to load coupons.");
    }
    setLoading(false);
  }

  useEffect(() => {
    loadCoupons();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!code.trim()) {
      setError("Coupon code is required.");
      return;
    }
    const val = parseFloat(discountValue);
    if (isNaN(val) || val <= 0) {
      setError("Please enter a valid positive discount value.");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          discountType,
          discountValue: val,
          maxUses: maxUses ? parseInt(maxUses, 10) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create coupon.");

      setSuccess(`Coupon "${data.coupon.code}" created and activated live!`);
      setCode("");
      setDiscountValue("");
      setMaxUses("");
      loadCoupons();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error creating coupon.");
    }
    setCreating(false);
  }

  async function handleToggle(couponCode: string, currentStatus: boolean) {
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/coupons", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, active: !currentStatus }),
      });
      if (res.ok) {
        setCoupons((prev) =>
          prev.map((c) => (c.code === couponCode ? { ...c, active: !currentStatus } : c))
        );
        setSuccess(`Coupon "${couponCode}" status updated to ${!currentStatus ? "Active" : "Inactive"}.`);
      }
    } catch {
      setError("Failed to update coupon status.");
    }
  }

  async function handleDelete(couponCode: string) {
    if (!confirm(`Are you sure you want to delete coupon ${couponCode}?`)) return;
    setError(null);
    try {
      const res = await fetch(`/api/coupons?code=${encodeURIComponent(couponCode)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setCoupons((prev) => prev.filter((c) => c.code !== couponCode));
        setSuccess(`Coupon "${couponCode}" deleted.`);
      }
    } catch {
      setError("Failed to delete coupon.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Coupon Management</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Create, activate, and deactivate discount codes live across your storefront.
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

      {/* Create Coupon Form */}
      <div className="bento p-6">
        <div className="mb-4 flex items-center gap-2">
          <Tag className="h-4 w-4 text-accent" />
          <h2 className="font-medium">Create New Coupon</h2>
        </div>

        <form onSubmit={handleCreate} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="text-xs font-medium text-ink-faint">Coupon Code</label>
            <input
              type="text"
              placeholder="e.g. WELCOME10"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-line bg-canvas px-3.5 py-2 text-sm uppercase placeholder:normal-case font-data font-semibold"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-ink-faint">Discount Type</label>
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as DiscountType)}
              className="mt-1.5 w-full rounded-xl border border-line bg-canvas px-3.5 py-2 text-sm font-medium"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount (₵)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-ink-faint">
              Discount Value {discountType === "percentage" ? "(%)" : "(₵)"}
            </label>
            <input
              type="number"
              step="any"
              min="0.1"
              placeholder={discountType === "percentage" ? "10" : "5.00"}
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-line bg-canvas px-3.5 py-2 text-sm font-data"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-ink-faint">Max Total Uses (Optional)</label>
            <input
              type="number"
              min="1"
              placeholder="Unlimited if empty"
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-line bg-canvas px-3.5 py-2 text-sm font-data"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={creating}
              className="hero-cta flex w-full items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              {creating ? "Creating…" : "Create Coupon"}
            </button>
          </div>
        </form>
      </div>

      {/* Coupons Table */}
      <div className="bento p-6">
        <h2 className="mb-4 font-medium">All Coupons</h2>
        {loading ? (
          <p className="py-8 text-center text-sm text-ink-soft">Loading coupons…</p>
        ) : coupons.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink-soft">No coupons created yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-faint">
                  <th className="py-2.5 pr-4 font-medium">Code</th>
                  <th className="py-2.5 pr-4 font-medium">Discount</th>
                  <th className="py-2.5 pr-4 font-medium">Usage</th>
                  <th className="py-2.5 pr-4 font-medium">Status</th>
                  <th className="py-2.5 pr-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => (
                  <tr key={c.id} className="border-b border-line/70 last:border-0">
                    <td className="py-3 pr-4 font-data font-bold tracking-wide text-ink">
                      {c.code}
                    </td>
                    <td className="py-3 pr-4 font-data font-medium">
                      {c.discountType === "percentage" ? `${c.discountValue}% OFF` : `₵${c.discountValue.toFixed(2)} OFF`}
                    </td>
                    <td className="py-3 pr-4 text-xs text-ink-soft font-data">
                      {c.usedCount} used {c.maxUses !== null ? `/ ${c.maxUses} max` : "(Unlimited)"}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={clsx(
                          "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
                          c.active ? "bg-signal-soft text-signal" : "bg-warn-soft text-warn"
                        )}
                      >
                        {c.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggle(c.code, c.active)}
                          className={clsx(
                            "flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
                            c.active
                              ? "bg-canvas text-ink-soft hover:bg-warn-soft hover:text-warn"
                              : "bg-signal-soft text-signal hover:opacity-80"
                          )}
                          title={c.active ? "Deactivate" : "Activate"}
                        >
                          <Power className="h-3.5 w-3.5" />
                          {c.active ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => handleDelete(c.code)}
                          className="rounded-lg p-1 text-ink-faint transition-colors hover:bg-danger-soft hover:text-danger"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
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
