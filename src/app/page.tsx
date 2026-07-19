import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ShieldCheck, Wallet, Sparkles, Link2, Radar, Zap, TrendingUp } from "lucide-react";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { PlatformIcon } from "@/components/PlatformIcon";
import { SERVICES } from "@/lib/services";

export default async function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />

      {/* ═══ Gradient hero backdrop ═══ */}
      <div className="hero-gradient relative overflow-hidden">
        {/* Floating decorative shapes */}
        <div className="hero-blob hero-blob-1" />
        <div className="hero-blob hero-blob-2" />
        <div className="hero-blob hero-blob-3" />

        <main className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:px-8 sm:py-14">
          {/* Hero bento row */}
          <section className="grid grid-cols-1 gap-4 md:grid-cols-12">
            <div className="bento hero-card count-tick flex flex-col justify-between p-8 md:col-span-7 md:p-10">
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
                <Sparkles className="h-3.5 w-3.5" /> Live delivery, every order
              </span>
              <div className="mt-6">
                <h1 className="font-display text-4xl font-semibold leading-[1.05] sm:text-5xl">
                  Social media growth you can
                  <br />
                  <span className="hero-text-gradient">watch happen.</span>
                </h1>
                <h2 className="mt-4 max-w-md text-ink-soft text-base font-normal">
                  Order high-quality engagement—buy Instagram followers, TikTok views, YouTube subscribers, and Telegram members. Track every delivery live, down to the minute. The ultimate SMM Panel experience.
                </h2>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/order"
                  className="hero-cta inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition-all hover:scale-[1.03] hover:shadow-lg"
                >
                  Start an order <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/track"
                  className="inline-flex items-center gap-2 rounded-full border border-line px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-canvas"
                >
                  Track existing order
                </Link>
              </div>
            </div>

            {/* Hero illustration */}
            <div className="relative flex items-center justify-center md:col-span-5">
              <div className="hero-image-glow" />
              <Image
                src="/hero-illustration.png"
                alt="Social media growth illustration showing trending charts and platform icons"
                width={480}
                height={480}
                className="hero-image relative z-10 drop-shadow-2xl"
                priority
              />
            </div>
          </section>

          {/* Stats ribbon */}
          <section className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="bento stat-card count-tick flex flex-col justify-center p-6">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft text-accent">
                  <TrendingUp className="h-4 w-4" />
                </span>
              </div>
              <p className="font-data mt-3 text-3xl font-semibold text-ink">
                124,500+
              </p>
              <p className="mt-1 text-sm text-ink-soft">Accounts boosted</p>
            </div>
            <div className="bento stat-card count-tick flex flex-col justify-center p-6">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-signal-soft text-signal">
                  <Zap className="h-4 w-4" />
                </span>
              </div>
              <p className="font-data mt-3 text-3xl font-semibold text-ink">50+</p>
              <p className="mt-1 text-sm text-ink-soft">Countries served</p>
            </div>
            <div className="bento stat-card count-tick flex flex-col justify-center p-6">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-warn-soft text-warn">
                  <Sparkles className="h-4 w-4" />
                </span>
              </div>
              <p className="font-data mt-3 text-3xl font-semibold text-ink">99.8%</p>
              <p className="mt-1 text-sm text-ink-soft">Uptime guarantee</p>
            </div>
            <div className="bento stat-card flex items-center gap-3 p-6">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-signal-soft text-signal pulse-dot">
                <Radar className="h-4 w-4" />
              </span>
              <p className="text-sm text-ink-soft">
                <span className="font-medium text-ink">842 orders</span> in
                progress right now
              </p>
            </div>
          </section>

        {/* Trending services */}
        <section className="mt-14">
          <div className="mb-5 flex items-end justify-between">
            <h2 className="font-display text-2xl font-semibold">Top Social Media Growth Services</h2>
            <Link href="/order" className="text-sm font-medium text-accent hover:underline">
              View all platforms
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICES.map((service) => (
              <Link
                key={service.platform}
                href={`/order?platform=${encodeURIComponent(service.platform)}`}
                className="bento group flex flex-col justify-between p-6 transition-colors hover:border-line-strong"
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-canvas text-ink">
                    <PlatformIcon platform={service.platform} className="h-4.5 w-4.5" />
                  </span>
                  <span className="font-medium">{service.name}</span>
                </div>
                <p className="mt-4 text-sm text-ink-soft">{service.description}</p>
                <div className="mt-5 flex items-end justify-between">
                  <div>
                    <p className="text-xs text-ink-faint">Starting at</p>
                    <p className="font-data font-semibold text-ink">₵{service.startingPrice.toFixed(2)}</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-ink-faint transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="mt-14">
          <h2 className="mb-5 font-display text-2xl font-semibold">How it works</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              { icon: Sparkles, title: "Choose a package", body: "Pick a platform and the exact service that fits your goal." },
              { icon: Link2, title: "Drop your link", body: "Paste your profile link or username. We never ask for your password." },
              { icon: Radar, title: "Track it live", body: "Follow delivery in real time from your own order-tracking page." },
            ].map((step) => (
              <div key={step.title} className="bento p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-accent">
                  <step.icon className="h-5 w-5" />
                </span>
                <p className="mt-4 font-medium">{step.title}</p>
                <p className="mt-1.5 text-sm text-ink-soft">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Trust / payments */}
        <section className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="bento p-6">
            <ShieldCheck className="h-5 w-5 text-signal" />
            <p className="mt-3 font-medium">Private by default</p>
            <p className="mt-1.5 text-sm text-ink-soft">Your data is never sold or shared. No passwords, ever.</p>
          </div>
          <div className="bento p-6">
            <Wallet className="h-5 w-5 text-signal" />
            <p className="mt-3 font-medium">Mobile Money ready</p>
            <p className="mt-1.5 text-sm text-ink-soft">Pay with MTN, Vodafone, AirtelTigo — or crypto, Binance Pay, PayPal.</p>
          </div>
          <div className="bento p-6">
            <Radar className="h-5 w-5 text-signal" />
            <p className="mt-3 font-medium">Real-time delivery</p>
            <p className="mt-1.5 text-sm text-ink-soft">Every order updates live — no refreshing, no guesswork.</p>
          </div>
        </section>
      </main>
      </div>

      <WhatsAppButton />
      <Footer />
    </div>
  );
}
