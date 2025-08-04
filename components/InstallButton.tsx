'use client';

import { useState, useEffect } from 'react';
import { usePWA } from '../lib/usePWA';

export default function InstallButton() {
  const { canInstall, isInstalled, isStandalone, installPWA, isIOS, isAndroid, getBrowserName, isChrome, isSamsung } = usePWA();
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Mostrar botão se pode instalar e não está instalado
    if (!isInstalled && !isStandalone && (canInstall || isIOS)) {
      setShowButton(true);
    }
  }, [canInstall, isInstalled, isStandalone, isIOS]);

  const handleInstall = async () => {
    const browserName = getBrowserName();
    
    if (isIOS) {
      alert(`📱 Para instalar no iPhone/iPad:

1️⃣ Toque no botão Compartilhar (ícone ⬆️)
2️⃣ Role para baixo e toque em "Adicionar à Tela de Início"
3️⃣ Toque em "Adicionar"

O app aparecerá na sua tela inicial! 🎉`);
      return;
    }

    if (isAndroid) {
      const result = await installPWA();
      
      if (result === true) {
        // Instalação bem-sucedida
        return;
      }
      
      // Mostrar instruções específicas por navegador
      let instructions = '';
      
      if (isChrome()) {
        instructions = `📱 Para instalar no Chrome Android:

1️⃣ Toque nos 3 pontos (⋮) no canto superior direito
2️⃣ Procure por "Instalar app" ou "Adicionar à tela inicial"
3️⃣ Toque em "Instalar" e confirme

💡 Dica: Também pode aparecer um banner no topo da página!`;
      } else if (isSamsung()) {
        instructions = `📱 Para instalar no Samsung Internet:

1️⃣ Toque nos 3 linhas (≡) no canto inferior direito
2️⃣ Toque em "Adicionar página a"
3️⃣ Selecione "Tela inicial"
4️⃣ Confirme a instalação

O app aparecerá como ícone na tela inicial! 🎉`;
      } else {
        instructions = `📱 Para instalar no ${browserName}:

1️⃣ Procure pelo menu do navegador (⋮ ou ≡)
2️⃣ Procure por "Instalar app", "Adicionar à tela inicial" ou similar
3️⃣ Confirme a instalação

💡 Recomendamos usar o Chrome para melhor experiência PWA!`;
      }
      
      alert(instructions);
      return;
    }

    // Desktop
    const result = await installPWA();
    if (result !== true) {
      alert(`💻 Para instalar no computador (${browserName}):

1️⃣ Procure pelo ícone ⊕ na barra de endereços
2️⃣ Ou clique nos 3 pontos (⋮) do navegador
3️⃣ Selecione "Instalar Sistema de Estoque"

O app ficará disponível como programa independente! 🎉`);
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