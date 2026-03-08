'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddGuestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/guests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add guest');
      }

      setSuccess(true);
      setFormData({ first_name: '', last_name: '', email: '', phone: '' });

      setTimeout(() => {
        router.push('/guests');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-slide-up">
      <div className="max-w-2xl mx-auto">
        <div className="mb-10">
          <h1 className="text-fluid-h2 font-display font-black leading-tight text-center">
            Ajouter un Nouvel Invité
          </h1>
          <p className="text-ftour-text/60 text-center mt-2">
            Remplissez les informations pour envoyer une invitation automatique.
          </p>
        </div>

        <div className="card">
          {success && (
            <div className="mb-8 p-4 bg-ftour-success/10 border border-ftour-success/20 text-ftour-success rounded-xl text-sm font-bold animate-fade-in text-center">
              Invité ajouté avec succès ! Redirection...
            </div>
          )}

          {error && (
            <div className="mb-8 p-4 bg-ftour-danger/10 border border-ftour-danger/20 text-ftour-danger rounded-xl text-sm font-bold animate-fade-in text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="first_name" className="text-xs font-black uppercase tracking-widest text-ftour-accentSoft/60 ml-1">
                  Prénom *
                </label>
                <input
                  type="text"
                  id="first_name"
                  required
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="input-field"
                  placeholder="Ex: Amine"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="last_name" className="text-xs font-black uppercase tracking-widest text-ftour-accentSoft/60 ml-1">
                  Nom *
                </label>
                <input
                  type="text"
                  id="last_name"
                  required
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="input-field"
                  placeholder="Ex: Alaoui"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-ftour-accentSoft/60 ml-1">
                Email *
              </label>
              <input
                type="email"
                id="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-field"
                placeholder="amine.alaoui@email.com"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="text-xs font-black uppercase tracking-widest text-ftour-accentSoft/60 ml-1">
                Téléphone
              </label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input-field"
                placeholder="+212 6..."
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-4 text-base"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-current" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Traitement...
                  </span>
                ) : (
                  'Ajouter & Envoyer l\'Invitation'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

