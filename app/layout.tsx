import type { Metadata, Viewport } from "next";
import "./globals.css";
import SuperPWAInstaller from '../components/SuperPWAInstaller';
import XiaomiPWAFix from '../components/XiaomiPWAFix';
import ForcePWAInstall from '../components/ForcePWAInstall';

export const metadata: Metadata = {
  title: "Sistema de Controle de Estoque",
  description: "Sistema moderno para gerenciamento de equipamentos e controle de estoque",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Estoque Pro",
    startupImage: [
      {
        url: "/icons/icon-512x512.png",
        media: "(device-width: 768px) and (device-height: 1024px)"
      }
    ]
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Sistema de Estoque",
    title: "Sistema de Controle de Estoque",
    description: "Sistema moderno para gerenciamento de equipamentos e controle de estoque",
  },
  twitter: {
    card: "summary",
    title: "Sistema de Controle de Estoque",
    description: "Sistema moderno para gerenciamento de equipamentos e controle de estoque",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ff9500" },
    { media: "(prefers-color-scheme: dark)", color: "#ff7b00" }
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <link href="https://cdn.jsdelivr.net/npm/remixicon@4.0.0/fonts/remixicon.css" rel="stylesheet" />
        <link rel="icon" href="/icons/icon-192x192.svg" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.svg" />
        <link rel="mask-icon" href="/icons/app-icon.svg" color="#1e40af" />
        
        {/* PWA Meta Tags */}
        <meta name="application-name" content="Estoque Pro" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Estoque Pro" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#ff9500" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        {/* Preload critical resources */}
        <link rel="preload" href="/manifest.json" as="fetch" crossOrigin="anonymous" />
        <link rel="preload" href="/sw.js" as="script" />
      </head>
      <body className="antialiased">
        <XiaomiPWAFix />
        <SuperPWAInstaller />
        <ForcePWAInstall />
        {children}
      </body>
    </html>
  );
}
