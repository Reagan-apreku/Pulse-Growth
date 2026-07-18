import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getOrder } from "@/lib/store";
import { ReceiptView } from "./ReceiptView";

export const metadata: Metadata = {
  title: "Order Receipt — Pulse",
  description: "Your order receipt from Pulse. Print or save for your records.",
};

export default async function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrder(id);

  if (!order) {
    notFound();
  }

  return <ReceiptView order={order} />;
}
