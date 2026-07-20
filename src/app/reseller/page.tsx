"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  Percent,
  CheckCircle,
  Zap,
  Lock,
  Loader2,
  ShieldCheck,
  CreditCard,
  LogOut,
  ArrowRight,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { clsx } from "clsx";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { SERVICES } from "@/lib/services";
import { PlatformIcon } from "@/components/PlatformIcon";
import { ResellerAccount } from "@/lib/types";

export default function ResellerPortalPage() {
  const router = useRouter();

  // Reseller session
  const [reseller, setReseller] = useState<ResellerAccount | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  // Auth form states
  const [authMode, setAuthMode] = useState<"login" | "register">("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // Order form states for logged in reseller
  const [platform, setPlatform] = useState(SERVICES[0].platform);
  const service = useMemo(() => SERVICES.find((s) => s.platform === platform) || SERVICES[0], [platform]);
  const [serviceTypeIndex, setServiceTypeIndex] = useState(0);
  const serviceType = service.serviceTypes[serviceTypeIndex] || service.serviceTypes[0];

  const [quantity, setQuantity] = useState(1000);
  const [targetUrl, setTargetUrl] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [whatsappOptIn, setWhatsappOptIn] = useState(true);

  // Client markup calculator state
  const [resalePrice, setResalePrice] = useState("");

  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  const minOrder = serviceType.minOrder || 100;

  useEffect(() => {
    // Check saved reseller session
    const saved = localStorage.getItem("pulse_reseller_session");
    if (saved) {
      try {
        setReseller(JSON.parse(saved));
      } catch {}
    }
    setSessionLoading(false);
  }, []);

  const standardRate = serviceType.ratePer1k;
  // 10% wholesale discount
  const resellerRate = standardRate * 0.9;

  const standardSubtotal = (quantity / 1000) * standardRate;
  const resellerSubtotal = (quantity / 1000) * resellerRate;
  const wholesaleSavings = standardSubtotal - resellerSubtotal;

  const userResalePrice = parseFloat(resalePrice) || standardSubtotal * 1.25; // default 25% markup
  const estimatedProfit = Math.max(0, userResalePrice - resellerSubtotal);

  const [password, setPassword] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setAuthError(null);
    setRegisterSuccess(null);
    if (!name.trim() || !email.trim() || !password.trim() || !phone.trim()) {
      setAuthError("Name, email, password, and WhatsApp phone number are required.");
      return;
    }
    if (password.length < 6) {
      setAuthError("Password must be at least 6 characters.");
      return;
    }
    setAuthSubmitting(true);
    try {
      const res = await fetch("/api/reseller/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password: password.trim(),
          phone: phone.trim(),
          businessName: businessName.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed.");

      if (data.reseller.status === "pending") {
        setRegisterSuccess("Your registration has been submitted! Your account is currently pending admin approval. You can log in once an admin approves your request.");
      } else {
        setReseller(data.reseller);
        localStorage.setItem("pulse_reseller_session", JSON.stringify(data.reseller));
      }
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Error during registration.");
    }
    setAuthSubmitting(false);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthError(null);
    if (!email.trim() || !password.trim()) {
      setAuthError("Enter your registered email and password.");
      return;
    }
    setAuthSubmitting(true);
    try {
      const res = await fetch("/api/reseller/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed.");

      setReseller(data.reseller);
      localStorage.setItem("pulse_reseller_session", JSON.stringify(data.reseller));
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Login failed.");
    }
    setAuthSubmitting(false);
  }


  function handleLogout() {
    setReseller(null);
    localStorage.removeItem("pulse_reseller_session");
  }

  async function handlePlaceWholesaleOrder() {
    setOrderError(null);
    if (!targetUrl.trim()) {
      setOrderError("Enter the client's profile link or username first.");
      return;
    }
    setOrderSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: service.platform,
          serviceName: `${service.platform} ${serviceType.label}`,
          quantity,
          targetUrl,
          ratePer1k: Number(resellerRate.toFixed(2)),
          total: Number(resellerSubtotal.toFixed(2)),
          paymentMethod: "paystack",
          customerEmail: clientEmail.trim() || reseller?.email,
          whatsappOptIn,
          isResellerOrder: true,
          resellerEmail: reseller?.email,
          discountAmount: wholesaleSavings,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to place order.");

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
        return;
      }
      router.push(`/track?id=${data.order.id}&paid=1`);
    } catch (err) {
      setOrderError(err instanceof Error ? err.message : "Error placing order.");
      setOrderSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-canvas text-ink">
      <NavBar />

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8 sm:px-8 sm:py-12">

        {sessionLoading ? (
          <div className="py-16 text-center text-sm text-ink-soft">Loading reseller portal…</div>
        ) : !reseller ? (

          /* Reseller Registration / Login View */
          <div>
            {/* Banner (Only shown before login) */}
            <div className="hero-gradient relative overflow-hidden rounded-3xl p-8 sm:p-12 mb-8">
              <div className="hero-blob hero-blob-1" />
              <div className="hero-blob hero-blob-2" />
              <div className="relative z-10 max-w-2xl">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-signal-soft px-3.5 py-1 text-xs font-semibold text-signal">
                  <Percent className="h-3.5 w-3.5" /> 10% Wholesale Discount Guaranteed
                </span>
                <h1 className="mt-4 font-display text-3xl font-semibold leading-tight sm:text-5xl">
                  Become a Pulse <span className="hero-text-gradient">Reseller</span>
                </h1>
                <p className="mt-3 text-ink-soft text-base">
                  Offer top-tier social media growth to your clients, agencies, and followers. Get instant 10% wholesale pricing on every order and keep 100% of your profit margin.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">

            {/* Value Propositions */}
            <div className="space-y-4 lg:col-span-6">
              <h2 className="font-display text-2xl font-semibold">Why Resell With Pulse?</h2>

              <div className="bento p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
                    <Percent className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Automatic 10% Wholesale Discount</h3>
                    <p className="mt-1 text-xs text-ink-soft">
                      Every order placed through your Reseller Portal gets an instant 10% discount off standard rates.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bento p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-signal-soft text-signal">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Set Your Own Client Prices</h3>
                    <p className="mt-1 text-xs text-ink-soft">
                      Charge your clients standard market prices or higher while paying low wholesale rates.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bento p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-warn-soft text-warn">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">White-Label Delivery & Tracking</h3>
                    <p className="mt-1 text-xs text-ink-soft">
                      Your clients receive live status updates. We never display our branding to your customers.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Auth Form Card */}
            <div className="lg:col-span-6">
              <div className="bento p-6 sm:p-8">
                {/* Tabs */}
                <div className="flex rounded-xl border border-line bg-canvas p-1">
                  <button
                    onClick={() => setAuthMode("register")}
                    className={clsx(
                      "flex-1 rounded-lg py-2 text-xs font-semibold transition-all",
                      authMode === "register" ? "bg-ink text-canvas shadow-sm" : "text-ink-soft hover:text-ink"
                    )}
                  >
                    Join as Reseller
                  </button>
                  <button
                    onClick={() => setAuthMode("login")}
                    className={clsx(
                      "flex-1 rounded-lg py-2 text-xs font-semibold transition-all",
                      authMode === "login" ? "bg-ink text-canvas shadow-sm" : "text-ink-soft hover:text-ink"
                    )}
                  >
                    Reseller Login
                  </button>
                </div>

                {authError && (
                  <div className="mt-4 rounded-xl bg-danger-soft p-3 text-xs text-danger">{authError}</div>
                )}

                {registerSuccess && (
                  <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-warn-soft p-4 text-xs text-warn font-medium leading-relaxed">
                    <CheckCircle className="h-4 w-4 shrink-0 text-warn mt-0.5" />
                    <span>{registerSuccess}</span>
                  </div>
                )}


                {authMode === "register" ? (
                  <form onSubmit={handleRegister} className="mt-6 space-y-4">
                    <div>
                      <label className="text-xs font-medium text-ink-faint">Full Name *</label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-line bg-canvas px-4 py-2.5 text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-ink-faint">Email Address *</label>
                      <input
                        type="email"
                        placeholder="reseller@agency.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-line bg-canvas px-4 py-2.5 text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-ink-faint">Password *</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-line bg-canvas px-4 py-2.5 text-sm"
                        required
                        minLength={6}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-ink-faint">Agency / Business Name (Optional)</label>
                      <input
                        type="text"
                        placeholder="Apex Media Agency"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-line bg-canvas px-4 py-2.5 text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-ink-faint">WhatsApp Phone Number *</label>
                      <input
                        type="text"
                        placeholder="233550000000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-line bg-canvas px-4 py-2.5 text-sm"
                        required
                      />
                    </div>


                    <button
                      type="submit"
                      disabled={authSubmitting}
                      className="hero-cta mt-4 flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                    >
                      {authSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                      {authSubmitting ? "Creating account…" : "Submit Application for Approval"}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleLogin} className="mt-6 space-y-4">
                    <div>
                      <label className="text-xs font-medium text-ink-faint">Reseller Registered Email *</label>
                      <input
                        type="email"
                        placeholder="reseller@agency.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-line bg-canvas px-4 py-2.5 text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-ink-faint">Password *</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-line bg-canvas px-4 py-2.5 text-sm"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={authSubmitting}
                      className="hero-cta mt-4 flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                    >
                      {authSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                      {authSubmitting ? "Logging in…" : "Access Reseller Portal"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (


          /* Active Reseller Dashboard & Order Interface */
          <div className="mt-8 space-y-6">
            {/* Top Reseller Status Header */}
            <div className="bento flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-signal-soft px-3 py-1 text-xs font-semibold text-signal">
                    <CheckCircle className="h-3.5 w-3.5" /> 10% Wholesale Tier Active
                  </span>
                  {reseller.businessName && (
                    <span className="text-xs font-medium text-ink-faint">({reseller.businessName})</span>
                  )}
                </div>
                <h2 className="mt-2 font-display text-xl font-semibold">Welcome, {reseller.name}</h2>
                <p className="text-xs text-ink-soft">{reseller.email}</p>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 rounded-xl border border-line bg-canvas px-3.5 py-2 text-xs font-medium text-ink-soft transition-colors hover:bg-canvas-raised hover:text-ink"
                >
                  <LogOut className="h-3.5 w-3.5" /> Logout
                </button>
              </div>
            </div>

            {/* Wholesale Order Placement Form */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="space-y-4 lg:col-span-2">
                {/* Platform selection */}
                <div className="bento p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-semibold text-white">
                      1
                    </span>
                    <p className="font-medium">Select Platform</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-6">
                    {SERVICES.map((s) => (
                      <button
                        key={s.platform}
                        onClick={() => {
                          setPlatform(s.platform);
                          setServiceTypeIndex(0);
                        }}
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

                {/* Service details */}
                <div className="bento p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-semibold text-white">
                      2
                    </span>
                    <p className="font-medium">Wholesale Service Details</p>
                  </div>

                  <label className="text-xs font-medium text-ink-faint">Service Type</label>
                  <select
                    value={serviceTypeIndex}
                    onChange={(e) => setServiceTypeIndex(Number(e.target.value))}
                    className="mt-1.5 w-full rounded-xl border border-line bg-canvas-raised px-4 py-2.5 text-sm"
                  >
                    {service.serviceTypes.map((st, i) => (
                      <option key={st.label} value={i}>
                        {st.label} — ₵{(st.ratePer1k * 0.9).toFixed(2)}/1k (Wholesale 10% OFF)
                      </option>
                    ))}
                  </select>

                  <label className="mt-4 block text-xs font-medium text-ink-faint">
                    Client's Target Profile / Post URL
                  </label>
                  <input
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    placeholder="https://..."
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

                  <label className="mt-4 block text-xs font-medium text-ink-faint">
                    Client Email (Optional for tracking updates)
                  </label>
                  <input
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="client@example.com"
                    className="mt-1.5 w-full rounded-xl border border-line bg-canvas-raised px-4 py-2.5 text-sm placeholder:text-ink-faint"
                  />
                </div>
              </div>

              {/* Order Summary & Profit Margin Calculator */}
              <div className="lg:col-span-1">
                <div className="bento sticky top-24 space-y-4 p-6">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">Wholesale Summary</p>
                    <span className="rounded-full bg-signal-soft px-2.5 py-0.5 text-xs font-bold text-signal">
                      10% Wholesale
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-ink-soft">Standard Price</span>
                      <span className="font-data text-ink-faint line-through">₵{standardSubtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-soft">Your Wholesale Rate</span>
                      <span className="font-data font-semibold text-signal">₵{resellerSubtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-signal font-medium">
                      <span>Instant Savings</span>
                      <span>₵{wholesaleSavings.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Reseller Profit Margin Estimator */}
                  <div className="rounded-xl border border-line bg-canvas p-4">
                    <p className="text-xs font-semibold text-ink-soft">Client Price & Profit Calculator</p>
                    <div className="mt-2">
                      <label className="text-[11px] text-ink-faint">Price you charge your client (₵)</label>
                      <input
                        type="number"
                        step="any"
                        placeholder={standardSubtotal.toFixed(2)}
                        value={resalePrice}
                        onChange={(e) => setResalePrice(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-line bg-canvas-raised px-3 py-1.5 font-data text-xs"
                      />
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-line pt-2 text-xs">
                      <span className="text-ink-soft">Your Net Profit:</span>
                      <span className="font-data text-base font-bold text-accent">₵{estimatedProfit.toFixed(2)}</span>
                    </div>
                  </div>

                  {orderError && (
                    <p className="rounded-lg bg-danger-soft px-3 py-2 text-xs text-danger">{orderError}</p>
                  )}

                  <button
                    onClick={handlePlaceWholesaleOrder}
                    disabled={orderSubmitting}
                    className="hero-cta flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold text-white transition-all hover:scale-[1.02] disabled:opacity-60"
                  >
                    {orderSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                    {orderSubmitting ? "Processing…" : `Pay Wholesale ₵${resellerSubtotal.toFixed(2)}`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <WhatsAppButton />
      <Footer />
    </div>
  );
}
