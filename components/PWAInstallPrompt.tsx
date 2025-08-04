'use client';

import { useState, useEffect } from 'react';
import { usePWA } from '../lib/usePWA';

export default function PWAInstallPrompt() {
  const {
    canInstall,
    isInstalled,
    isStandalone,
    showInstallPrompt,
    setShowInstallPrompt,
    installPWA,
    dismissInstall,
    isIOS,
    isAndroid,
    platform
  } = usePWA();

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Mostrar prompt apenas se necessário
    if (showInstallPrompt && canInstall && !isInstalled && !isStandalone) {
      setIsVisible(true);
    }
  }, [showInstallPrompt, canInstall, isInstalled, isStandalone]);

  const handleInstall = async () => {
    await installPWA();
    setIsVisible(false);
  };

  const handleDismiss = () => {
    dismissInstall();
    setIsVisible(false);
  };

  const handleLater = () => {
    setShowInstallPrompt(false);
    setIsVisible(false);
  };

  if (!isVisible || isInstalled || isStandalone) {
    return null;
  }

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-4">
        {/* Modal */}
        <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 ease-out">
          {/* Header */}
          <div className="relative p-6 pb-4">
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <i className="ri-close-line text-xl"></i>
            </button>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                <i className="ri-smartphone-line text-white text-2xl"></i>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  Instalar App
                </h3>
                <p className="text-sm text-gray-600">
                  Sistema de Estoque
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pb-6">
            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-2">
                🚀 Acesso mais rápido e prático!
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <i className="ri-check-line text-green-500"></i>
                  Funciona offline
                </li>
                <li className="flex items-center gap-2">
                  <i className="ri-check-line text-green-500"></i>
                  Notificações em tempo real
                </li>
                <li className="flex items-center gap-2">
                  <i className="ri-check-line text-green-500"></i>
                  Interface otimizada para mobile
                </li>
                <li className="flex items-center gap-2">
                  <i className="ri-check-line text-green-500"></i>
                  Acesso direto da tela inicial
                </li>
              </ul>
            </div>

            {/* Instruções específicas por plataforma */}
            {isIOS && (
              <div className="mb-6 p-4 bg-blue-50 rounded-xl">
                <h5 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                  <i className="ri-information-line"></i>
                  Como instalar no iOS:
                </h5>
                <ol className="text-sm text-blue-700 space-y-1">
                  <li>1. Toque no botão <i className="ri-share-line"></i> (Compartilhar)</li>
                  <li>2. Role para baixo e toque em "Adicionar à Tela de Início"</li>
                  <li>3. Toque em "Adicionar" no canto superior direito</li>
                </ol>
              </div>
            )}

            {isAndroid && (
              <div className="mb-6 p-4 bg-green-50 rounded-xl">
                <h5 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                  <i className="ri-android-line"></i>
                  Instalação Android:
                </h5>
                <p className="text-sm text-green-700">
                  Toque em "Instalar" abaixo e confirme a instalação quando solicitado.
                </p>
              </div>
            )}

            {/* Botões de ação */}
            <div className="flex gap-3">
              {!isIOS && (
                <button
                  onClick={handleInstall}
                  className="flex-1 bg-blue-500 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <i className="ri-download-line"></i>
                  Instalar App
                </button>
              )}
              
              {isIOS && (
                <button
                  onClick={handleLater}
                  className="flex-1 bg-blue-500 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <i className="ri-information-line"></i>
                  Entendi
                </button>
              )}

              <button
                onClick={handleLater}
                className="px-4 py-3 text-gray-600 hover:text-gray-800 transition-colors font-medium"
              >
                Mais tarde
              </button>
            </div>

            {/* Link para não mostrar novamente */}
            <div className="mt-4 text-center">
              <button
                onClick={handleDismiss}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                Não mostrar novamente
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Banner alternativo para desktop */}
      {platform === 'desktop' && canInstall && (
        <div className="fixed bottom-4 right-4 bg-white shadow-2xl rounded-2xl p-4 max-w-sm z-40 border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <i className="ri-computer-line text-white"></i>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800 text-sm">
                Instalar Sistema de Estoque
              </h4>
              <p className="text-xs text-gray-600">
                Acesso rápido da área de trabalho
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600"
            >
              <i className="ri-close-line"></i>
            </button>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleInstall}
              className="flex-1 bg-blue-500 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
            >
              Instalar
            </button>
            <button
              onClick={handleLater}
              className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
            >
              Depois
            </button>
          </div>
        </div>
      )}
    </>
  );
}