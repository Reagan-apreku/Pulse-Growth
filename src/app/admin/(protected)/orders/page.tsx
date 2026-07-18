import { OrdersTable } from "../OrdersTable";

export default function AdminOrdersPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Orders</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Update a status here and the change reflects instantly on the customer&apos;s tracking page.
      </p>
      <div className="mt-6">
        <OrdersTable />
      </div>
    </div>
  );
}
