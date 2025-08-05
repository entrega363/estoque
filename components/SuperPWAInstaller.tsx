'use client';

import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function SuperPWAInstaller() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<any>({});

  // Detectar plataforma e dispositivo
  const getUserAgent = () => {
    if (typeof window === 'undefined') return '';
    return window.navigator.userAgent;
  };

  const isIOS = () => {
    const ua = getUserAgent();
    return /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
  };

  const isAndroid = () => {
    const ua = getUserAgent();
    return /Android/.test(ua);
  };

  const isMobile = () => isIOS() || isAndroid();

  const getBrowserName = () => {
    const ua = getUserAgent();
    if (/Mi Browser/.test(ua)) return 'Mi Browser';
    if (/SamsungBrowser/.test(ua)) return 'Samsung Internet';
    if (/Chrome/.test(ua) && !/Edg/.test(ua)) return 'Chrome';
    if (/Firefox/.test(ua)) return 'Firefox';
    if (/Safari/.test(ua) && !/Chrome/.test(ua)) return 'Safari';
    if (/Edg/.test(ua)) return 'Edge';
    return 'Navegador';
  };

  const getDeviceInfo = () => {
    const ua = getUserAgent();
    let device = 'Android';
    let brand = '';
    
    if (/Xiaomi|MIUI/.test(ua)) {
      device = 'Xiaomi';
      brand = 'Xiaomi';
    } else if (/Samsung/.test(ua)) {
      device = 'Samsung';
      brand = 'Samsung';
    } else if (/Huawei|Honor/.test(ua)) {
      device = /Honor/.test(ua) ? 'Honor' : 'Huawei';
      brand = 'Huawei';
    } else if (/OPPO/.test(ua)) {
      device = 'OPPO';
      brand = 'OPPO';
    } else if (/vivo/.test(ua)) {
      device = 'Vivo';
      brand = 'Vivo';
    } else if (/OnePlus/.test(ua)) {
      device = 'OnePlus';
      brand = 'OnePlus';
    } else if (/Motorola|Moto/.test(ua)) {
      device = 'Motorola';
      brand = 'Motorola';
    } else if (/LG/.test(ua)) {
      device = 'LG';
      brand = 'LG';
    } else if (/Sony/.test(ua)) {
      device = 'Sony';
      brand = 'Sony';
    } else if (/Nokia/.test(ua)) {
      device = 'Nokia';
      brand = 'Nokia';
    } else if (/Realme/.test(ua)) {
      device = 'Realme';
      brand = 'Realme';
    }
    
    return { device, brand, browser: getBrowserName() };
  };

  // Verificar se está em modo standalone
  const checkStandalone = () => {
    if (typeof window === 'undefined') return false;
    
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes('android-app://')
    );
  };

  // Verificar se já está instalado
  const checkInstalled = () => {
    if (typeof window === 'undefined') return false;
    
    if (checkStandalone()) return true;
    return localStorage.getItem('pwa-installed') === 'true';
  };

  // Instalar PWA
  const installPWA = async () => {
    console.log('🚀 Tentando instalar PWA...');
    
    // Para iOS, sempre mostrar instruções
    if (isIOS()) {
      setShowInstructions(true);
      return 'ios-instructions';
    }

    // Para Android e Desktop, tentar instalação automática
    if (installPrompt) {
      try {
        await installPrompt.prompt();
        const choiceResult = await installPrompt.userChoice;
        
        if (choiceResult.outcome === 'accepted') {
          setIsInstalled(true);
          localStorage.setItem('pwa-installed', 'true');
          setShowBanner(false);
          return true;
        } else {
          setShowInstructions(true);
          return 'manual-instructions';
        }
      } catch (error) {
        console.error('Erro ao instalar PWA:', error);
        setShowInstructions(true);
        return 'manual-instructions';
      } finally {
        setInstallPrompt(null);
      }
    } else {
      // Sem prompt nativo, mostrar instruções
      setShowInstructions(true);
      return 'manual-instructions';
    }
  };

  // Obter instruções específicas por dispositivo
  const getInstallInstructions = () => {
    const { device, brand, browser } = deviceInfo;

    if (isIOS()) {
      return {
        title: '📱 Instalar no iPhone/iPad',
        steps: [
          '1. Toque no botão de compartilhar (□↗) na barra inferior do Safari',
          '2. Role para baixo e toque em "Adicionar à Tela de Início"',
          '3. Toque em "Adicionar" no canto superior direito',
          '4. O app aparecerá na sua tela inicial com o ícone laranja!'
        ],
        icon: '🍎',
        color: 'from-blue-500 to-blue-600'
      };
    }

    if (isAndroid()) {
      // Instruções específicas por marca
      if (device === 'Xiaomi') {
        return {
          title: '📱 Instalar no Xiaomi/MIUI',
          steps: [
            '1. Toque no menu (⋮) no canto superior direito',
            '2. Procure por "Adicionar à tela inicial" ou "Instalar app"',
            '3. Se não aparecer, vá em Configurações > Apps > Gerenciar apps > Permissões',
            '4. Ative "Instalar apps desconhecidas" para o navegador',
            '5. Volte e tente novamente - confirme a instalação'
          ],
          icon: '📱',
          color: 'from-orange-500 to-red-500'
        };
      }

      if (device === 'Samsung') {
        return {
          title: '📱 Instalar no Samsung',
          steps: [
            '1. No Samsung Internet: toque no menu (⋮)',
            '2. Selecione "Adicionar página à" > "Tela inicial"',
            '3. No Chrome: procure o ícone de instalação na barra de endereço',
            '4. Ou toque no menu (⋮) > "Instalar app"',
            '5. Confirme tocando em "Adicionar" ou "Instalar"'
          ],
          icon: '📱',
          color: 'from-blue-500 to-purple-500'
        };
      }

      if (device === 'Huawei' || device === 'Honor') {
        return {
          title: `📱 Instalar no ${device}`,
          steps: [
            '1. Toque no menu (⋮) no navegador',
            '2. Selecione "Adicionar à tela inicial"',
            '3. Se usar EMUI/HarmonyOS, vá em Configurações > Segurança',
            '4. Ative "Fontes desconhecidas" ou "Instalar apps desconhecidas"',
            '5. Volte e confirme a instalação'
          ],
          icon: '📱',
          color: 'from-red-500 to-pink-500'
        };
      }

      if (['OPPO', 'Vivo', 'OnePlus', 'Realme'].includes(device)) {
        return {
          title: `📱 Instalar no ${device}`,
          steps: [
            '1. Toque no menu (⋮) no navegador',
            '2. Procure por "Adicionar à tela inicial" ou "Instalar"',
            '3. Se não aparecer, vá em Configurações > Segurança e Privacidade',
            '4. Ative "Instalar apps de fontes desconhecidas"',
            '5. Volte ao navegador e confirme a instalação'
          ],
          icon: '📱',
          color: 'from-green-500 to-teal-500'
        };
      }

      // Chrome genérico para Android
      if (browser === 'Chrome') {
        return {
          title: '📱 Instalar no Chrome Android',
          steps: [
            '1. Procure pelo ícone de instalação (⬇) na barra de endereço',
            '2. Ou toque no menu (⋮) no canto superior direito',
            '3. Selecione "Instalar app" ou "Adicionar à tela inicial"',
            '4. Toque em "Instalar" na caixa de diálogo',
            '5. O app será adicionado à sua tela inicial'
          ],
          icon: '🌐',
          color: 'from-blue-500 to-green-500'
        };
      }

      // Genérico para Android
      return {
        title: '📱 Instalar no Android',
        steps: [
          '1. Procure pelo ícone de "Instalar" (⬇) na barra de endereço',
          '2. Ou toque no menu (⋮) e procure "Instalar app"',
          '3. Se não aparecer, toque em "Adicionar à tela inicial"',
          '4. Nas configurações do Android, permita "Fontes desconhecidas"',
          '5. Confirme a instalação quando solicitado'
        ],
        icon: '🤖',
        color: 'from-green-500 to-blue-500'
      };
    }

    // Desktop
    return {
      title: '💻 Instalar no Desktop',
      steps: [
        '1. Procure pelo ícone de instalação (⬇) na barra de endereço',
        '2. Ou clique no menu (⋮) > "Instalar Sistema de Estoque"',
        '3. Clique em "Instalar" na caixa de diálogo',
        '4. O app será adicionado ao seu sistema operacional',
        '5. Acesse pelo menu iniciar ou área de trabalho'
      ],
      icon: '💻',
      color: 'from-purple-500 to-indigo-500'
    };
  };

  // Verificar se deve mostrar o banner
  const shouldShowBanner = () => {
    if (isInstalled || isStandalone) return false;
    
    const dismissed = localStorage.getItem('pwa-banner-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const hoursSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60);
      if (hoursSinceDismissed < 2) return false; // Não mostrar por 2 horas
    }
    
    return true;
  };

  // Dispensar banner
  const dismissBanner = () => {
    localStorage.setItem('pwa-banner-dismissed', Date.now().toString());
    setShowBanner(false);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Verificar estado inicial
    setIsInstalled(checkInstalled());
    setIsStandalone(checkStandalone());
    setDeviceInfo(getDeviceInfo());

    // Registrar Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then(registration => console.log('SW registrado:', registration))
        .catch(error => console.error('Erro SW:', error));
    }

    // Listener para evento de instalação
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    // Listener para quando o app é instalado
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
      localStorage.setItem('pwa-installed', 'true');
      setShowBanner(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Mostrar banner após um tempo
    setTimeout(() => {
      if (shouldShowBanner()) {
        setShowBanner(true);
      }
    }, 2000); // 2 segundos após carregar

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  if (isInstalled || isStandalone) {
    return null;
  }

  const instructions = getInstallInstructions();

  return (
    <>
      {/* Banner principal sempre visível */}
      {showBanner && (
        <div className={`bg-gradient-to-r ${instructions.color} text-white shadow-lg sticky top-0 z-40`}>
          <div className="max-w-6xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <i className="ri-smartphone-line text-xl"></i>
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base">
                    📱 Instale nosso App!
                  </h3>
                  <p className="text-xs sm:text-sm opacity-90">
                    Acesso rápido, funciona offline e receba notificações
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={installPWA}
                  className="bg-white text-gray-800 px-4 py-2 rounded-lg font-bold hover:bg-gray-100 transition-colors flex items-center gap-2 text-sm shadow-lg"
                >
                  <i className="ri-download-line"></i>
                  Instalar
                </button>
                <button
                  onClick={() => setShowInstructions(true)}
                  className="bg-white bg-opacity-20 text-white p-2 rounded-lg hover:bg-opacity-30 transition-colors"
                  title="Como instalar"
                >
                  <i className="ri-question-line"></i>
                </button>
                <button
                  onClick={dismissBanner}
                  className="bg-white bg-opacity-20 text-white p-2 rounded-lg hover:bg-opacity-30 transition-colors"
                  title="Fechar"
                >
                  <i className="ri-close-line"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Botão flutuante */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={installPWA}
          className={`bg-gradient-to-r ${instructions.color} text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 animate-bounce`}
          title="Instalar App"
        >
          <i className="ri-download-cloud-line text-2xl"></i>
        </button>
      </div>

      {/* Modal de instruções */}
      {showInstructions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className={`p-6 bg-gradient-to-r ${instructions.color} text-white rounded-t-2xl`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center text-2xl">
                    {instructions.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-xl">
                      Como Instalar
                    </h3>
                    <p className="text-sm opacity-90">
                      {deviceInfo.browser} • {deviceInfo.device || 'Desktop'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowInstructions(false)}
                  className="text-white hover:text-gray-200 p-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <h4 className="font-semibold text-gray-800 mb-4 text-lg">
                {instructions.title}
              </h4>
              
              <div className="space-y-4 mb-6">
                {instructions.steps.map((step, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`w-8 h-8 bg-gradient-to-r ${instructions.color} text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0`}>
                      {index + 1}
                    </div>
                    <p className="text-gray-700 leading-relaxed pt-1">
                      {step}
                    </p>
                  </div>
                ))}
              </div>

              {/* Benefícios */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <i className="ri-star-line text-yellow-500"></i>
                  Vantagens do App:
                </h5>
                <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <i className="ri-wifi-off-line text-green-500"></i>
                    Funciona offline
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="ri-notification-line text-blue-500"></i>
                    Notificações push
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="ri-speed-line text-purple-500"></i>
                    Carregamento rápido
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="ri-home-line text-orange-500"></i>
                    Ícone na tela inicial
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="ri-fullscreen-line text-indigo-500"></i>
                    Tela cheia
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="ri-save-line text-red-500"></i>
                    Economiza dados
                  </div>
                </div>
              </div>

              {/* Botões */}
              <div className="flex gap-3">
                <button
                  onClick={installPWA}
                  className={`flex-1 bg-gradient-to-r ${instructions.color} text-white py-3 px-4 rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2`}
                >
                  <i className="ri-download-line"></i>
                  Tentar Instalar
                </button>
                <button
                  onClick={() => setShowInstructions(false)}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors font-medium"
                >
                  Fechar
                </button>
              </div>

              {/* Informações técnicas */}
              <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500 text-center">
                <p>
                  <strong>Dispositivo:</strong> {deviceInfo.device} • 
                  <strong> Navegador:</strong> {deviceInfo.browser}
                </p>
                <p className="mt-1">
                  Sistema de Controle de Estoque v2.0 • PWA Habilitado
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}