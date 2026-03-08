'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-4xl font-bold text-amber-900 mb-4 md:mb-0">
            Guest List
          </h1>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search guests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border-2 border-amber-200 rounded-lg bg-white text-amber-900 focus:outline-none focus:border-amber-500 w-full sm:w-64"
              />
              <svg className="w-5 h-5 absolute left-3 top-2.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value as any);
                setPage(1);
              }}
              className="px-4 py-2 border-2 border-amber-200 rounded-lg bg-white text-amber-900 focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Guests</option>
              <option value="verified">Verified</option>
              <option value="not_verified">Not Verified</option>
            </select>
            <button
              onClick={handleExport}
              className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold py-2 px-6 rounded-lg hover:shadow-lg transition-all"
            >
              Export CSV
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-amber-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-amber-500 to-orange-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left">Name</th>
                  <th className="px-6 py-4 text-left">Email</th>
                  <th className="px-6 py-4 text-left">Phone</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-amber-700">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
                        <span>Updating list...</span>
                      </div>
                    </td>
                  </tr>
                ) : guests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-amber-700">
                      No guests found
                    </td>
                  </tr>
                ) : (
                  guests.map((guest) => (
                    <tr
                      key={guest.id}
                      className="border-b border-amber-100 hover:bg-amber-50"
                    >
                      <td className="px-6 py-4 font-medium text-amber-900">
                        {guest.first_name} {guest.last_name}
                      </td>
                      <td className="px-6 py-4 text-amber-700">{guest.email}</td>
                      <td className="px-6 py-4 text-amber-700">
                        {guest.phone || '-'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${guest.verified
                            ? 'bg-green-100 text-green-800'
                            : 'bg-orange-100 text-orange-800'
                            }`}
                        >
                          {guest.verified ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center items-center gap-3">
                          <a href={`/api/guests/qr/${guest.qr_code}`} target="_blank" className="text-amber-600 hover:text-amber-800 font-bold text-xs underline" title="View QR">
                            QR
                          </a>
                          <button
                            onClick={() => router.push(`/guests/edit/${guest.id}`)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit Guest"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm(`Are you sure you want to delete ${guest.first_name}?`)) {
                                try {
                                  const res = await fetch(`/api/guests/${guest.id}`, { method: 'DELETE' });
                                  if (res.ok) fetchGuests();
                                  else alert('Failed to delete guest');
                                } catch (err) {
                                  alert('Error deleting guest');
                                }
                              }
                            }}
                            className="text-red-500 hover:text-red-700"
                            title="Delete Guest"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4 bg-amber-50 p-4 border-t-2 border-amber-100">
            <p className="text-amber-800 font-medium">
              Showing {guests.length} of {totalGuests} guests
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="px-4 py-2 border-2 border-amber-200 rounded-lg text-amber-900 bg-white disabled:opacity-30 hover:bg-amber-100 mr-2 transition-colors"
              >
                Previous
              </button>
              <div className="px-4 py-2 bg-white rounded-lg font-bold text-amber-900 border-2 border-amber-200 min-w-[120px] text-center">
                Page {page} of {totalPages}
              </div>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || loading}
                className="px-4 py-2 border-2 border-amber-200 rounded-lg text-amber-900 bg-white disabled:opacity-30 hover:bg-amber-100 ml-2 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
