'use client';

import { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

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
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const scannerElementId = 'qr-reader';

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, []);

  const startScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
    }

    setResult(null);
    setScanning(true);

    const scanner = new Html5QrcodeScanner(
      scannerElementId,
      {
        qrbox: { width: 250, height: 250 },
        fps: 10,
        aspectRatio: 1.0,
      },
      false
    );

    scanner.render(
      async (decodedText) => {
        try {
          const response = await fetch('/api/guests/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ qrCode: decodedText }),
          });

          const data = await response.json();

          if (response.ok && data.success) {
            setResult({
              success: true,
              guest: data.guest,
            });
            scanner.clear();
            setScanning(false);
          } else {
            setResult({
              success: false,
              error: data.error || 'Verification failed',
              guest: data.guest,
            });
            scanner.clear();
            setScanning(false);
          }
        } catch (error) {
          setResult({
            success: false,
            error: 'Failed to verify guest',
          });
          scanner.clear();
          setScanning(false);
        }
      },
      (errorMessage) => {
        // Ignore scanning errors, just keep scanning
      }
    );

    scannerRef.current = scanner;
  };

  const resetScanner = () => {
    setResult(null);
    setScanning(false);
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
  };

  return (
    <div className="animate-slide-up">
      <div className="max-w-2xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-fluid-h2 font-display font-black leading-tight">
            Scanner QR
          </h1>
          <p className="text-ftour-text/60 mt-2">
            Scannez le code QR de l'invité pour valider son entrée.
          </p>
        </div>

        {!scanning && !result && (
          <div className="card flex flex-col items-center justify-center p-12 text-center group">
            <div className="h-24 w-24 rounded-3xl bg-ftour-accent/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-12 h-12 text-ftour-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <p className="text-ftour-text/70 mb-8 max-w-[200px] leading-relaxed">
              Prêt à commencer la vérification des invités.
            </p>
            <button
              onClick={startScanning}
              className="btn-primary px-10 py-4 text-base"
            >
              Lancer le Scanner
            </button>
          </div>
        )}

        {scanning && (
          <div className="card !p-2 overflow-hidden ring-4 ring-ftour-accent/20">
            <div id={scannerElementId} className="aspect-square overflow-hidden rounded-2xl bg-black"></div>
            <div className="p-4">
              <button
                onClick={resetScanner}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-2xl text-ftour-danger font-bold hover:bg-ftour-danger/10 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                Arrêter le Scanner
              </button>
            </div>
          </div>
        )}

        {result && (
          <div className="card p-8 animate-fade-in">
            {result.success && result.guest ? (
              <div className="text-center py-4">
                <div className="h-20 w-20 rounded-full bg-ftour-success/10 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-ftour-success" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                </div>
                <h2 className="text-fluid-h3 font-black text-ftour-success mb-2">
                  Invité Confirmé !
                </h2>
                <div className="bg-ftour-background/40 p-6 rounded-2xl border border-ftour-accent/10 mt-6">
                  <p className="text-xl font-display font-black text-ftour-text">
                    {result.guest.first_name} {result.guest.last_name}
                  </p>
                  <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-ftour-text/30 mt-1">ID: {result.guest.id.slice(0, 8)}</p>
                </div>
                <button
                  onClick={resetScanner}
                  className="btn-primary w-full mt-10"
                >
                  Scanner le Prochain
                </button>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="h-20 w-20 rounded-full bg-ftour-danger/10 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-ftour-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                </div>
                <h2 className="text-fluid-h3 font-black text-ftour-danger mb-2">
                  Échec de Vérification
                </h2>
                <p className="text-ftour-danger/80 text-sm font-bold bg-ftour-danger/5 py-2 px-4 rounded-full border border-ftour-danger/10 inline-block mt-4">
                  {result.error}
                </p>
                {result.guest && (
                  <div className="mt-8 pt-8 border-t border-ftour-accent/10">
                    <p className="text-ftour-text/60 text-sm">Ce code appartient à :</p>
                    <p className="font-bold text-ftour-accentSoft mt-1">
                      {result.guest.first_name} {result.guest.last_name}
                    </p>
                  </div>
                )}
                <button
                  onClick={resetScanner}
                  className="btn-outline w-full mt-10"
                >
                  Réessayer
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

