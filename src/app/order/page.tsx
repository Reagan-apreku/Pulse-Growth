import type { Metadata } from "next";
import { Suspense } from "react";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { OrderForm } from "./OrderForm";

export const metadata: Metadata = {
  title: "Order Services — Pulse",
  description: "Select a platform and configure your social media growth campaign. Pay securely with MoMo, Card, or Bank Transfer via Paystack.",
  openGraph: {
    title: "Order Social Growth Services — Pulse",
    description: "Instagram followers, TikTok views, YouTube subscribers and more. Pay with Mobile Money.",
    type: "website",
  },
};

export default function OrderPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:px-8 sm:py-14">
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">Configure your campaign</h1>
        <p className="mt-2 max-w-lg text-ink-soft">
          Select a platform and customize your growth services instantly.
        </p>
        <div className="mt-8">
          <Suspense fallback={null}>
            <OrderForm />
          </Suspense>
        </div>
      </main>
      <WhatsAppButton />
      <Footer />
    </div>
  );
}
