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
        <div className="animate-slide-up">
            <div className="max-w-2xl mx-auto">
                <div className="mb-10 text-center">
                    <h1 className="text-fluid-h2 font-display font-black leading-tight">
                        Modifier l'Invité
                    </h1>
                    <p className="text-ftour-text/60 mt-2">
                        Mettez à jour les informations de l'invité ou son statut de vérification.
                    </p>
                </div>

                <div className="card">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-ftour-accentSoft/60 ml-1">Prénom</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.first_name}
                                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                    className="input-field"
                                    placeholder="Jean"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-ftour-accentSoft/60 ml-1">Nom</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.last_name}
                                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                    className="input-field"
                                    placeholder="Dupont"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-ftour-accentSoft/60 ml-1">Adresse Email</label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="input-field"
                                placeholder="jean.dupont@email.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-ftour-accentSoft/60 ml-1">Téléphone</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="input-field"
                                placeholder="+212 ..."
                            />
                        </div>

                        <div className="flex items-center gap-4 p-5 bg-ftour-accent/5 rounded-2xl border border-ftour-accent/10 transition-colors hover:bg-ftour-accent/10">
                            <div className="relative flex items-center">
                                <input
                                    type="checkbox"
                                    id="verified"
                                    checked={formData.verified}
                                    onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                                    className="h-6 w-6 rounded-lg border-2 border-ftour-accent/30 bg-transparent text-ftour-accent focus:ring-offset-0 focus:ring-0 cursor-pointer accent-ftour-accent"
                                />
                            </div>
                            <label htmlFor="verified" className="text-sm font-bold text-ftour-text cursor-pointer select-none">
                                Invité déjà vérifié (Check-in manuel)
                            </label>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-6">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="btn-outline flex-1 py-4 order-2 sm:order-1"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="btn-primary flex-1 py-4 order-1 sm:order-2"
                            >
                                {saving ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-current" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Mise à jour...
                                    </span>
                                ) : 'Enregistrer les Changements'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
