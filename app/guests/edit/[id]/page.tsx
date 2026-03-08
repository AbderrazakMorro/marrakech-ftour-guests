'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EditGuestPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        verified: false,
    });

    useEffect(() => {
        const fetchGuest = async () => {
            try {
                // We can fetch via the paginated API with search or just add a GET to [id]
                // For simplicity, let's assume the PATCH route handles GET as well or we use a search param
                const response = await fetch(`/api/guests?search=${params.id}`);
                const data = await response.json();

                if (response.ok && data.guests && data.guests.length > 0) {
                    const guest = data.guests[0];
                    setFormData({
                        first_name: guest.first_name,
                        last_name: guest.last_name,
                        email: guest.email,
                        phone: guest.phone || '',
                        verified: guest.verified,
                    });
                } else {
                    alert('Guest not found');
                    router.push('/guests');
                }
            } catch (error) {
                console.error('Failed to fetch guest:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchGuest();
    }, [params.id, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const response = await fetch(`/api/guests/${params.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                router.push('/guests');
                router.refresh();
            } else {
                const data = await response.json();
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            alert('Failed to update guest');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
                <div className="text-amber-900">Loading guest details...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-6 flex items-center justify-center">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-amber-100">
                <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-6 text-white text-center">
                    <h1 className="text-2xl font-bold">Edit Guest</h1>
                    <p className="text-amber-100 text-sm">Update invitation details</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-amber-900 uppercase tracking-widest">First Name</label>
                            <input
                                type="text"
                                required
                                value={formData.first_name}
                                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                className="w-full px-4 py-2 border-2 border-amber-100 rounded-lg focus:border-amber-500 outline-none transition-colors"
                                placeholder="Jean"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-amber-900 uppercase tracking-widest">Last Name</label>
                            <input
                                type="text"
                                required
                                value={formData.last_name}
                                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                className="w-full px-4 py-2 border-2 border-amber-100 rounded-lg focus:border-amber-500 outline-none transition-colors"
                                placeholder="Dupont"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-amber-900 uppercase tracking-widest">Email Address</label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-2 border-2 border-amber-100 rounded-lg focus:border-amber-500 outline-none transition-colors"
                            placeholder="jean.dupont@email.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-amber-900 uppercase tracking-widest">Phone Number</label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-4 py-2 border-2 border-amber-100 rounded-lg focus:border-amber-500 outline-none transition-colors"
                            placeholder="+212 ..."
                        />
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                        <input
                            type="checkbox"
                            id="verified"
                            checked={formData.verified}
                            onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                            className="w-5 h-5 accent-amber-600"
                        />
                        <label htmlFor="verified" className="text-sm font-medium text-amber-900 cursor-pointer">
                            Guest Already Verified
                        </label>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="flex-1 py-3 border-2 border-amber-200 text-amber-800 font-bold rounded-xl hover:bg-amber-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl hover:shadow-lg disabled:opacity-50 transition-all"
                        >
                            {saving ? 'Updating...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
