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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-amber-900 mb-8 text-center">
          Import Guests from CSV
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-amber-200">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-amber-900 mb-4">
              CSV Format Requirements
            </h2>
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <p className="text-sm text-amber-800 mb-2">
                Your CSV file should have the following columns:
              </p>
              <ul className="list-disc list-inside text-sm text-amber-700 space-y-1">
                <li>first_name (required)</li>
                <li>last_name (required)</li>
                <li>email (required)</li>
                <li>phone (optional)</li>
              </ul>
            </div>
          </div>

          {success && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              <p className="font-semibold">
                Successfully imported {success.created} guest(s)!
              </p>
              {success.errors && success.errors.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-semibold">Errors:</p>
                  <ul className="list-disc list-inside text-sm">
                    {success.errors.map((err: any, idx: number) => (
                      <li key={idx}>
                        {err.email}: {err.error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label
                htmlFor="csv-file"
                className="block text-sm font-medium text-amber-900 mb-2"
              >
                Select CSV File
              </label>
              <input
                type="file"
                id="csv-file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={loading}
                className="w-full px-4 py-2 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-500 disabled:opacity-50"
              />
            </div>

            {loading && (
              <div className="text-center text-amber-700">
                Processing CSV and sending invitations...
              </div>
            )}

            <button
              onClick={() => router.push('/guests')}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold py-3 px-6 rounded-lg hover:shadow-lg transition-all"
            >
              View Guests
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

