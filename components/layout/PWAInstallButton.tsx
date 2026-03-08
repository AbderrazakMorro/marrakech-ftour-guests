"use client";

import { useState, useEffect } from "react";

export default function PWAInstallButton() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isInstallable, setIsInstallable] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [showIOSHint, setShowIOSHint] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Check if it's standalone mode (installed)
        setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);

        // Check if it's iOS
        const ua = window.navigator.userAgent;
        const isIPad = !!ua.match(/iPad/i);
        const isIPhone = !!ua.match(/iPhone/i);
        setIsIOS(isIPad || isIPhone);

        const handleBeforeInstallPrompt = (e: any) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            // Update UI notify the user they can install the PWA
            setIsInstallable(true);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) {
            // Fallback for desktop/unsupported browser when prompt is not ready
            alert("Pour installer l'application sur votre ordinateur, cliquez sur le bouton d'installation dans la barre d'adresse de votre navigateur.");
            return;
        }

        // Show the install prompt
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null);
        setIsInstallable(false);
    };

    const handleIOSClick = () => {
        setShowIOSHint(!showIOSHint);
    };

    // If already installed, don't show the button
    if (isStandalone) {
        return null;
    }

    return (
        <div className="relative inline-block">
            {isIOS ? (
                <div className="flex flex-col items-end">
                    <button
                        onClick={handleIOSClick}
                        className="flex items-center gap-2 rounded-full border border-ftour-accent/40 bg-ftour-surface/50 px-4 py-2 text-sm font-medium text-ftour-accent-soft shadow-sm transition-colors hover:bg-ftour-surface"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                            />
                        </svg>
                        Installer l'app
                    </button>
                    {showIOSHint && (
                        <div className="absolute right-0 top-12 z-50 w-64 rounded-2xl bg-ftour-surface p-4 text-xs shadow-2xl border border-ftour-accent/30 animate-in fade-in slide-in-from-top-2">
                            <p className="mb-2 font-semibold text-ftour-accent-soft">
                                Pour installer l'application sur votre iPhone :
                            </p>
                            <ol className="list-decimal space-y-1.5 pl-4 text-ftour-text/90">
                                <li>Appuyez sur le bouton <strong>Partager</strong> <span className="inline-block px-1 border rounded">󰀅</span> en bas de Safari.</li>
                                <li>Faites défiler vers le bas.</li>
                                <li>Appuyez sur <strong>Sur l'écran d'accueil</strong>.</li>
                            </ol>
                        </div>
                    )}
                </div>
            ) : (
                <button
                    onClick={handleInstallClick}
                    className="flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                    </svg>
                    Installer l'app
                </button>
            )}
        </div>
    );
}
