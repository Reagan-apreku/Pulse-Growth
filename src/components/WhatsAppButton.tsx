"use client";

import { MessageCircle } from "lucide-react";

const SUPPORT_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "233000000000";

export function WhatsAppButton({ message }: { message?: string }) {
  const text = encodeURIComponent(message || "Hi! I have a question about my Pulse order.");
  const href = `https://wa.me/${SUPPORT_NUMBER}?text=${text}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-signal text-white shadow-lg shadow-black/10 transition-transform hover:scale-105"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-6 w-6" fill="white" strokeWidth={0} />
    </a>
  );
}
