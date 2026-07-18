"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, ShieldCheck, Zap, Loader2, CreditCard } from "lucide-react";
import { clsx } from "clsx";
import { SERVICES } from "@/lib/services";
import { PlatformIcon } from "@/components/PlatformIcon";

export function OrderForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPlatform = searchParams.get("platform") || SERVICES[0].platform;

  const [platform, setPlatform] = useState(initialPlatform);
  const service = useMemo(() => SERVICES.find((s) => s.platform === platform) || SERVICES[0], [platform]);

  const [serviceTypeIndex, setServiceTypeIndex] = useState(0);
  const serviceType = service.serviceTypes[serviceTypeIndex] || service.serviceTypes[0];

  const [quantity, setQuantity] = useState(1000);
  const [targetUrl, setTargetUrl] = useState("");
  const [email, setEmail] = useState("");
  const [whatsappOptIn, setWhatsappOptIn] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const minOrder = serviceType.minOrder || 100;

  useEffect(() => {
    if (quantity < minOrder) {
      setQuantity(minOrder);
    }
  }, [minOrder, quantity]);

  const total = (quantity / 1000) * serviceType.ratePer1k;

  function handlePlatformChange(newPlatform: string) {
    setPlatform(newPlatform);
    setServiceTypeIndex(0);
  }

  function getPlaceholder() {
    const p = service.platform.toLowerCase().replace(/[^a-z]/g, "");
    const lbl = serviceType.label.toLowerCase();

    // Post / Video / Track links
    if (
      lbl.includes("post like") ||
      lbl.includes("video") ||
      lbl.includes("story") ||
      (lbl.includes("play") && !lbl.includes("playlist")) ||
      lbl.includes("retweet") ||
      lbl.includes("share") ||
      lbl.includes("save") ||
      lbl.includes("reaction") ||
      (lbl.includes("like") && !lbl.includes("page like"))
    ) {
      if (p === "youtube") return "https://youtube.com/watch?v=...";
      if (p === "tiktok") return "https://tiktok.com/@user/video/123...";
      if (p === "instagram") return "https://instagram.com/p/abc123...";
      if (p === "spotify") return "https://open.spotify.com/track/123...";
      if (p === "telegram") return "https://t.me/channel/123";
      return `https://${p}.com/username/status/123...`;
    }

    // Playlists
    if (lbl.includes("playlist")) return "https://open.spotify.com/playlist/123...";

    // Channels / Groups
    if (lbl.includes("subscriber") || lbl.includes("member")) {
      if (p === "youtube") return "https://youtube.com/channel/UC...";
      if (p === "telegram") return "https://t.me/yourchannel";
      return `https://${p}.com/c/yourchannel`;
    }

    // Profiles / Pages
    if (p === "spotify") return "https://open.spotify.com/artist/123...";
    if (p === "telegram") return "https://t.me/yourusername";
    if (p === "youtube") return "https://youtube.com/@yourchannel";
    return `https://${p}.com/yourprofile`;
  }

  async function handleSubmit() {
    setError(null);
    if (!targetUrl.trim()) {
      setError("Add your profile link or username first.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: service.platform,
          serviceName: `${service.platform} ${serviceType.label}`,
          quantity,
          targetUrl,
          ratePer1k: serviceType.ratePer1k,
          total: Number(total.toFixed(2)),
          paymentMethod: "paystack",
          customerEmail: email || undefined,
          whatsappOptIn,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");

      // If Paystack URL is returned, redirect to payment
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
        return;
      }

      // No Paystack configured (local dev) — go to tracking
      router.push(`/track?id=${data.order.id}&paid=1`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="flex flex-col gap-4 lg:col-span-2">
        {/* Step 1 — platform */}
        <div className="bento p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-semibold text-white">1</span>
            <p className="font-medium">Select platform</p>
          </div>
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-6">
            {SERVICES.map((s) => (
              <button
                key={s.platform}
                onClick={() => handlePlatformChange(s.platform)}
                className={clsx(
                  "flex flex-col items-center gap-2 rounded-xl border p-3 text-xs font-medium transition-colors",
                  platform === s.platform
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-line text-ink-soft hover:border-line-strong"
                )}
              >
                <PlatformIcon platform={s.platform} className="h-5 w-5" />
                {s.platform.replace(" (Twitter)", "")}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2 — service details */}
        <div className="bento p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-semibold text-white">2</span>
            <p className="font-medium">Service details</p>
          </div>

          <label className="text-xs font-medium text-ink-faint">Service type</label>
          <select
            value={serviceTypeIndex}
            onChange={(e) => setServiceTypeIndex(Number(e.target.value))}
            className="mt-1.5 w-full rounded-xl border border-line bg-canvas-raised px-4 py-2.5 text-sm"
          >
            {service.serviceTypes.map((st, i) => (
              <option key={st.label} value={i}>
                {st.label} — ₵{st.ratePer1k.toFixed(2)}/1k
              </option>
            ))}
          </select>

          <label className="mt-4 block text-xs font-medium text-ink-faint">Target URL / Username</label>
          <input
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            placeholder={getPlaceholder()}
            className="mt-1.5 w-full rounded-xl border border-line bg-canvas-raised px-4 py-2.5 text-sm placeholder:text-ink-faint"
          />

          <div className="mt-5 flex items-center justify-between">
            <label className="text-xs font-medium text-ink-faint">Quantity</label>
            <span className="font-data text-sm font-semibold">{quantity.toLocaleString()}</span>
          </div>
          <input
            type="range"
            min={minOrder}
            max={10000}
            step={100}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="mt-2 w-full accent-[var(--accent)]"
          />
          <div className="flex justify-between text-xs text-ink-faint">
            <span>{minOrder.toLocaleString()} min</span>
            <span>10,000 max</span>
          </div>

          <label className="mt-4 block text-xs font-medium text-ink-faint">Email for payment receipt & updates</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="mt-1.5 w-full rounded-xl border border-line bg-canvas-raised px-4 py-2.5 text-sm placeholder:text-ink-faint"
          />

          <label className="mt-4 flex items-center gap-2 text-sm text-ink-soft">
            <input
              type="checkbox"
              checked={whatsappOptIn}
              onChange={(e) => setWhatsappOptIn(e.target.checked)}
              className="h-4 w-4 rounded border-line accent-[var(--accent)]"
            />
            Send me WhatsApp updates when my order status changes
          </label>
        </div>
      </div>

      {/* Order summary */}
      <div className="lg:col-span-1">
        <div className="bento sticky top-24 flex flex-col p-6">
          <p className="font-medium">Order summary</p>
          <div className="mt-4 space-y-2.5 text-sm">
            <div className="flex justify-between">
              <span className="text-ink-soft">Service</span>
              <span className="text-right font-medium">{service.platform} {serviceType.label}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-soft">Quantity</span>
              <span className="font-data font-medium">{quantity.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-soft">Rate per 1k</span>
              <span className="font-data font-medium">₵{serviceType.ratePer1k.toFixed(2)}</span>
            </div>
          </div>
          <div className="my-5 border-t border-dashed border-line" />
          <div className="flex items-end justify-between">
            <span className="font-medium">Total</span>
            <span className="font-data text-2xl font-semibold">₵{total.toFixed(2)}</span>
          </div>
          <p className="text-xs text-ink-faint">Includes all applicable fees</p>

          {/* Payment method info */}
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-line bg-canvas p-3">
            <CreditCard className="h-4 w-4 text-accent" />
            <div>
              <p className="text-sm font-medium">Pay with Paystack</p>
              <p className="text-xs text-ink-faint">MoMo, Card, Bank Transfer</p>
            </div>
          </div>

          {error && <p className="mt-4 rounded-lg bg-danger-soft px-3 py-2 text-xs text-danger">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="hero-cta mt-6 flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition-all hover:scale-[1.02] hover:shadow-lg disabled:opacity-60 disabled:hover:scale-100"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
            {submitting ? "Redirecting to payment…" : "Pay & place order"}
          </button>
          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-ink-faint">
            <span className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" /> Secure payment</span>
            <span className="flex items-center gap-1"><Zap className="h-3.5 w-3.5" /> Instant start</span>
          </div>
        </div>
        
        {/* Bulk & Custom notice */}
        <div className="mt-4 rounded-xl border border-dashed border-line bg-canvas-raised p-4 text-center text-sm text-ink-soft">
          <p>
            Need a <strong className="text-ink">different service</strong> or looking for <strong className="text-ink">bulk pricing</strong>?
            <br />
            <a 
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "233551707942"}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-1 inline-block font-medium text-accent hover:underline"
            >
              Contact support on WhatsApp
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
