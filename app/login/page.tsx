"use client";

import { FormEvent, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password }),
        credentials: "include" // Ensure cookies are sent and received
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.message || "Invalid credentials");
        setLoading(false);
        return;
      }

      // Small delay to ensure cookie is set before redirect
      await new Promise(resolve => setTimeout(resolve, 100));

      const redirect = searchParams.get("redirect") || "/dashboard";
      router.replace(redirect);
    } catch (err) {
      console.error(err);
      setError("Unable to login. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="page-container max-w-md">
        <div className="card p-8 relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-lantern-gradient opacity-80" />
          <div className="relative space-y-6">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-ftour-accent shadow-lg shadow-black/60">
                <span className="h-8 w-8 rotate-12 rounded-md border border-amber-100/60 bg-gradient-to-br from-amber-200 via-amber-500 to-amber-800 shadow-inner shadow-black/60" />
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-wide text-ftour-accentSoft">
                  Ftour Guest Manager
                </h1>
                <p className="mt-1 text-sm text-ftour-text/75">
                  Welcome back. Enter the lantern-lit dashboard and manage your
                  Marrakech Ramadan ftour invitations.
                </p>
              </div>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="text-xs font-medium uppercase tracking-wide text-ftour-accentSoft"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full"
                  placeholder="admin@example.com"
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="text-xs font-medium uppercase tracking-wide text-ftour-accentSoft"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full"
                  placeholder="••••••••"
                />
              </div>
              {error && (
                <p className="text-sm text-ftour-danger bg-ftour-background/80 border border-ftour-danger/50 rounded-md px-3 py-2">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full mt-2"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
              <p className="mt-3 text-[11px] text-ftour-text/55 text-center">
                Default admin user is{" "}
                <span className="font-semibold text-ftour-accentSoft">
                  admin@example.com / admin123
                </span>
                . Update the password in Supabase and environment variables
                before going to production.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="page-shell">
        <div className="text-ftour-accentSoft">Loading...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}


