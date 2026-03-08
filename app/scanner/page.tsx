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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-amber-900 mb-8 text-center">
          QR Code Scanner
        </h1>

        {!scanning && !result && (
          <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-amber-200 text-center">
            <div className="text-6xl mb-4">📷</div>
            <p className="text-amber-900 mb-6">
              Click the button below to start scanning QR codes
            </p>
            <button
              onClick={startScanning}
              className="bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold py-3 px-8 rounded-lg hover:shadow-lg transition-all"
            >
              Start Scanner
            </button>
          </div>
        )}

        {scanning && (
          <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-amber-200">
            <div id={scannerElementId}></div>
            <button
              onClick={resetScanner}
              className="mt-4 w-full bg-red-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-600 transition-all"
            >
              Stop Scanner
            </button>
          </div>
        )}

        {result && (
          <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-amber-200">
            {result.success && result.guest ? (
              <div className="text-center">
                <div className="text-6xl mb-4">✅</div>
                <h2 className="text-3xl font-bold text-green-700 mb-4">
                  Guest Verified!
                </h2>
                <p className="text-xl text-amber-900 mb-2">
                  {result.guest.first_name} {result.guest.last_name}
                </p>
                <p className="text-amber-700">Successfully checked in</p>
                <button
                  onClick={resetScanner}
                  className="mt-6 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold py-3 px-8 rounded-lg hover:shadow-lg transition-all"
                >
                  Scan Another
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-6xl mb-4">❌</div>
                <h2 className="text-3xl font-bold text-red-700 mb-4">
                  Verification Failed
                </h2>
                <p className="text-red-600 mb-4">{result.error}</p>
                {result.guest && (
                  <p className="text-amber-700 mb-4">
                    {result.guest.first_name} {result.guest.last_name} - Already verified
                  </p>
                )}
                <button
                  onClick={resetScanner}
                  className="mt-6 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold py-3 px-8 rounded-lg hover:shadow-lg transition-all"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

