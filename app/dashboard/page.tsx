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
    <div className="min-h-[calc(100-64px)] p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header & Quick Actions */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-ftour-accentSoft">Dashboard</h1>
            <p className="text-ftour-text/60 text-sm mt-1">Manage your event invitations and guest entries.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/guests/add" className="btn-small">
              <span>Add Guest</span>
            </Link>
            <Link href="/guests/import" className="btn-small-outline">
              <span>Import CSV</span>
            </Link>
            <Link href="/scanner" className="btn-small-outline bg-ftour-accent/5">
              <span>Open Scanner</span>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass p-5 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" /></svg>
            </div>
            <p className="text-ftour-text/50 text-xs font-semibold uppercase tracking-wider">Total Guests</p>
            <h3 className="text-3xl font-bold text-ftour-accent mt-1">{stats.total}</h3>
          </div>
          <div className="glass p-5 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-ftour-success">
              <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
            </div>
            <p className="text-ftour-text/50 text-xs font-semibold uppercase tracking-wider">Verified</p>
            <h3 className="text-3xl font-bold text-ftour-success mt-1">{stats.verified}</h3>
          </div>
          <div className="glass p-5 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-ftour-accentSoft">
              <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm3.3 14.71L11 13.59V7h1.5v5.91l3.35 2.12-.86 1.68z" /></svg>
            </div>
            <p className="text-ftour-text/50 text-xs font-semibold uppercase tracking-wider">Pending</p>
            <h3 className="text-3xl font-bold text-ftour-accentSoft mt-1">{stats.pending}</h3>
          </div>
        </div>

        {/* Guest List Card */}
        <div className="glass rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-ftour-accent/10 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="font-semibold text-ftour-accentSoft">Guest Admissions</h2>
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search guests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-ftour-background/50 border-ftour-accent/20 text-xs py-2 pl-8"
              />
              <svg className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-ftour-text/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-ftour-accent/5 text-ftour-accentSoft/70 text-[10px] uppercase tracking-widest font-bold">
                  <th className="px-6 py-3">Guest Name</th>
                  <th className="px-6 py-3">Contact</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Invitation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ftour-accent/5">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-ftour-text/40">Loading guests...</td>
                  </tr>
                ) : guests.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-ftour-text/40">No guests found.</td>
                  </tr>
                ) : (
                  guests.map((guest) => (
                    <tr key={guest.id} className="hover:bg-ftour-accent/5 transition-colors group">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-ftour-text">{guest.first_name} {guest.last_name}</p>
                        <p className="text-[10px] text-ftour-text/40 font-mono uppercase mt-0.5">ID: {guest.id.slice(0, 8)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-ftour-text/80">{guest.email}</p>
                        <p className="text-[10px] text-ftour-text/50">{guest.phone || 'No phone'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`badge ${guest.verified
                          ? 'bg-ftour-success/10 text-ftour-success border border-ftour-success/20'
                          : 'bg-ftour-accent/10 text-ftour-accent border border-ftour-accent/20'
                          }`}>
                          {guest.verified ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 transition-opacity">
                          <Link href={`/api/guests/qr/${guest.qr_code}`} target="_blank" className="text-ftour-accent hover:text-ftour-accentSoft transition-colors">
                            <span className="text-[10px] uppercase font-bold tracking-tight bg-ftour-accent/10 px-2 py-1 rounded border border-ftour-accent/20">View QR</span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-ftour-accent/5 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <p className="text-[11px] text-ftour-text/40">Showing {guests.length} of {totalGuests} guests</p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1 || loading}
                  className="btn-small-outline py-1 px-2 disabled:opacity-30"
                >
                  Prev
                </button>
                <span className="text-[11px] font-mono text-ftour-accentSoft px-2">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || loading}
                  className="btn-small-outline py-1 px-2 disabled:opacity-30"
                >
                  Next
                </button>
              </div>
            </div>
            <Link href="/api/guests/export" className="text-[11px] font-bold text-ftour-accent hover:underline flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Quick Export
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
