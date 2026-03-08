'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

interface Guest {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  qr_code: string;
  verified: boolean;
}

export default function GuestsPage() {
  const router = useRouter();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'verified' | 'not_verified'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalGuests, setTotalGuests] = useState(0);

  useEffect(() => {
    fetchGuests();
  }, [filter, page, searchTerm]);

  const fetchGuests = async () => {
    try {
      setLoading(true);
      const url = `/api/guests?page=${page}&limit=20&filter=${filter === 'all' ? '' : filter}&search=${encodeURIComponent(searchTerm)}`;

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok && data.guests) {
        setGuests(data.guests);
        if (data.pagination) {
          setTotalPages(data.pagination.pages);
          setTotalGuests(data.pagination.total);
        }
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Failed to fetch guests:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    window.location.href = '/api/guests/export';
  };

  if (loading && page === 1 && searchTerm === '') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-6 flex items-center justify-center">
        <div className="text-amber-900 text-xl flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
          <span>Loading guests...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-slide-up">
      {/* Header & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-fluid-h1 font-display font-black leading-tight">
            Gestion des Invités
          </h1>
          <p className="text-ftour-text/60 mt-2">
            Consultez, filtrez et gérez l'ensemble de votre liste d'invités.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExport}
            className="btn-outline flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Exporter CSV
          </button>
          <Link href="/guests/add" className="btn-primary">
            + Ajouter un invité
          </Link>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 relative">
          <input
            type="text"
            placeholder="Rechercher par nom, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-12"
          />
          <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-ftour-accent/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
        <select
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value as any);
            setPage(1);
          }}
          className="input-field"
        >
          <option value="all">Tous les invités</option>
          <option value="verified">Vérifiés uniquement</option>
          <option value="not_verified">Non vérifiés</option>
        </select>
      </div>

      {/* Guest List Card */}
      <div className="card !p-0 overflow-hidden border-none md:border md:border-ftour-accent/10">
        <div className="hidden md:block">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-ftour-accent/5 text-[10px] uppercase font-black tracking-[0.2em] text-ftour-accentSoft/60">
                <th className="px-8 py-5">Invité</th>
                <th className="px-8 py-5">Contact</th>
                <th className="px-8 py-5 text-center">Statut</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ftour-accent/5">
              {loading && page === 1 ? (
                <tr><td colSpan={4} className="px-8 py-24 text-center">
                  <div className="flex flex-col items-center gap-4 animate-pulse">
                    <div className="w-10 h-10 border-2 border-ftour-accent/20 border-t-ftour-accent rounded-full animate-spin" />
                    <span className="text-xs font-bold text-ftour-accentSoft uppercase tracking-widest italic">Chargement...</span>
                  </div>
                </td></tr>
              ) : guests.length === 0 ? (
                <tr><td colSpan={4} className="px-8 py-16 text-center text-ftour-text/40 italic">Aucun invité trouvé.</td></tr>
              ) : (
                guests.map((guest) => (
                  <tr key={guest.id} className="hover:bg-ftour-accent/5 transition-colors group">
                    <td className="px-8 py-5">
                      <p className="font-bold text-ftour-text">{guest.first_name} {guest.last_name}</p>
                      <p className="text-[10px] text-ftour-text/40 font-mono mt-1">ID: {guest.id.slice(0, 8)}</p>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm font-medium text-ftour-text/80">{guest.email}</p>
                      <p className="text-xs text-ftour-text/40 mt-0.5">{guest.phone || '-'}</p>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className={`badge ${guest.verified ? 'bg-ftour-success/10 text-ftour-success' : 'bg-ftour-accent/10 text-ftour-accent'}`}>
                        {guest.verified ? 'Vérifié' : 'En attente'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end items-center gap-3">
                        <Link href={`/api/guests/qr/${guest.qr_code}`} target="_blank" className="text-ftour-accent hover:text-ftour-accentSoft p-2" title="Voir QR">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h2M4 8h16" /></svg>
                        </Link>
                        <button
                          onClick={() => router.push(`/guests/edit/${guest.id}`)}
                          className="text-ftour-accentSoft hover:text-ftour-accent p-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm(`Supprimer ${guest.first_name} ?`)) {
                              const res = await fetch(`/api/guests/${guest.id}`, { method: 'DELETE' });
                              if (res.ok) fetchGuests();
                            }
                          }}
                          className="text-ftour-danger/50 hover:text-ftour-danger p-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card List */}
        <div className="md:hidden divide-y divide-ftour-accent/10">
          {loading && page === 1 ? (
            <div className="p-16 text-center animate-pulse text-ftour-accent">Chargement...</div>
          ) : guests.length === 0 ? (
            <div className="p-8 text-center text-ftour-text/40 italic">Aucun invité trouvé.</div>
          ) : (
            guests.map((guest) => (
              <div key={guest.id} className="p-6 space-y-4 active:bg-ftour-accent/5 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-fluid-body">{guest.first_name} {guest.last_name}</p>
                    <p className="text-[10px] text-ftour-text/40 font-mono uppercase mt-1">#{guest.id.slice(0, 8)}</p>
                  </div>
                  <span className={`badge ${guest.verified ? 'bg-ftour-success/10 text-ftour-success' : 'bg-ftour-accent/10 text-ftour-accent'}`}>
                    {guest.verified ? 'Vérifié' : 'En attente'}
                  </span>
                </div>
                <div className="text-xs text-ftour-text/60 space-y-1">
                  <p className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7 8.914a1.011 1.011 0 01-.2 1.285L3 24h18l-7.2-5.76a1.01 1.01 0 01-.2-1.285L21 8H3z" /></svg>
                    {guest.email}
                  </p>
                  <p className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    {guest.phone || 'Non renseigné'}
                  </p>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <Link href={`/api/guests/qr/${guest.qr_code}`} target="_blank" className="btn-small-outline">
                    QR Code
                  </Link>
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/guests/edit/${guest.id}`)}
                      className="p-2 bg-ftour-accentSoft/10 text-ftour-accentSoft rounded-xl"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm(`Supprimer ${guest.first_name} ?`)) {
                          const res = await fetch(`/api/guests/${guest.id}`, { method: 'DELETE' });
                          if (res.ok) fetchGuests();
                        }
                      }}
                      className="p-2 bg-ftour-danger/10 text-ftour-danger rounded-xl"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4">
        <p className="text-xs text-ftour-text/40 font-bold uppercase tracking-wider">
          Affichage de {guests.length} sur {totalGuests} invités
        </p>
        <div className="flex items-center bg-ftour-surface rounded-full p-1 border border-ftour-accent/10">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            className="p-2 disabled:opacity-20 text-ftour-accent"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <span className="px-6 text-xs font-bold text-ftour-accentSoft">
            Page {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || loading}
            className="p-2 disabled:opacity-20 text-ftour-accent"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
