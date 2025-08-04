'use client';

import { useState, useEffect } from 'react';
import { usePWA } from '../lib/usePWA';

export default function InstallButton() {
  const { canInstall, isInstalled, isStandalone, installPWA, isIOS, isAndroid } = usePWA();
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Mostrar botão se pode instalar e não está instalado
    if (!isInstalled && !isStandalone && (canInstall || isIOS)) {
      setShowButton(true);
    }
  }, [canInstall, isInstalled, isStandalone, isIOS]);

  const handleInstall = async () => {
    if (isIOS) {
      alert(`📱 Para instalar no iPhone/iPad:

1️⃣ Toque no botão Compartilhar (ícone ⬆️)
2️⃣ Role para baixo e toque em "Adicionar à Tela de Início"
3️⃣ Toque em "Adicionar"

O app aparecerá na sua tela inicial! 🎉`);
      return;
    }

    if (isAndroid) {
      const success = await installPWA();
      if (!success) {
        alert(`📱 Para instalar no Android:

1️⃣ Toque nos 3 pontos (⋮) no Chrome
2️⃣ Toque em "Instalar app"
3️⃣ Confirme tocando em "Instalar"

Ou procure por um banner no topo da página! 🎉`);
      }
      return;
    }

    // Desktop
    const success = await installPWA();
    if (!success) {
      alert(`💻 Para instalar no computador:

1️⃣ Procure pelo ícone ⊕ na barra de endereços
2️⃣ Ou clique nos 3 pontos (⋮) do navegador
3️⃣ Selecione "Instalar Sistema de Estoque"

O app ficará disponível como programa! 🎉`);
    }
  };

  if (!showButton) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={handleInstall}
        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-3 rounded-full shadow-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 flex items-center gap-2 font-semibold text-sm"
      >
        <i className="ri-download-cloud-line text-lg"></i>
        Instalar App
      </button>
    </div>
  );
}