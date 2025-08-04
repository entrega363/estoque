'use client';

import { useState, useEffect } from 'react';
import { usePWA } from '../lib/usePWA';

export default function PWAInstallBanner() {
  const { isInstalled, isStandalone, installPWA, isIOS, isAndroid } = usePWA();
  const [showBanner, setShowBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Verificar se deve mostrar o banner
    const checkShowBanner = () => {
      // Não mostrar se já está instalado ou em modo standalone
      if (isInstalled || isStandalone) return false;
      
      // Não mostrar se foi dispensado recentemente
      const lastDismissed = localStorage.getItem('pwa-banner-dismissed');
      if (lastDismissed) {
        const dismissedTime = parseInt(lastDismissed);
        const hoursSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60);
        if (hoursSinceDismissed < 24) return false; // 24 horas
      }
      
      return true;
    };

    if (checkShowBanner()) {
      // Mostrar após 3 segundos
      setTimeout(() => {
        setShowBanner(true);
      }, 3000);
    }
  }, [isInstalled, isStandalone]);

  const handleInstall = async () => {
    const result = await installPWA();
    if (result === true) {
      setShowBanner(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-banner-dismissed', Date.now().toString());
    setShowBanner(false);
    setDismissed(true);
  };

  if (!showBanner || dismissed) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg transform transition-transform duration-500 ease-out">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <i className="ri-smartphone-line text-xl"></i>
            </div>
            <div>
              <p className="font-semibold text-sm">
                📱 Instale nosso app para uma experiência melhor!
              </p>
              <p className="text-xs opacity-90">
                Acesso rápido, funciona offline e notificações
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleInstall}
              className="bg-white text-orange-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors"
            >
              Instalar
            </button>
            <button
              onClick={handleDismiss}
              className="text-white hover:text-gray-200 p-2"
            >
              <i className="ri-close-line text-lg"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}