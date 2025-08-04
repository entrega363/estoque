'use client';

import { useState, useEffect } from 'react';
import { usePWA } from '../lib/usePWA';
import UniversalInstallGuide from './UniversalInstallGuide';

export default function InstallButton() {
  const { canInstall, isInstalled, isStandalone, installPWA, isIOS, isAndroid } = usePWA();
  const [showButton, setShowButton] = useState(false);
  const [showUniversalGuide, setShowUniversalGuide] = useState(false);

  useEffect(() => {
    // Mostrar botão se pode instalar e não está instalado
    if (!isInstalled && !isStandalone && (canInstall || isIOS || isAndroid)) {
      setShowButton(true);
    }
  }, [canInstall, isInstalled, isStandalone, isIOS, isAndroid]);

  const handleInstall = async () => {
    // Tentar instalação automática primeiro
    const result = await installPWA();
    
    if (result === true) {
      // Instalação bem-sucedida
      return;
    }
    
    // Se não funcionou automaticamente, mostrar guia universal
    setShowUniversalGuide(true);
  };

  if (!showButton) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={handleInstall}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-3 rounded-full shadow-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 flex items-center gap-2 font-semibold text-sm"
        >
          <i className="ri-download-cloud-line text-lg"></i>
          Instalar App
        </button>
      </div>

      <UniversalInstallGuide
        isOpen={showUniversalGuide}
        onClose={() => setShowUniversalGuide(false)}
      />
    </>
  );
}