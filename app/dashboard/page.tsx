'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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

export default function DashboardPage() {
  const router = useRouter();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalGuests, setTotalGuests] = useState(0);

  useEffect(() => {
    fetchGuests();
  }, [page, searchTerm]);

  const fetchGuests = async () => {
    try {
      setLoading(true);
      const url = `/api/guests?page=${page}&limit=10&search=${encodeURIComponent(searchTerm)}`;
      const response = await fetch(url);
      const data = await response.json();

      if (response.ok && data.guests) {
        setGuests(data.guests);
        if (data.pagination) {
          setTotalPages(data.pagination.pages);
          setTotalGuests(data.pagination.total);
        }

        const statsRes = await fetch('/api/guests/stats');
        const statsData = await statsRes.json();
        if (statsRes.ok) {
          setStats(statsData);
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

  return (
    <div className="space-y-10 animate-slide-up">
      {/* Header & Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-fluid-h1 font-display font-black leading-tight">
            Dashboard
          </h1>
          <p className="text-ftour-text/60 mt-2 max-w-md">
            Gérez vos invitations et les entrées de vos invités en temps réel.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => router.push('/guests/add')}
            className="btn-primary group"
          >
            <svg className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            Ajouter un Invité
          </button>
          <button
            onClick={() => router.push('/guests/import')}
            className="btn-outline"
          >
            Importer CSV
          </button>
          <button
            onClick={() => router.push('/scanner')}
            className="btn-outline border-ftour-accent/40 bg-ftour-accent/5"
          >
            Scanner QR
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { label: "Total Invités", value: stats.total, color: "text-ftour-accent", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
          { label: "Vérifiés", value: stats.verified, color: "text-ftour-success", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
          { label: "En Attente", value: stats.pending, color: "text-ftour-accentSoft", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" }
        ].map((item, i) => (
          <div key={i} className="card relative group overflow-hidden">
            <div className={`absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity ${item.color}`}>
              <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={item.icon} /></svg>
            </div>
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-ftour-text/40">{item.label}</p>
            <h3 className={`text-fluid-h2 font-black mt-2 ${item.color}`}>{item.value}</h3>
          </div>
        ))}
      </div>

      {/* Guest List Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-fluid-h3 font-display font-bold">Liste des Admissions</h2>
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-11"
            />
            <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-ftour-accent/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
        </div>

        {/* Responsive List/Table */}
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
                {loading ? (
                  <tr><td colSpan={4} className="px-8 py-16 text-center text-ftour-text/40 italic">Chargement...</td></tr>
                ) : guests.length === 0 ? (
                  <tr><td colSpan={4} className="px-8 py-16 text-center text-ftour-text/40 italic">Aucun invité trouvé.</td></tr>
                ) : (
                  guests.map((guest) => (
                    <tr key={guest.id} className="hover:bg-ftour-accent/5 transition-colors group">
                      <td className="px-8 py-5">
                        <p className="font-bold text-ftour-text truncate max-w-[200px]">{guest.first_name} {guest.last_name}</p>
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
                        <Link href={`/api/guests/qr/${guest.qr_code}`} target="_blank" className="btn-small-outline opacity-40 group-hover:opacity-100 transition-opacity">
                          Voir QR
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List */}
          <div className="md:hidden divide-y divide-ftour-accent/10">
            {loading ? (
              <div className="p-8 text-center text-ftour-text/40">Chargement...</div>
            ) : guests.length === 0 ? (
              <div className="p-8 text-center text-ftour-text/40">Aucun invité trouvé.</div>
            ) : (
              guests.map((guest) => (
                <div key={guest.id} className="p-6 space-y-4 active:bg-ftour-accent/5 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-fluid-body">{guest.first_name} {guest.last_name}</p>
                      <p className="text-[10px] text-ftour-text/40 font-mono uppercase mt-1">#{guest.id.slice(0, 8)}</p>
                    </div>
                    <span className={`badge ${guest.verified ? 'bg-ftour-success/10 text-ftour-success' : 'bg-ftour-accent/10 text-ftour-accent'}`}>
                      {guest.verified ? 'OK' : '...'}
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="text-xs text-ftour-text/60">
                      <p>{guest.email}</p>
                      <p>{guest.phone}</p>
                    </div>
                    <Link href={`/api/guests/qr/${guest.qr_code}`} target="_blank" className="btn-small-outline shrink-0">
                      QR Code
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pagination & Export */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4">
          <div className="flex items-center gap-4">
            <p className="text-xs text-ftour-text/40 font-bold uppercase tracking-wider">
              {totalGuests} total
            </p>
            <div className="flex items-center bg-ftour-surface rounded-full p-1 border border-ftour-accent/10">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="p-2 disabled:opacity-20 text-ftour-accent"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
              </button>
              <span className="px-4 text-xs font-bold text-ftour-accentSoft">
                {page} / {totalPages}
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
          <Link href="/api/guests/export" className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-ftour-accent hover:text-ftour-accentSoft transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Exporter au format Excel
          </Link>
        </div>
      </div>
    </div>
  );
}
