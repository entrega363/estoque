'use client';

import { useState, useEffect } from 'react';
import { usePWA } from '../lib/usePWA';

export default function UniversalPWAInstaller() {
  const {
    canInstall,
    isInstalled,
    isStandalone,
    installPWA,
    isIOS,
    isAndroid,
    getBrowserName,
    getDeviceInfo,
    isChrome,
    isSamsung,
    isXiaomi,
    isMIUI,
    isHuawei,
    isOppo,
    isVivo,
    isOnePlus,
    isMotorola
  } = usePWA();

  const [showInstaller, setShowInstaller] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<any>({});

  useEffect(() => {
    // Sempre mostrar se não estiver instalado
    if (!isInstalled && !isStandalone) {
      setShowInstaller(true);
      setDeviceInfo(getDeviceInfo());
    }
  }, [isInstalled, isStandalone]);

  const handleInstall = async () => {
    const result = await installPWA();
    
    if (result === true) {
      // Instalação bem-sucedida
      setShowInstaller(false);
      return;
    }
    
    // Mostrar instruções específicas
    setShowInstructions(true);
  };

  const getInstallInstructions = () => {
    const browser = getBrowserName();
    const { device, brand } = deviceInfo;

    if (isIOS) {
      return {
        title: '📱 Instalar no iOS/Safari',
        steps: [
          '1. Toque no botão de compartilhar (□↗) na barra inferior',
          '2. Role para baixo e toque em "Adicionar à Tela de Início"',
          '3. Toque em "Adicionar" no canto superior direito',
          '4. O app aparecerá na sua tela inicial!'
        ],
        icon: '🍎'
      };
    }

    if (isAndroid) {
      // Instruções específicas por marca/navegador
      if (isXiaomi() || isMIUI()) {
        return {
          title: '📱 Instalar no Xiaomi/MIUI',
          steps: [
            '1. Toque no menu (⋮) no canto superior direito',
            '2. Selecione "Adicionar à tela inicial" ou "Instalar app"',
            '3. Confirme tocando em "Adicionar" ou "Instalar"',
            '4. Se não aparecer, vá em Configurações > Apps > Permissões padrão > Instalar apps desconhecidos'
          ],
          icon: '📱'
        };
      }

      if (isSamsung()) {
        return {
          title: '📱 Instalar no Samsung',
          steps: [
            '1. Toque no menu (⋮) no Samsung Internet',
            '2. Selecione "Adicionar página à" > "Tela inicial"',
            '3. Ou toque em "Instalar" se aparecer na barra de endereço',
            '4. Confirme a instalação'
          ],
          icon: '📱'
        };
      }

      if (isHuawei()) {
        return {
          title: '📱 Instalar no Huawei',
          steps: [
            '1. Toque no menu (⋮) no navegador',
            '2. Selecione "Adicionar à tela inicial"',
            '3. Se usar EMUI/HarmonyOS, pode precisar permitir "Fontes desconhecidas"',
            '4. Confirme a instalação'
          ],
          icon: '📱'
        };
      }

      if (isOppo() || isVivo() || isOnePlus()) {
        return {
          title: `📱 Instalar no ${brand}`,
          steps: [
            '1. Toque no menu (⋮) no navegador',
            '2. Procure por "Adicionar à tela inicial" ou "Instalar"',
            '3. Se não aparecer, vá em Configurações > Segurança > Instalar apps desconhecidas',
            '4. Confirme a instalação'
          ],
          icon: '📱'
        };
      }

      // Chrome genérico para Android
      if (isChrome()) {
        return {
          title: '📱 Instalar no Chrome Android',
          steps: [
            '1. Toque no menu (⋮) no canto superior direito',
            '2. Selecione "Instalar app" ou "Adicionar à tela inicial"',
            '3. Toque em "Instalar" na caixa de diálogo',
            '4. O app será adicionado à sua tela inicial'
          ],
          icon: '🌐'
        };
      }

      // Genérico para Android
      return {
        title: '📱 Instalar no Android',
        steps: [
          '1. Procure pelo ícone de "Instalar" na barra de endereço',
          '2. Ou toque no menu (⋮) e procure "Instalar app"',
          '3. Se não aparecer, toque no menu > "Adicionar à tela inicial"',
          '4. Confirme a instalação quando solicitado'
        ],
        icon: '🤖'
      };
    }

    // Desktop
    return {
      title: '💻 Instalar no Desktop',
      steps: [
        '1. Procure pelo ícone de instalação (⬇) na barra de endereço',
        '2. Ou clique no menu (⋮) > "Instalar Sistema de Estoque"',
        '3. Clique em "Instalar" na caixa de diálogo',
        '4. O app será adicionado ao seu sistema'
      ],
      icon: '💻'
    };
  };

  if (!showInstaller) {
    return null;
  }

  const instructions = getInstallInstructions();

  return (
    <>
      {/* Banner de instalação sempre visível */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <i className="ri-smartphone-line text-2xl"></i>
            </div>
            <div>
              <h3 className="font-bold text-lg">📱 Instale nosso App!</h3>
              <p className="text-sm opacity-90">
                Acesso rápido, funciona offline e receba notificações
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleInstall}
              className="bg-white text-orange-600 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors flex items-center gap-2 shadow-lg"
            >
              <i className="ri-download-line"></i>
              Instalar Agora
            </button>
            <button
              onClick={() => setShowInstructions(true)}
              className="bg-white bg-opacity-20 text-white px-4 py-3 rounded-xl hover:bg-opacity-30 transition-colors"
            >
              <i className="ri-question-line"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Botão flutuante adicional */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={handleInstall}
          className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 animate-pulse"
        >
          <i className="ri-download-cloud-line text-2xl"></i>
        </button>
      </div>

      {/* Modal de instruções */}
      {showInstructions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-2xl">
                    {instructions.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">
                      Como Instalar
                    </h3>
                    <p className="text-sm text-gray-600">
                      {getBrowserName()} • {deviceInfo.device || 'Desktop'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowInstructions(false)}
                  className="text-gray-400 hover:text-gray-600 p-2"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <h4 className="font-semibold text-gray-800 mb-4">
                {instructions.title}
              </h4>
              
              <div className="space-y-3 mb-6">
                {instructions.steps.map((step, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {step}
                    </p>
                  </div>
                ))}
              </div>

              {/* Benefícios */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h5 className="font-semibold text-gray-800 mb-3">
                  🎯 Vantagens do App:
                </h5>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <i className="ri-wifi-off-line text-green-500"></i>
                    Funciona offline
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="ri-notification-line text-blue-500"></i>
                    Notificações
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="ri-speed-line text-purple-500"></i>
                    Mais rápido
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="ri-home-line text-orange-500"></i>
                    Tela inicial
                  </div>
                </div>
              </div>

              {/* Botões */}
              <div className="flex gap-3">
                <button
                  onClick={handleInstall}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-4 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-colors"
                >
                  Tentar Instalar
                </button>
                <button
                  onClick={() => setShowInstructions(false)}
                  className="px-4 py-3 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Fechar
                </button>
              </div>

              {/* Informações técnicas */}
              <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                <p>
                  <strong>Dispositivo:</strong> {deviceInfo.device} • 
                  <strong> OS:</strong> {deviceInfo.os} • 
                  <strong> Navegador:</strong> {getBrowserName()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}