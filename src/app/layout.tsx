import type { Metadata } from "next";
import "./globals.css";

const defaultUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://pulse.dev";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: {
    default: "Pulse — Social Growth, Tracked in Real Time",
    template: "%s | Pulse",
  },
  description:
    "Order and track social media growth services with live status updates — Buy Instagram followers, TikTok views, YouTube subscribers, and Telegram members.",
  keywords: [
    "social media growth",
    "buy instagram followers",
    "tiktok views",
    "youtube subscribers",
    "SMM panel",
    "social media marketing",
    "increase engagement",
    "Pulse",
  ],
  authors: [{ name: "Pulse" }],
  creator: "Pulse",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: defaultUrl,
    siteName: "Pulse",
    title: "Pulse — Top Social Media Growth Services",
    description:
      "Boost your online presence instantly. Order and track high-quality social media growth services for Instagram, TikTok, YouTube, and more with live status updates.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Pulse Social Media Growth Dashboard Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pulse — Social Growth, Tracked in Real Time",
    description:
      "Boost your online presence instantly. Order and track high-quality social media growth services with live status updates.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  alternates: {
    canonical: defaultUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        />
      </head>
      <body className="min-h-full flex flex-col bg-canvas text-ink">{children}</body>
    </html>
  );
}
