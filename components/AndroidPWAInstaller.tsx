'use client';

import { useState, useEffect } from 'react';
import { usePWA } from '../lib/usePWA';

export default function AndroidPWAInstaller() {
  const { isAndroid, isInstalled, isStandalone, installPWA } = usePWA();
  const [showAndroidPrompt, setShowAndroidPrompt] = useState(false);
  const [installPromptEvent, setInstallPromptEvent] = useState<any>(null);

  useEffect(() => {
    if (!isAndroid || isInstalled || isStandalone) return;

    // Listener específico para Android
    const handleBeforeInstallPrompt = (e: any) => {
      console.log('🤖 Android: beforeinstallprompt detectado');
      e.preventDefault();
      setInstallPromptEvent(e);
      setShowAndroidPrompt(true);
    };

    // Listener para quando o app é instalado
    const handleAppInstalled = (e: any) => {
      console.log('🎉 Android: App instalado com sucesso');
      setShowAndroidPrompt(false);
      setInstallPromptEvent(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Forçar trigger do evento se não aparecer
    setTimeout(() => {
      if (!installPromptEvent && !isInstalled) {
        console.log('🔄 Android: Forçando detecção de instalação');
        setShowAndroidPrompt(true);
      }
    }, 3000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isAndroid, isInstalled, isStandalone]);

  const handleInstallClick = async () => {
    if (installPromptEvent) {
      try {
        console.log('🚀 Android: Executando prompt nativo');
        await installPromptEvent.prompt();
        const choiceResult = await installPromptEvent.userChoice;
        
        console.log('📊 Android: Resultado:', choiceResult.outcome);
        
        if (choiceResult.outcome === 'accepted') {
          console.log('✅ Android: Instalação aceita');
          setShowAndroidPrompt(false);
        } else {
          console.log('❌ Android: Instalação rejeitada');
          // Mostrar instruções manuais
          showManualInstructions();
        }
      } catch (error) {
        console.error('💥 Android: Erro na instalação:', error);
        showManualInstructions();
      } finally {
        setInstallPromptEvent(null);
      }
    } else {
      // Fallback para instalação manual
      showManualInstructions();
    }
  };

  const showManualInstructions = () => {
    alert(`📱 Para instalar o app no Android:

1. Toque no menu (⋮) no canto superior direito
2. Procure por "Instalar app" ou "Adicionar à tela inicial"
3. Toque em "Instalar" quando aparecer
4. Confirme a instalação

Se não aparecer a opção, vá em:
Configurações > Apps > Acesso especial > Instalar apps desconhecidas > Chrome > Permitir`);
  };

  if (!isAndroid || !showAndroidPrompt || isInstalled || isStandalone) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full">
        {/* Header */}
        <div className="p-6 text-center border-b border-gray-200">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-android-line text-3xl text-green-600"></i>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            🤖 Instalar App Android
          </h3>
          <p className="text-sm text-gray-600">
            Instale nosso app para uma experiência completa
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <i className="ri-wifi-off-line text-green-600"></i>
              </div>
              <span className="text-sm text-gray-700">Funciona offline</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <i className="ri-notification-line text-blue-600"></i>
              </div>
              <span className="text-sm text-gray-700">Notificações push</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <i className="ri-speed-line text-purple-600"></i>
              </div>
              <span className="text-sm text-gray-700">Carregamento mais rápido</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <i className="ri-home-line text-orange-600"></i>
              </div>
              <span className="text-sm text-gray-700">Ícone na tela inicial</span>
            </div>
          </div>

          {/* Botões */}
          <div className="space-y-3">
            <button
              onClick={handleInstallClick}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <i className="ri-download-line"></i>
              {installPromptEvent ? 'Instalar App Nativo' : 'Ver Instruções'}
            </button>
            
            <button
              onClick={() => setShowAndroidPrompt(false)}
              className="w-full text-gray-600 py-2 px-4 rounded-xl hover:text-gray-800 transition-colors"
            >
              Mais tarde
            </button>
          </div>

          {/* Info técnica */}
          <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500 text-center">
            <p>
              {installPromptEvent ? 
                '✅ Instalação nativa disponível' : 
                '⚠️ Usando fallback manual'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}