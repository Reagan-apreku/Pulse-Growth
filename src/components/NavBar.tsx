"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Zap, Menu, X } from "lucide-react";
import { clsx } from "clsx";
import { useState, useEffect } from "react";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/order", label: "Order Services" },
  { href: "/track", label: "Track Order" },
];

export function NavBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Prevent scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight">
          <Image 
            src="/logo.png" 
            alt="Pulse Logo" 
            width={360} 
            height={120} 
            className="h-32 w-auto object-contain"
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 rounded-full border border-line bg-canvas-raised p-1 md:flex">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                  active ? "bg-ink text-canvas" : "text-ink-soft hover:text-ink"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/order"
            className="hidden rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 md:inline-flex"
          >
            Get Started
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={clsx(
          "fixed inset-0 top-[65px] z-50 transition-all duration-300 md:hidden",
          open ? "visible opacity-100" : "invisible opacity-0"
        )}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-ink/20 backdrop-blur-sm" onClick={() => setOpen(false)} />

        {/* Drawer */}
        <nav
          className={clsx(
            "relative mx-4 mt-2 flex flex-col gap-1 rounded-2xl border border-line bg-canvas-raised p-4 shadow-xl transition-transform duration-300",
            open ? "translate-y-0" : "-translate-y-4"
          )}
        >
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                  active ? "bg-ink text-canvas" : "text-ink-soft hover:bg-canvas hover:text-ink"
                )}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="my-2 border-t border-line" />
          <Link
            href="/order"
            className="hero-cta rounded-xl px-4 py-3 text-center text-sm font-semibold text-white"
          >
            Get Started
          </Link>
        </nav>
      </div>
    </header>
  );
}
