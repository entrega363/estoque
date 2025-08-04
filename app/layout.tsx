import type { Metadata, Viewport } from "next";
import "./globals.css";
import PWAInstallPrompt from '../components/PWAInstallPrompt';

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
    { media: "(prefers-color-scheme: light)", color: "#3b82f6" },
    { media: "(prefers-color-scheme: dark)", color: "#1e40af" }
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
      </head>
      <body className="antialiased">
        {children}
        <PWAInstallPrompt />
      </body>
    </html>
  );
}
