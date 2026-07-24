import type { Metadata } from "next";
import { Suspense } from "react";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { SuccessClient } from "./SuccessClient";

export const metadata: Metadata = {
  title: "Payment Successful — Pulse",
  description: "Thank you for your order. Your social growth is being processed.",
  robots: {
    index: false,
    follow: false,
  }
};

export default function SuccessPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10 sm:px-8 sm:py-16">
        <Suspense fallback={<p className="text-center text-ink-soft">Loading...</p>}>
          <SuccessClient />
        </Suspense>
      </main>
      <WhatsAppButton />
      <Footer />
    </div>
  );
}
