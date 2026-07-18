"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { LayoutGrid, ListOrdered, LogOut, Zap } from "lucide-react";
import { clsx } from "clsx";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutGrid },
  { href: "/admin/orders", label: "Orders", icon: ListOrdered },
];

export function AdminShell({ children, email }: { children: React.ReactNode; email: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen bg-canvas">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-line bg-canvas-raised p-5 md:flex">
        <div className="flex items-center gap-2 px-1 font-display text-lg font-semibold">
          <Image 
            src="/logo.png" 
            alt="Pulse Admin Logo" 
            width={150} 
            height={50} 
            className="h-10 w-auto object-contain"
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

      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-line bg-canvas-raised px-5 py-3 md:hidden">
          <span className="font-display font-semibold">Pulse Admin</span>
          <button onClick={handleLogout} className="text-sm text-ink-soft">Log out</button>
        </header>
        <main className="p-5 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
