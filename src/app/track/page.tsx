import type { Metadata } from "next";
import { Suspense } from "react";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { TrackClient } from "./TrackClient";

export const metadata: Metadata = {
  title: "Track Your Order — Pulse",
  description: "Enter your order ID to view real-time delivery status, growth metrics, and service details for your social media order.",
  openGraph: {
    title: "Track Your Social Growth Order — Pulse",
    description: "Live order tracking with real-time delivery progress.",
    type: "website",
  },
};

export default function TrackPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:px-8 sm:py-14">
        <Suspense fallback={null}>
          <TrackClient />
        </Suspense>
      </main>
      <WhatsAppButton />
      <Footer />
    </div>
  );
}
