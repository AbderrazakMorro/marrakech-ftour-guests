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
  const [isInitializing, setIsInitializing] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerElementId = 'qr-reader';

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  const stopScanning = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (err) {
        console.error('Failed to stop scanner:', err);
      }
    }
  };

  const startScanning = async () => {
    setResult(null);
    setCameraError(null);
    setIsInitializing(true);

    try {
      // Initialize instance if not already done
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(scannerElementId);
      }

      await html5QrCodeRef.current.start(
        { facingMode: "environment" }, // Prefer back camera
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        async (decodedText) => {
          handleScanSuccess(decodedText);
        },
        (errorMessage) => {
          // Scanning error (no QR found in frame)
        }
      );

      setScanning(true);
    } catch (err: any) {
      console.error('Camera start error:', err);
      setCameraError(err?.message || "Impossible d'accéder à la caméra. Veuillez vérifier les permissions.");
    } finally {
      setIsInitializing(false);
    }
  };

  const handleScanSuccess = async (decodedText: string) => {
    // Stop camera immediately after successful scan
    await stopScanning();
    setScanning(false);

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
      } else {
        setResult({
          success: false,
          error: data.error || 'La vérification a échoué',
          guest: data.guest,
        });
      }
    } catch (error) {
      setResult({
        success: false,
        error: 'Erreur lors de la vérification de l\'invité',
      });
    }
  };

  const resetScanner = async () => {
    await stopScanning();
    setResult(null);
    setScanning(false);
    setCameraError(null);
  };

  return (
    <div className="animate-slide-up">
      <div className="max-w-2xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-fluid-h2 font-display font-black leading-tight">
            Scanner QR
          </h1>
          <p className="text-ftour-text/60 mt-2">
            Scannez le code QR de l'invité pour une validation instantanée.
          </p>
        </div>

        {cameraError && (
          <div className="mb-8 p-4 bg-ftour-danger/5 border border-ftour-danger/20 rounded-2xl text-center animate-shake">
            <p className="text-sm font-bold text-ftour-danger">{cameraError}</p>
            <button
              onClick={startScanning}
              className="mt-3 text-xs uppercase font-black tracking-widest text-ftour-danger/60 underline"
            >
              Réessayer l'accès à la caméra
            </button>
          </div>
        )}

        {!scanning && !result && (
          <div className="card flex flex-col items-center justify-center p-12 text-center group">
            <div className={`h-24 w-24 rounded-3xl bg-ftour-accent/10 flex items-center justify-center mb-8 transition-all duration-300 ${isInitializing ? 'animate-pulse scale-90' : 'group-hover:scale-110'}`}>
              <svg className={`w-12 h-12 text-ftour-accent transition-opacity ${isInitializing ? 'opacity-40' : 'opacity-100'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>

            {isInitializing ? (
              <p className="text-ftour-text font-bold animate-pulse">Initialisation de la caméra...</p>
            ) : (
              <>
                <p className="text-ftour-text/70 mb-8 max-w-[200px] leading-relaxed font-medium">
                  Utilisez la caméra arrière de votre téléphone pour scanner.
                </p>
                <button
                  onClick={startScanning}
                  className="btn-primary px-10 py-4 text-base shadow-lg shadow-ftour-accent/20"
                >
                  Ouvrir la Caméra
                </button>
              </>
            )}
          </div>
        )}

        <div className={`card !p-2 overflow-hidden ring-4 ring-ftour-accent/20 mb-8 ${scanning ? 'block' : 'hidden'}`}>
          <div id={scannerElementId} className="aspect-square overflow-hidden rounded-2xl bg-black"></div>
          <div className="p-4">
            <button
              onClick={resetScanner}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-2xl text-ftour-danger font-bold hover:bg-ftour-danger/5 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              Annuler
            </button>
          </div>
        </div>

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
                <div className="bg-ftour-accent/5 p-6 rounded-3xl border border-ftour-accent/10 mt-6 group">
                  <p className="text-2xl font-display font-black text-ftour-text uppercase tracking-tight">
                    {result.guest.first_name} {result.guest.last_name}
                  </p>
                  <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-ftour-accent mt-2 opacity-50">Validation Reussie</p>
                </div>
                <button
                  onClick={startScanning}
                  className="btn-primary w-full mt-10 shadow-lg shadow-ftour-accent/20"
                >
                  Continuer le Scan
                </button>
                <button
                  onClick={() => setResult(null)}
                  className="w-full mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-ftour-text/30 hover:text-ftour-text/60 transition-colors"
                >
                  Fermer
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
                <p className="text-ftour-danger text-sm font-bold bg-ftour-danger/5 py-3 px-6 rounded-2xl border border-ftour-danger/10 inline-block mt-4">
                  {result.error}
                </p>
                {result.guest && (
                  <div className="mt-8 pt-8 border-t border-ftour-accent/10">
                    <p className="text-ftour-text/40 text-[10px] uppercase font-bold tracking-widest">Identité détectée :</p>
                    <p className="font-black text-ftour-text mt-1 text-lg">
                      {result.guest.first_name} {result.guest.last_name}
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4 mt-10">
                  <button
                    onClick={() => setResult(null)}
                    className="btn-outline"
                  >
                    Retour
                  </button>
                  <button
                    onClick={startScanning}
                    className="btn-primary shadow-lg shadow-ftour-accent/20"
                  >
                    Réessayer
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
  );
}

