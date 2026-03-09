"use client";

import { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

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
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameras, setCameras] = useState<{ id: string, label: string }[]>([]);
  const [currentCameraId, setCurrentCameraId] = useState<string | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerElementId = 'qr-reader';

  // Strict Hydration Guard
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialization & Cleanup
  useEffect(() => {
    if (!isClient) return;

    const initScanner = async () => {
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          const mappedDevices = devices.map(d => ({ id: d.id, label: d.label }));
          setCameras(mappedDevices);

          const backCam = mappedDevices.find(d =>
            d.label.toLowerCase().includes('back') ||
            d.label.toLowerCase().includes('rear') ||
            d.label.toLowerCase().includes('environnement')
          );

          const initialId = backCam ? backCam.id : mappedDevices[0].id;
          setCurrentCameraId(initialId);
          await startScanning(initialId);
        }
      } catch (e) {
        console.warn('Scanner auto-init suppressed:', e);
      }
    };

    initScanner();

    return () => {
      if (html5QrCodeRef.current) {
        if (html5QrCodeRef.current.isScanning) {
          html5QrCodeRef.current.stop().catch(err => console.error('Cleanup stop error:', err));
        }
      }
    };
  }, [isClient]);

  const stopScanning = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
      } catch (err) {
        console.error('Failed to stop scanner:', err);
      }
    }
  };

  const startScanning = async (cameraId?: string) => {
    if (!isClient) return;

    setResult(null);
    setCameraError(null);
    setIsInitializing(true);
    setScanning(true);

    try {
      // Ensure container is ready
      let attempts = 0;
      while (attempts < 20) {
        if (document.getElementById(scannerElementId)) break;
        await new Promise(r => setTimeout(r, 100));
        attempts++;
      }

      const targetId = cameraId || currentCameraId;

      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(scannerElementId);
      } else if (html5QrCodeRef.current.isScanning) {
        await html5QrCodeRef.current.stop();
      }

      const config = {
        fps: 20,
        qrbox: { width: 250, height: 250 }, // Use fixed box for maximum reliability initially
        aspectRatio: 1.0
      };

      if (targetId) {
        await html5QrCodeRef.current.start(
          targetId,
          config,
          (text) => handleScanSuccess(text),
          () => { }
        );
      } else {
        await html5QrCodeRef.current.start(
          { facingMode: "environment" },
          config,
          (text) => handleScanSuccess(text),
          () => { }
        );
      }
    } catch (err: any) {
      console.error('Scanner Start Exception:', err);
      setCameraError(err?.message || "Impossible de démarrer la caméra.");
      setScanning(false);
    } finally {
      setIsInitializing(false);
    }
  };

  const switchCamera = async () => {
    if (!isClient || cameras.length < 2) return;
    const currentIndex = cameras.findIndex(c => c.id === currentCameraId);
    const nextIndex = (currentIndex + 1) % cameras.length;
    const nextId = cameras[nextIndex].id;
    setCurrentCameraId(nextId);
    await startScanning(nextId);
  };

  const handleScanSuccess = async (decodedText: string) => {
    if (html5QrCodeRef.current) {
      await html5QrCodeRef.current.stop().catch(() => { });
    }
    setScanning(false);

    try {
      const response = await fetch('/api/guests/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCode: decodedText }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setResult({ success: true, guest: data.guest });
      } else {
        setResult({ success: false, error: data.error || 'Vérification échouée', guest: data.guest });
      }
    } catch (error) {
      setResult({ success: false, error: 'Erreur réseau lors de la vérification' });
    }
  };

  const resetScanner = async () => {
    if (html5QrCodeRef.current) {
      await html5QrCodeRef.current.stop().catch(() => { });
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
        <div className="mb-10 text-center">
          <h1 className="text-fluid-h2 font-display font-black leading-tight">
            Scanner Invitations
          </h1>
          <p className="text-ftour-text/60 mt-2">
            PWA Scanner • Mode Production v1.1
          </p>
        </div>

        {cameraError && (
          <div className="mb-8 p-6 bg-ftour-danger/5 border border-ftour-danger/20 rounded-3xl text-center animate-shake">
            <p className="text-sm font-bold text-ftour-danger mb-4">{cameraError}</p>
            <button
              onClick={() => startScanning()}
              className="btn-outline text-ftour-danger border-ftour-danger/20 hover:bg-ftour-danger/10"
            >
              Réessayer
            </button>
          </div>
        )}

        {!scanning && !result && (
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
                <button
                  onClick={() => startScanning()}
                  className="btn-primary px-12 py-5 text-base shadow-2xl shadow-ftour-accent/30"
                >
                  Scanner une Invitation
                </button>
              </>
            )}
          </div>
        )}

        <div className={`card !p-1 overflow-hidden ring-4 ring-ftour-accent/10 mb-8 aspect-square relative ${scanning ? 'block' : 'hidden'}`}>
          <div id={scannerElementId} className="w-full h-full overflow-hidden rounded-[1.5rem] bg-black"></div>

          {isInitializing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-30">
              <div className="relative">
                <div className="absolute inset-0 animate-ping h-8 w-8 bg-ftour-accent/50 rounded-full" />
                <div className="h-8 w-8 border-4 border-ftour-accent border-t-transparent rounded-full animate-spin relative" />
              </div>
              <p className="text-[10px] uppercase font-black tracking-[0.4em] text-ftour-accent mt-6 animate-pulse">Configuration</p>
            </div>
          )}

          {!isInitializing && cameras.length > 1 && (
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

        {result && (
          <div className="card p-10 animate-fade-in border-2 border-ftour-accent/10">
            {result.success && result.guest ? (
              <div className="text-center">
                <div className="h-24 w-24 rounded-full bg-ftour-success/10 flex items-center justify-center mx-auto mb-8 animate-bounce-subtle">
                  <svg className="w-12 h-12 text-ftour-success" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
                </div>
                <h2 className="text-fluid-h3 font-black text-ftour-success mb-2">
                  Validation Réussie
                </h2>
                <div className="bg-ftour-accent/5 p-8 rounded-[2rem] border border-ftour-accent/10 mt-8 group">
                  <p className="text-2xl font-display font-black text-ftour-text uppercase tracking-tight mb-2">
                    {result.guest.first_name} {result.guest.last_name}
                  </p>
                  <div className="h-1 w-12 bg-ftour-accent/30 mx-auto rounded-full group-hover:w-24 transition-all duration-500" />
                  <p className="text-[10px] uppercase font-black tracking-[0.3em] text-ftour-accent/40 mt-6">Accès Autorisé</p>
                </div>
                <button
                  onClick={() => startScanning()}
                  className="btn-primary w-full mt-10"
                >
                  Scanner le Suivant
                </button>
                <button
                  onClick={() => setResult(null)}
                  className="w-full mt-6 text-[10px] font-black uppercase tracking-[0.3em] text-ftour-text/20 hover:text-ftour-text/50 transition-colors"
                >
                  Quitter
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div className="h-24 w-24 rounded-full bg-ftour-danger/10 flex items-center justify-center mx-auto mb-8 animate-shake">
                  <svg className="w-12 h-12 text-ftour-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M6 18L18 6M6 6l12 12" /></svg>
                </div>
                <h2 className="text-fluid-h3 font-black text-ftour-danger mb-2">
                  Échec de Vérification
                </h2>
                <p className="text-ftour-danger text-sm font-bold bg-ftour-danger/5 py-3 px-8 rounded-2xl border border-ftour-danger/10 inline-block mt-4">
                  {result.error}
                </p>

                <div className="grid grid-cols-2 gap-4 mt-10">
                  <button onClick={() => setResult(null)} className="btn-outline">Fermer</button>
                  <button onClick={() => startScanning()} className="btn-primary">Réessayer</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

