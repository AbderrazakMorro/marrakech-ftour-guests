import { type ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import PWAInstallButton from "./PWAInstallButton";

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login";
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  if (isAuthPage) return <main className="animate-fade-in">{children}</main>;

  const navItems = [
    {
      label: "Dashboard", href: "/dashboard", icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
      )
    },
    {
      label: "Guests", href: "/guests", icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
      )
    },
    {
      label: "Import", href: "/guests/import", icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" /></svg>
      )
    },
    {
      label: "Scanner", href: "/scanner", icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h2M4 8h16" /></svg>
      )
    },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-ftour-background selection:bg-ftour-accent selection:text-ftour-background overflow-x-hidden">
      {/* Desktop Sidebar */}
      <header className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-50 glass border-r border-ftour-accent/20">
        <div className="flex flex-col h-full py-8 px-6">
          <Link href="/dashboard" className="flex items-center gap-3 mb-12">
            <div className="h-10 w-10 flex items-center justify-center rounded-2xl bg-ftour-accent shadow-premium">
              <span className="h-6 w-6 rotate-12 rounded-lg border border-white/20 bg-gradient-to-br from-amber-300 to-amber-700 shadow-inner" />
            </div>
            <div>
              <p className="font-display text-lg font-bold">Ftour Manager</p>
              <p className="text-[10px] text-ftour-text/40 tracking-widest uppercase">Marrakech Event</p>
            </div>
          </Link>

          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 group ${pathname === item.href
                  ? "bg-ftour-accent text-ftour-background font-bold shadow-premium"
                  : "text-ftour-text/60 hover:bg-ftour-accent/10 hover:text-ftour-accentSoft"
                  }`}
              >
                <span className={`${pathname === item.href ? "" : "group-hover:scale-110 transition-transform"}`}>{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="mt-auto space-y-4 pt-8 border-t border-ftour-accent/10">
            <PWAInstallButton />
            <form action="/api/auth/logout" method="post">
              <button
                type="submit"
                className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-ftour-danger/70 hover:bg-ftour-danger/10 hover:text-ftour-danger transition-colors text-sm font-bold"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Mobile Header Overlay */}
      <div className="md:hidden flex items-center justify-between px-6 py-4 glass border-b border-ftour-accent/10 sticky top-0 z-50 backdrop-blur-xl">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="h-8 w-8 flex items-center justify-center rounded-xl bg-ftour-accent">
            <span className="h-4 w-4 rotate-12 rounded-md border border-white/20 bg-gradient-to-br from-amber-300 to-amber-700 shadow-inner" />
          </div>
          <span className="font-display font-bold">Ftour Manager</span>
        </Link>

        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="h-10 w-10 flex items-center justify-center rounded-xl bg-ftour-accent/10 text-ftour-accent transition-all active:scale-95"
          aria-label="Toggle Menu"
        >
          {isMenuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
          )}
        </button>
      </div>

      {/* Mobile Full-Screen Menu */}
      <div
        className={`md:hidden fixed inset-0 z-40 glass backdrop-blur-2xl transition-all duration-500 ease-in-out transform ${isMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"
          }`}
      >
        <div className="flex flex-col h-full pt-24 pb-12 px-8">
          <nav className="space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-6 px-6 py-5 rounded-3xl transition-all ${pathname === item.href
                  ? "bg-ftour-accent text-ftour-background font-bold shadow-premium scale-105"
                  : "text-ftour-text/60 bg-ftour-accent/5"
                  }`}
              >
                <div className={`${pathname === item.href ? "text-ftour-background" : "text-ftour-accent"}`}>
                  {item.icon}
                </div>
                <span className="text-lg tracking-tight">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="mt-auto space-y-4">
            <PWAInstallButton />
            <form action="/api/auth/logout" method="post">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-4 px-6 py-5 rounded-3xl bg-ftour-danger/5 text-ftour-danger font-bold transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                Déconnexion
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 animate-fade-in p-4 md:p-12 relative z-0">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}


