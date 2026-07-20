import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Image 
              src="/logo.png" 
              alt="Pulse Logo" 
              width={360} 
              height={120} 
              className="h-32 w-auto object-contain"
            />
            <p className="mt-2 max-w-xs text-sm text-ink-soft">
              Enterprise-grade social growth infrastructure — built for scale, reliability, and real-time visibility.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-10 gap-y-4 text-sm">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Legal</span>
              <Link href="/legal/terms" className="text-ink-soft hover:text-ink">Terms of Service</Link>
              <Link href="/legal/privacy" className="text-ink-soft hover:text-ink">Privacy Policy</Link>
              <Link href="/legal/refunds" className="text-ink-soft hover:text-ink">Refunds</Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Program</span>
              <Link href="/reseller" className="font-semibold text-accent hover:underline">Become a Reseller</Link>
              <Link href="/legal/momo-guide" className="text-ink-soft hover:text-ink">MoMo Guide</Link>
            </div>

          </div>
        </div>
        <p className="mt-8 text-xs text-ink-faint">© {new Date().getFullYear()} Pulse Growth Labs, West Africa. All rights reserved.</p>
      </div>
    </footer>
  );
}
