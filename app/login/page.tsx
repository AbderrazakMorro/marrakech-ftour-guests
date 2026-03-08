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
    <div className="min-h-screen flex items-center justify-center p-6 bg-ftour-background selection:bg-ftour-accent/30 animate-fade-in">
      <div className="w-full max-w-md">
        {/* Logo/Icon */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="h-20 w-20 rounded-3xl bg-ftour-accent flex items-center justify-center shadow-premium transform rotate-12 mb-6 group hover:rotate-0 transition-transform duration-500">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h2M4 8h16" /></svg>
          </div>
          <h1 className="text-fluid-h2 font-display font-black tracking-tight text-ftour-text italic">
            Marrakech Ftour
          </h1>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-ftour-accent-soft mt-2 opacity-60">
            Guest Manager
          </p>
        </div>

        <div className="card relative overflow-hidden group">
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-ftour-accent/5 rounded-full blur-3xl group-hover:bg-ftour-accent/10 transition-colors" />

          <div className="relative space-y-8">
            <div className="text-center">
              <h2 className="text-fluid-body font-black text-ftour-text">Connexion Administrateur</h2>
              <p className="text-[10px] text-ftour-text/40 uppercase tracking-widest mt-1">Accédez à votre tableau de bord</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.2em] text-ftour-accent-soft/60 ml-1">
                  Adresse Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="admin@example.com"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.2em] text-ftour-accent-soft/60 ml-1">
                  Mot de Passe
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div className="p-4 bg-ftour-danger/5 border border-ftour-danger/20 rounded-2xl text-[11px] font-bold text-ftour-danger text-center animate-shake">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-4 text-base mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-current" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Connexion...
                  </span>
                ) : "Se Connecter"}
              </button>
            </form>

            <div className="pt-4 border-t border-ftour-accent/5">
              <div className="bg-ftour-accent/5 p-4 rounded-2xl border border-ftour-accent/10">
                <p className="text-[9px] font-black uppercase tracking-widest text-ftour-accent-soft/40 text-center mb-2">Comptes de test</p>
                <p className="text-[11px] text-ftour-text/60 text-center font-medium">
                  <span className="text-ftour-accent-soft">admin@example.com</span> / <span className="text-ftour-accent-soft">admin123</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-10 text-[10px] text-ftour-text/30 text-center uppercase tracking-[0.2em] font-bold">
          &copy; 2024 Marrakech Ftour. Tous droits réservés.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="page-shell">
        <div className="text-ftour-accent-soft">Loading...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}


