import "./globals.css";
import type { ReactNode } from "react";
import Script from "next/script";
import AppShell from "@/components/layout/AppShell";
import { Inter, Outfit } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata = {
  title: "Marrakech Ftour Guests",
  description:
    "Manage event guests and invitations with a warm Marrakech Ftour-inspired experience.",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#1B0B0A",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#1B0B0A" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icon-192.png" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className={`${inter.variable} ${outfit.variable}`}>
        <AppShell>{children}</AppShell>
        <Script id="pwa-service-worker" strategy="afterInteractive">
          {`
            if (typeof window !== "undefined" && "serviceWorker" in navigator) {
              window.addEventListener("load", function () {
                navigator.serviceWorker.register("/sw.js").catch(function (err) {
                  console.error("Service worker registration failed:", err);
                });
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}


