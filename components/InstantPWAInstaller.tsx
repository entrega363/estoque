'use client';

import { useState, useEffect } from 'react';

export default function InstantPWAInstaller() {
  const [showInstaller, setShowInstaller] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installStatus, setInstallStatus] = useState<'idle' | 'installing' | 'success' | 'manual'>('idle');
  const [deviceInfo, setDeviceInfo] = useState<any>({});

  useEffect(() => {
    // Verificar se é mobile e não está instalado
    const isMobile = /Android|iPhone|iPad|iPod/.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone ||
                        document.referrer.includes('android-app://');

    if (isMobile && !isStandalone) {
      // Detectar dispositivo
      const ua = navigator.userAgent;
      const info = {
        isXiaomi: /Xiaomi|MIUI/.test(ua),
        isSamsung: /Samsung/.test(ua),
        isAndroid: /Android/.test(ua),
        isIOS: /iPhone|iPad|iPod/.test(ua),
        browser: getBrowser(ua)
      };
      
      setDeviceInfo(info);
      
      // Mostrar instalador após 2 segundos
      setTimeout(() => {
        setShowInstaller(true);
      }, 2000);
    }
  }, []);

  const getBrowser = (ua: string) => {
    if (/Mi Browser/.test(ua)) return 'Mi Browser';
    if (/SamsungBrowser/.test(ua)) return 'Samsung Internet';
    if (/Chrome/.test(ua) && !/Edg/.test(ua)) return 'Chrome';
    if (/Safari/.test(ua) && !/Chrome/.test(ua)) return 'Safari';
    return 'Navegador';
  };

  const getDeviceName = () => {
    if (deviceInfo.isXiaomi) return 'Xiaomi';
    if (deviceInfo.isSamsung) return 'Samsung';
    if (deviceInfo.isIOS) return 'iPhone/iPad';
    return 'Android';
  };

  const instantInstall = async () => {
    setIsInstalling(true);
    setInstallStatus('installing');

    try {
      // Limpar cache
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }

      // Registrar Service Worker
      if ('serviceWorker' in navigator) {
        await navigator.serviceWorker.register('/sw.js');
      }

      // Aguardar prompt
      let promptDetected = false;

      const promptHandler = async (e: any) => {
        e.preventDefault();
        promptDetected = true;

        try {
          await e.prompt();
          const result = await e.userChoice;

          if (result.outcome === 'accepted') {
            setInstallStatus('success');
            setTimeout(() => setShowInstaller(false), 3000);
          } else {
            setInstallStatus('manual');
          }
        } catch (error) {
          setInstallStatus('manual');
        }
      };

      window.addEventListener('beforeinstallprompt', promptHandler, { once: true });

      // Simular clique
      document.body.click();

      // Timeout
      setTimeout(() => {
        if (!promptDetected) {
          setInstallStatus('manual');
        }
      }, 3000);

    } catch (error) {
      setInstallStatus('manual');
    } finally {
      setIsInstalling(false);
    }
  };

  const getManualInstructions = () => {
    if (deviceInfo.isIOS) {
      return [
        '1. Toque no botão Compartilhar (□↗) na barra inferior',
        '2. Role para baixo e toque em "Adicionar à Tela de Início"',
        '3. Toque em "Adicionar" no canto superior direito',
        '4. O app G+E aparecerá na sua tela inicial!'
      ];
    } else if (deviceInfo.isXiaomi) {
      return [
        '1. Toque no menu (⋮) no canto superior direito',
        '2. Procure por "Instalar app" ou "Adicionar à tela inicial"',
        '3. Se não aparecer, vá em Configurações > Apps > Permissões',
        '4. Ative "Instalar apps desconhecidas" para o navegador',
        '5. Volte e confirme a instalação'
      ];
    } else if (deviceInfo.isSamsung) {
      return [
        '1. No Samsung Internet: toque no menu (⋮)',
        '2. Selecione "Adicionar página à tela inicial"',
        '3. No Chrome: procure o ícone de instalação na barra',
        '4. Ou toque no menu (⋮) > "Instalar app"',
        '5. Confirme a instalação'
      ];
    } else {
      return [
        '1. Toque no menu (⋮) no navegador',
        '2. Procure por "Instalar app" ou "Adicionar à tela inicial"',
        '3. Se só aparecer "Adicionar à tela inicial":',
        '4. Vá em Configurações > Apps > [Navegador] > Permissões',
        '5. Ative "Instalar apps desconhecidas"'
      ];
    }
  };

  if (!showInstaller) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 shadow-lg z-50 animate-slide-down">
      {installStatus === 'idle' && (
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg mb-1">📱 G+E Sistema de Estoque</h3>
            <p className="text-sm opacity-90">
              Instale o app no seu {getDeviceName()} - Um clique!
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={instantInstall}
              disabled={isInstalling}
              className="bg-white text-blue-600 px-6 py-3 rounded-full font-bold text-sm hover:bg-gray-100 transition-colors shadow-lg disabled:opacity-50"
            >
              {isInstalling ? '⏳ Instalando...' : '🚀 INSTALAR AGORA'}
            </button>
            <button
              onClick={() => setShowInstaller(false)}
              className="bg-white bg-opacity-20 text-white p-2 rounded-full hover:bg-opacity-30 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {installStatus === 'success' && (
        <div className="text-center py-2">
          <div className="text-2xl mb-2">🎉</div>
          <h3 className="font-bold text-lg mb-1">App Instalado com Sucesso!</h3>
          <p className="text-sm opacity-90">Procure o ícone G+E na sua tela inicial</p>
        </div>
      )}

      {installStatus === 'manual' && (
        <div className="max-h-80 overflow-y-auto">
          <h3 className="font-bold text-lg mb-3">
            📱 Como instalar no {getDeviceName()}:
          </h3>
          <div className="space-y-2 text-sm">
            {getManualInstructions().map((step, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {index + 1}
                </span>
                <span className="leading-relaxed">{step}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <button
              onClick={() => setShowInstaller(false)}
              className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-full text-sm hover:bg-opacity-30 transition-colors"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}