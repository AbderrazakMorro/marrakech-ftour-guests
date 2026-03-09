"use client";

import { useEffect, useState, useRef, useMemo } from 'react';
import QrScanner from 'qr-scanner';

interface Guest {
  id: string;
  first_name: string;
  last_name: string;
  qr_code: string;
  verified: boolean;
}

interface VerificationResult {
  success: boolean;
  guest?: {
    id: string;
    first_name: string;
    last_name: string;
    verified: boolean;
  };
  error?: string;
}

export default function ScannerPage() {
  const [isClient, setIsClient] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  // Caching State
  const [allGuests, setAllGuests] = useState<Guest[]>([]);
  const [isCacheLoading, setIsCacheLoading] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);

  // Fast Lookup Map (Hash -> Guest)
  const guestCache = useMemo(() => {
    const map = new Map<string, Guest>();
    allGuests.forEach(g => {
      if (g.qr_code) map.set(g.qr_code, g);
    });
    return map;
  }, [allGuests]);

  // Strict Hydration Guard & Pre-fetch
  useEffect(() => {
    setIsClient(true);
    fetchGuestList();
  }, []);

  const fetchGuestList = async () => {
    try {
      setIsCacheLoading(true);
      const response = await fetch('/api/guests/all');
      if (response.ok) {
        const data = await response.json();
        setAllGuests(data.guests || []);
      }
    } catch (error) {
      console.warn('Failed to pre-fetch guests, falling back to live lookup:', error);
    } finally {
      setIsCacheLoading(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.destroy();
      }
    };
  }, []);

  const startScanning = async () => {
    if (!isClient || !videoRef.current) return;

    setResult(null);
    setCameraError(null);
    setIsInitializing(true);
    setScanning(true);

    try {
      const hasCameras = await QrScanner.hasCamera();
      if (!hasCameras) {
        throw new Error("Aucune caméra détectée.");
      }

      const cameras = await QrScanner.listCameras(true);
      setHasMultipleCameras(cameras.length > 1);

      if (scannerRef.current) {
        scannerRef.current.destroy();
      }

      // Using the main scan handler
      scannerRef.current = new QrScanner(
        videoRef.current,
        (result) => handleScan(result.data),
        {
          onDecodeError: (error) => {
            if (typeof error !== 'string' || !error.includes('No QR code found')) {
              console.debug('Scanner decode error:', error);
            }
          },
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: 'environment',
          maxScansPerSecond: 10,
        }
      );

      await scannerRef.current.start();
    } catch (err: any) {
      console.error('Scanner Start Exception:', err);
      setCameraError(err?.message || "Impossible de démarrer la caméra.");
      setScanning(false);
    } finally {
      setIsInitializing(false);
    }
  };

  const switchCamera = async () => {
    if (scannerRef.current) {
      await scannerRef.current.setCamera('next');
    }
  };

  const handleScan = async (decodedText: string) => {
    if (scannerRef.current) {
      scannerRef.current.stop();
    }
    setScanning(false);

    let hash = '';
    try {
      const payload = JSON.parse(decodedText);
      hash = payload.hash || decodedText;
    } catch {
      hash = decodedText;
    }

    // Attempt Local Cache Match
    const cachedGuest = guestCache.get(hash);

    if (cachedGuest) {
      if (cachedGuest.verified) {
        setResult({
          success: false,
          error: 'Cet invité est déjà vérifié',
          guest: { ...cachedGuest, verified: true }
        });
      } else {
        // Instant Success Display
        setResult({
          success: true,
          guest: { ...cachedGuest, verified: true }
        });

        // Async Background Sync to Database
        fetch('/api/guests/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ qrCode: decodedText }),
        }).catch(err => console.error('Background sync failed:', err));

        // Optimistically update local list for any subsequent scans
        setAllGuests(prev => prev.map(g => g.id === cachedGuest.id ? { ...g, verified: true } : g));
      }
      return;
    }

    // Fallback to Live Verification (for newly added guests not in cache)
    setVerifying(true);
    try {
      const response = await fetch('/api/guests/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCode: decodedText }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setResult({ success: true, guest: data.guest });
        // Refresh local cache to include this missing guest
        fetchGuestList();
      } else {
        setResult({ success: false, error: data.error || 'Vérification échouée', guest: data.guest });
      }
    } catch (error) {
      setResult({ success: false, error: 'Erreur réseau lors de la vérification' });
    } finally {
      setVerifying(false);
    }
  };

  const resetScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.destroy();
      scannerRef.current = null;
    }
    setResult(null);
    setScanning(false);
    setCameraError(null);
  };

  // Hydration Guard Return
  if (!isClient) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="animate-spin h-8 w-8 border-4 border-ftour-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="animate-slide-up">
      <div className="max-w-2xl mx-auto">
        <div className="mb-10 text-center relative">
          <h1 className="text-fluid-h2 font-display font-black leading-tight">
            Scanner Invitations
          </h1>
          <div className="flex items-center justify-center gap-2 mt-2">
            <p className="text-ftour-text/60">
              PWA Scanner • Mode Production v2.2 (Cached)
            </p>
            {isCacheLoading ? (
              <div className="h-4 w-4 border-2 border-ftour-accent/40 border-t-transparent rounded-full animate-spin" />
            ) : (
              <span className="flex h-2 w-2 rounded-full bg-ftour-success animate-pulse" title="Liste locale synchronisée" />
            )}
          </div>
        </div>

        {cameraError && (
          <div className="mb-8 p-6 bg-ftour-danger/5 border border-ftour-danger/20 rounded-3xl text-center animate-shake">
            <p className="text-sm font-bold text-ftour-danger mb-4">{cameraError}</p>
            <button
              onClick={() => startScanning()}
              className="px-6 py-2 rounded-xl border border-ftour-danger/20 text-ftour-danger hover:bg-ftour-danger/10 transition-all font-bold text-xs uppercase tracking-widest"
            >
              Réessayer
            </button>
          </div>
        )}

        {!scanning && !result && !verifying && (
          <div className="card flex flex-col items-center justify-center p-12 text-center group">
            <div className={`h-32 w-32 rounded-[2.5rem] bg-ftour-accent/10 flex items-center justify-center mb-10 transition-all duration-500 ${isInitializing ? 'animate-pulse scale-90' : 'group-hover:scale-105 group-hover:bg-ftour-accent/20'}`}>
              <svg className={`w-14 h-14 text-ftour-accent transition-all duration-300 ${isInitializing ? 'opacity-40' : 'opacity-100'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>

            {isInitializing ? (
              <p className="text-ftour-accent font-black tracking-widest uppercase text-xs animate-pulse">Initialisation...</p>
            ) : (
              <>
                <p className="text-ftour-text/70 mb-10 max-w-[240px] leading-relaxed font-medium text-balance">
                  Utilisez la caméra de votre smartphone pour valider les invités.
                </p>
                <div className="flex flex-col gap-4 w-full max-w-xs">
                  <button
                    onClick={() => startScanning()}
                    className="btn-primary px-12 py-5 text-base shadow-2xl shadow-ftour-accent/30"
                  >
                    Scanner une Invitation
                  </button>
                  <button
                    onClick={fetchGuestList}
                    className="text-[10px] font-black uppercase tracking-[0.2em] text-ftour-text/30 hover:text-ftour-accent transition-colors"
                  >
                    Actualiser la Liste ({allGuests.length})
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        <div className={`card !p-0 overflow-hidden ring-4 ring-ftour-accent/10 mb-8 aspect-square relative ${scanning && !verifying ? 'block' : 'hidden'}`}>
          <video
            ref={videoRef}
            className="w-full h-full object-cover rounded-[1.5rem] bg-black"
          />

          <div className="absolute inset-0 pointer-events-none z-10">
            <div className="absolute top-10 left-10 w-12 h-12 border-t-4 border-l-4 border-ftour-accent rounded-tl-xl opacity-60" />
            <div className="absolute top-10 right-10 w-12 h-12 border-t-4 border-r-4 border-ftour-accent rounded-tr-xl opacity-60" />
            <div className="absolute bottom-10 left-10 w-12 h-12 border-b-4 border-l-4 border-ftour-accent rounded-bl-xl opacity-60" />
            <div className="absolute bottom-10 right-10 w-12 h-12 border-b-4 border-r-4 border-ftour-accent rounded-br-xl opacity-60" />
            <div className="absolute top-10 left-10 right-10 h-[2px] bg-ftour-accent shadow-[0_0_15px_rgba(199,154,59,0.8)] animate-[scanLine_2.5s_ease-in-out_infinite]" />
          </div>

          {isInitializing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-30">
              <div className="relative">
                <div className="absolute inset-0 animate-ping h-8 w-8 bg-ftour-accent/50 rounded-full" />
                <div className="h-8 w-8 border-4 border-ftour-accent border-t-transparent rounded-full animate-spin relative" />
              </div>
              <p className="text-[10px] uppercase font-black tracking-[0.4em] text-ftour-accent mt-6 animate-pulse">Configuration</p>
            </div>
          )}

          {!isInitializing && hasMultipleCameras && (
            <div className="absolute bottom-6 right-6 z-40">
              <button
                onClick={switchCamera}
                className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition-all active:scale-90"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              </button>
            </div>
          )}

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40">
            <button
              onClick={resetScanner}
              className="px-6 py-3 rounded-2xl bg-ftour-danger/20 backdrop-blur-xl border border-ftour-danger/30 text-ftour-danger text-xs font-black uppercase tracking-widest hover:bg-ftour-danger/40 transition-all"
            >
              Annuler
            </button>
          </div>
        </div>

        {verifying && (
          <div className="card p-12 flex flex-col items-center justify-center text-center animate-pulse border-2 border-ftour-accent/20">
            <div className="relative mb-8">
              <div className="absolute inset-0 animate-ping h-12 w-12 bg-ftour-accent/30 rounded-full" />
              <div className="h-12 w-12 border-4 border-ftour-accent border-t-transparent rounded-full animate-spin relative" />
            </div>
            <h2 className="text-xl font-black text-ftour-accent uppercase tracking-[0.2em] mb-4">Vérification en cours</h2>
            <p className="text-ftour-text/40 text-xs font-bold uppercase tracking-widest">Consultation Live...</p>
          </div>
        )}

        {result && (
          <div className="card p-10 animate-fade-in border-2 border-ftour-accent/10">
            {result.success && result.guest ? (
              <div className="text-center">
                <div className="h-24 w-24 rounded-full bg-ftour-success/10 flex items-center justify-center mx-auto mb-8 animate-bounce-subtle">
                  <svg className="w-12 h-12 text-ftour-success" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
                </div>
                <h2 className="text-fluid-h3 font-black text-ftour-success mb-2 uppercase tracking-tight">
                  Success
                </h2>
                <div className="bg-ftour-accent/5 p-8 rounded-[2rem] border border-ftour-accent/10 mt-8 group relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-ftour-success/20" />
                  <p className="text-2xl font-display font-black text-ftour-text uppercase tracking-tight mb-2">
                    {result.guest.first_name} {result.guest.last_name}
                  </p>
                  <div className="h-1 w-12 bg-ftour-accent/30 mx-auto rounded-full group-hover:w-24 transition-all duration-500" />
                  <p className="text-[10px] uppercase font-black tracking-[0.3em] text-ftour-accent/40 mt-6">Guest Verified</p>
                </div>
                <button
                  onClick={() => startScanning()}
                  className="btn-primary w-full mt-10 shadow-xl shadow-ftour-success/20"
                >
                  Scanner le Suivant
                </button>
                <button
                  onClick={() => setResult(null)}
                  className="w-full mt-6 text-[10px] font-black uppercase tracking-[0.3em] text-ftour-text/20 hover:text-ftour-text/50 transition-colors"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div className="h-24 w-24 rounded-full bg-ftour-danger/10 flex items-center justify-center mx-auto mb-8 animate-shake">
                  <svg className="w-12 h-12 text-ftour-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M6 18L18 6M6 6l12 12" /></svg>
                </div>
                <h2 className="text-fluid-h3 font-black text-ftour-danger mb-2 uppercase tracking-tight">
                  Verification Failed
                </h2>
                <div className="p-6 bg-ftour-danger/5 rounded-2xl border border-ftour-danger/10 mt-4">
                  <p className="text-ftour-danger text-sm font-bold uppercase tracking-wide">
                    {result.error}
                  </p>
                </div>

                {result.guest && (
                  <div className="bg-ftour-danger/5 p-6 rounded-2xl border border-ftour-danger/10 mt-6 text-left">
                    <p className="text-[10px] uppercase font-black tracking-widest text-ftour-danger/60 mb-2">Guest Info</p>
                    <p className="text-lg font-black text-ftour-text uppercase">
                      {result.guest.first_name} {result.guest.last_name}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 mt-10">
                  <button
                    onClick={() => setResult(null)}
                    className="px-6 py-4 rounded-2xl border border-ftour-text/10 text-ftour-text/60 font-black text-xs uppercase tracking-widest hover:bg-ftour-text/5 transition-all"
                  >
                    Fermer
                  </button>
                  <button
                    onClick={() => startScanning()}
                    className="btn-primary py-4"
                  >
                    Réessayer
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes scanLine {
          0% { top: 10%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 90%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}
