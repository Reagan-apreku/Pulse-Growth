import Link from "next/link";
import { ClipboardList, Clock, Wallet, Activity } from "lucide-react";
import { getStats } from "@/lib/store";
import { OrdersTable } from "./OrdersTable";
import { AnalyticsCharts } from "./AnalyticsCharts";

export default async function AdminOverviewPage() {
  const stats = await getStats();

  const cards = [
    { label: "Total orders", value: stats.totalOrders.toLocaleString(), icon: ClipboardList, delta: "+14%" },
    { label: "Pending orders", value: stats.pendingOrders.toLocaleString(), icon: Clock, delta: "+5%" },
    { label: "Revenue tracked", value: `₵${stats.monthlyRevenue.toFixed(2)}`, icon: Wallet, delta: "+22%" },
    { label: "Active services", value: stats.activeServices.toString(), icon: Activity, delta: "live" },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Overview</h1>
      <p className="mt-1 text-sm text-ink-soft">A live snapshot of orders across every platform.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="bento p-5">
            <div className="flex items-center justify-between">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft text-accent">
                <card.icon className="h-4 w-4" />
              </span>
              <span className="text-xs font-medium text-signal">{card.delta}</span>
            </div>
            <p className="mt-3 font-data text-2xl font-semibold">{card.value}</p>
            <p className="text-sm text-ink-soft">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Analytics charts */}
      <div className="mt-6">
        <AnalyticsCharts />
      </div>

      <div className="mt-6">
        <OrdersTable limit={6} showControls={false} />
        <div className="mt-3 text-right">
          <Link href="/admin/orders" className="text-sm font-medium text-accent hover:underline">
            View all orders →
          </Link>
        </div>
      </div>
    </div>
  );
}
