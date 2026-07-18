"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed.");
      router.push("/admin");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-5">
      <form onSubmit={handleSubmit} className="bento w-full max-w-sm p-8">
        <div className="flex items-center gap-2 font-display text-lg font-semibold">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-canvas">
            <Zap className="h-4 w-4" strokeWidth={2.5} />
          </span>
          Pulse Admin
        </div>
        <p className="mt-2 text-sm text-ink-soft">Sign in to manage orders and services.</p>

        <label className="mt-6 block text-xs font-medium text-ink-faint">Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
          className="mt-1.5 w-full rounded-xl border border-line bg-canvas-raised px-4 py-2.5 text-sm"
        />

        <label className="mt-4 block text-xs font-medium text-ink-faint">Password</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          required
          className="mt-1.5 w-full rounded-xl border border-line bg-canvas-raised px-4 py-2.5 text-sm"
        />

        {error && <p className="mt-4 rounded-lg bg-danger-soft px-3 py-2 text-xs text-danger">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-canvas hover:opacity-90 disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Signing in…" : "Sign in"}
        </button>

        <p className="mt-5 text-center text-xs text-ink-faint">
          Demo credentials: admin@pulse.dev / pulse-admin
        </p>
      </form>
    </div>
  );
}
