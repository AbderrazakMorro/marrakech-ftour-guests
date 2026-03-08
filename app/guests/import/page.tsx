'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ImportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{ created: number; errors?: any[] } | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError('');
    setSuccess(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/guests/import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to import guests');
      }

      setSuccess(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-slide-up">
      <div className="max-w-2xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-fluid-h2 font-display font-black leading-tight">
            Importer des Invités
          </h1>
          <p className="text-ftour-text/60 mt-2">
            Téléchargez un fichier CSV pour envoyer des invitations en masse.
          </p>
        </div>

        <div className="card space-y-8">
          <div className="space-y-4">
            <h2 className="text-fluid-body font-bold text-ftour-accentSoft flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Format du Fichier CSV
            </h2>
            <div className="bg-ftour-accent/5 p-5 rounded-2xl border border-ftour-accent/10">
              <p className="text-xs text-ftour-text/70 mb-3 leading-relaxed">
                Votre fichier doit contenir les colonnes suivantes (l'ordre n'importe pas) :
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'first_name', desc: 'Requis' },
                  { label: 'last_name', desc: 'Requis' },
                  { label: 'email', desc: 'Requis' },
                  { label: 'phone', desc: 'Optionnel' },
                ].map((col) => (
                  <div key={col.label} className="flex flex-col p-2 rounded-lg bg-ftour-background/40 border border-ftour-accent/5">
                    <code className="text-[10px] font-bold text-ftour-accent">{col.label}</code>
                    <span className="text-[9px] uppercase tracking-tighter text-ftour-text/30">{col.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {success && (
            <div className="p-5 bg-ftour-success/10 border border-ftour-success/20 text-ftour-success rounded-2xl animate-fade-in">
              <p className="font-bold text-sm">
                Importation de {success.created} invité(s) réussie !
              </p>
              {success.errors && success.errors.length > 0 && (
                <div className="mt-3 pt-3 border-t border-ftour-success/20">
                  <p className="text-[10px] uppercase font-black tracking-widest opacity-60 mb-2">Erreurs relevées :</p>
                  <ul className="space-y-1">
                    {success.errors.map((err: any, idx: number) => (
                      <li key={idx} className="text-xs flex items-center gap-2">
                        <span className="h-1 w-1 bg-ftour-success rounded-full" />
                        <span className="font-bold">{err.email}</span>: <span className="opacity-70">{err.error}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="p-5 bg-ftour-danger/10 border border-ftour-danger/20 text-ftour-danger rounded-2xl text-sm font-bold animate-fade-in">
              {error}
            </div>
          )}

          <div className="space-y-6 pt-2">
            <div className="space-y-2">
              <label htmlFor="csv-file" className="text-xs font-black uppercase tracking-widest text-ftour-accentSoft/60 ml-1">
                Sélectionner le fichier .csv
              </label>
              <div className="relative group">
                <input
                  type="file"
                  id="csv-file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  disabled={loading}
                  className="hidden"
                />
                <label
                  htmlFor="csv-file"
                  className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-ftour-accent/20 rounded-3xl cursor-pointer hover:bg-ftour-accent/5 hover:border-ftour-accent/40 transition-all group"
                >
                  <svg className="w-12 h-12 text-ftour-accent/40 group-hover:scale-110 transition-transform mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                  <p className="text-sm font-bold text-ftour-text/80">Cliquez pour choisir un fichier</p>
                  <p className="text-[10px] text-ftour-text/40 mt-1 uppercase tracking-widest">Format supporté: .CSV</p>
                </label>
              </div>
            </div>

            {loading && (
              <div className="flex flex-col items-center gap-3 py-4 animate-pulse">
                <svg className="animate-spin h-6 w-6 text-ftour-accent" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <p className="text-xs font-bold text-ftour-accentSoft uppercase tracking-widest italic">Importation et envoi des emails en cours...</p>
              </div>
            )}

            <button
              onClick={() => router.push('/dashboard')}
              className="btn-outline w-full py-4"
            >
              Retour au Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

