"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import PWAInstallButton from "./PWAInstallButton";

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login";

  return (
    <div className="min-h-screen">
      {!isAuthPage && (
        <header className="border-b border-ftour-accent/20 bg-ftour-surface/80 backdrop-blur">
          <div className="page-container flex items-center justify-between py-4">
            <Link href="/dashboard" className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-ftour-accent/90 shadow-md shadow-black/40">
                <span className="h-5 w-5 rotate-12 rounded-md border border-amber-100/50 bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 shadow-inner shadow-black/60" />
              </span>
              <div className="leading-tight">
                <p className="font-semibold tracking-wide text-ftour-accentSoft">
                  Marrakech Ftour
                </p>
                <p className="text-xs text-ftour-text/70">
                  Guest & invitation manager
                </p>
              </div>
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link
                href="/guests"
                className="text-ftour-text/80 hover:text-ftour-accentSoft"
              >
                Guests
              </Link>
              <Link
                href="/guests/import"
                className="text-ftour-text/80 hover:text-ftour-accentSoft"
              >
                Import CSV
              </Link>
              <Link
                href="/scanner"
                className="text-ftour-text/80 hover:text-ftour-accentSoft"
              >
                QR Scanner
              </Link>
              <PWAInstallButton />
              <form action="/api/auth/logout" method="post">
                <button
                  type="submit"
                  className="btn-outline text-xs px-3 py-1.5 rounded-full"
                >
                  Logout
                </button>
              </form>
            </nav>
          </div>
        </header>
      )}
      <main>{children}</main>
    </div>
  );
}


