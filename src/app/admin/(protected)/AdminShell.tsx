"use client";

import { useState } from "react";
import Link from "next/link";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { LayoutGrid, ListOrdered, Tag, Users, LogOut, Menu, X } from "lucide-react";
import { clsx } from "clsx";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutGrid },
  { href: "/admin/orders", label: "Orders", icon: ListOrdered },
  { href: "/admin/coupons", label: "Coupons", icon: Tag },
  { href: "/admin/resellers", label: "Resellers", icon: Users },
];

export function AdminShell({ children, email }: { children: React.ReactNode; email: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-col bg-canvas md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-line bg-canvas-raised p-5 md:flex">
        <div className="flex items-center gap-2 px-1 font-display text-lg font-semibold">
          <Image 
            src="/logo.png" 
            alt="Pulse Admin Logo" 
            width={360} 
            height={120} 
            className="h-28 w-auto object-contain"
          />
        </div>
        <nav className="mt-8 flex flex-col gap-1">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active ? "bg-ink text-canvas" : "text-ink-soft hover:bg-canvas"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto space-y-3 border-t border-line pt-4">
          <p className="truncate px-1 text-xs text-ink-faint">{email}</p>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:bg-canvas"
          >
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </div>
      </aside>

      {/* Mobile Top Header & Navigation */}
      <header className="sticky top-0 z-30 border-b border-line bg-canvas-raised md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Image 
              src="/logo.png" 
              alt="Pulse Admin Logo" 
              width={160} 
              height={48} 
              className="h-9 w-auto object-contain"
            />
            <span className="rounded-md bg-signal-soft px-1.5 py-0.5 text-[10px] font-bold text-signal">ADMIN</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-xl border border-line bg-canvas p-2 text-ink"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Horizontal Navigation Bar */}
        <div className="no-scrollbar flex overflow-x-auto border-t border-line/60 px-3 py-2">
          <div className="flex min-w-full gap-1.5">
            {NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                    active
                      ? "bg-accent text-white shadow-sm"
                      : "border border-line bg-canvas text-ink-soft hover:bg-canvas-raised"
                  )}
                >
                  <item.icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Mobile Dropdown Menu Overlay */}
        {mobileMenuOpen && (
          <div className="border-t border-line bg-canvas-raised p-4 shadow-xl">
            <nav className="flex flex-col gap-1.5">
              {NAV.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={clsx(
                      "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                      active ? "bg-ink text-canvas" : "text-ink-soft hover:bg-canvas"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-xs text-ink-soft">
              <span className="truncate">{email}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 rounded-lg bg-danger-soft px-3 py-1.5 font-medium text-danger"
              >
                <LogOut className="h-3.5 w-3.5" /> Logout
              </button>
            </div>
          </div>
        )}
      </header>

      <div className="flex-1 overflow-x-hidden">
        <main className="p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}

