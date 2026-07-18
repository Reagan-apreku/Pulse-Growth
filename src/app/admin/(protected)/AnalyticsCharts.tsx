"use client";

import { useEffect, useState, useMemo } from "react";
import { TrendingUp, BarChart3 } from "lucide-react";
import { Order } from "@/lib/types";

/** Group orders by date key (e.g. "Jul 15") for the last N days. */
function groupByDay(orders: Order[], days: number) {
  const now = new Date();
  const buckets: { label: string; revenue: number; count: number }[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    buckets.push({ label: key, revenue: 0, count: 0 });
  }

  for (const order of orders) {
    if (order.paymentStatus !== "paid") continue;
    const d = new Date(order.createdAt);
    const key = d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    const bucket = buckets.find((b) => b.label === key);
    if (bucket) {
      bucket.revenue += order.total;
      bucket.count += 1;
    }
  }

  return buckets;
}

/** Group orders by platform. */
function groupByPlatform(orders: Order[]) {
  const map = new Map<string, { count: number; revenue: number }>();
  for (const o of orders) {
    if (o.paymentStatus !== "paid") continue;
    const entry = map.get(o.platform) || { count: 0, revenue: 0 };
    entry.count += 1;
    entry.revenue += o.total;
    map.set(o.platform, entry);
  }
  return Array.from(map.entries())
    .map(([platform, data]) => ({ platform, ...data }))
    .sort((a, b) => b.revenue - a.revenue);
}

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#ef4444"];

/** Simple SVG bar chart. */
function BarChartSVG({ data, valueKey }: { data: { label: string; [key: string]: unknown }[]; valueKey: string }) {
  const values = data.map((d) => Number(d[valueKey]) || 0);
  const max = Math.max(...values, 1);
  const barW = Math.max(8, Math.min(28, 400 / data.length - 4));
  const chartH = 140;
  const totalW = data.length * (barW + 4);

  return (
    <div className="overflow-x-auto">
      <svg width={Math.max(totalW, 300)} height={chartH + 30} className="w-full" viewBox={`0 0 ${Math.max(totalW, 300)} ${chartH + 30}`} preserveAspectRatio="xMinYEnd meet">
        {data.map((d, i) => {
          const v = Number(d[valueKey]) || 0;
          const h = (v / max) * chartH;
          const x = i * (barW + 4) + 4;
          return (
            <g key={i}>
              <rect
                x={x}
                y={chartH - h}
                width={barW}
                height={Math.max(h, 1)}
                rx={4}
                fill="var(--accent)"
                opacity={0.8}
                className="transition-all duration-300 hover:opacity-100"
              />
              {i % Math.ceil(data.length / 7) === 0 && (
                <text
                  x={x + barW / 2}
                  y={chartH + 18}
                  textAnchor="middle"
                  className="fill-[var(--ink-faint)]"
                  fontSize={9}
                >
                  {d.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/** Horizontal bar chart for platform breakdown. */
function PlatformBars({ data }: { data: { platform: string; count: number; revenue: number }[] }) {
  const max = Math.max(...data.map((d) => d.revenue), 1);

  return (
    <div className="space-y-3">
      {data.map((d, i) => (
        <div key={d.platform}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="font-medium">{d.platform}</span>
            <span className="font-data text-xs text-ink-soft">₵{d.revenue.toFixed(2)} · {d.count} orders</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-canvas">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(d.revenue / max) * 100}%`,
                backgroundColor: COLORS[i % COLORS.length],
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function AnalyticsCharts() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
      setLoading(false);
    })();
  }, []);

  const dailyData = useMemo(() => groupByDay(orders, 14), [orders]);
  const platformData = useMemo(() => groupByPlatform(orders), [orders]);
  const paidOrders = useMemo(() => orders.filter((o) => o.paymentStatus === "paid"), [orders]);
  const totalRevenue = useMemo(() => paidOrders.reduce((s, o) => s + o.total, 0), [paidOrders]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="bento h-64 animate-pulse bg-canvas-raised p-6" />
        <div className="bento h-64 animate-pulse bg-canvas-raised p-6" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Revenue chart */}
      <div className="bento p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-accent" />
            <p className="font-medium">Revenue (14 days)</p>
          </div>
          <span className="font-data text-sm font-semibold text-accent">₵{totalRevenue.toFixed(2)}</span>
        </div>
        <BarChartSVG data={dailyData} valueKey="revenue" />
      </div>

      {/* Platform breakdown */}
      <div className="bento p-6">
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-accent" />
          <p className="font-medium">Revenue by platform</p>
        </div>
        {platformData.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink-soft">No paid orders yet.</p>
        ) : (
          <PlatformBars data={platformData} />
        )}
      </div>
    </div>
  );
}
