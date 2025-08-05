'use client';

import { useState, useEffect } from 'react';

export default function XiaomiPWAFix() {
  const [isXiaomi, setIsXiaomi] = useState(false);
  const [showXiaomiGuide, setShowXiaomiGuide] = useState(false);
  const [installStep, setInstallStep] = useState(0);

  useEffect(() => {
    const ua = navigator.userAgent;
    const isXiaomiDevice = /Xiaomi|MIUI|Mi Browser/.test(ua);
    
    if (isXiaomiDevice) {
      setIsXiaomi(true);
      
      // Auto-mostrar guia após 3 segundos se não estiver instalado
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                          (window.navigator as any).standalone ||
                          document.referrer.includes('android-app://');
      
      if (!isStandalone && !localStorage.getItem('xiaomi-guide-shown')) {
        setTimeout(() => {
          setShowXiaomiGuide(true);
          localStorage.setItem('xiaomi-guide-shown', 'true');
        }, 3000);
      }
    }
  }, []);

  const xiaomiSteps = [
    {
      title: "🔧 Passo 1: Configurações MIUI",
      content: "Vamos configurar o MIUI para permitir instalação de PWAs",
      action: "Abrir Configurações",
      details: [
        "1. Abra as Configurações do seu Xiaomi",
        "2. Vá em 'Apps' ou 'Gerenciar apps'",
        "3. Procure pelo navegador que você está usando (Chrome/Mi Browser)"
      ]
    },
    {
      title: "🛡️ Passo 2: Permissões do Navegador", 
      content: "Ative as permissões necessárias para o navegador",
      action: "Configurar Permissões",
      details: [
        "1. Toque no navegador (Chrome/Mi Browser)",
        "2. Vá em 'Permissões' ou 'Permissions'",
        "3. Ative 'Instalar apps desconhecidas' ou 'Install unknown apps'",
        "4. Ative também 'Modificar configurações do sistema'"
      ]
    },
    {
      title: "🌐 Passo 3: Configurações do Navegador",
      content: "Configure o navegador para permitir PWAs",
      action: "Abrir Navegador",
      details: [
        "1. Abra o Chrome ou Mi Browser",
        "2. Vá no menu (⋮) > Configurações",
        "3. Procure por 'Site settings' ou 'Configurações de site'",
        "4. Ative 'Add to homescreen' ou 'Adicionar à tela inicial'"
      ]
    },
    {
      title: "📱 Passo 4: Instalar o App",
      content: "Agora vamos instalar o Sistema de Estoque",
      action: "Instalar Agora",
      details: [
        "1. Volte para esta página",
        "2. Toque no menu (⋮) do navegador",
        "3. Procure por 'Instalar app' ou 'Adicionar à tela inicial'",
        "4. Confirme a instalação"
      ]
    }
  ];

  const handleStepAction = (step: number) => {
    if (step === 0) {
      // Tentar abrir configurações
      try {
        window.open('intent://settings/#Intent;scheme=android-app;package=com.android.settings;end', '_blank');
      } catch {
        alert('Abra manualmente: Configurações > Apps > Gerenciar apps');
      }
    } else if (step === 1) {
      alert('Nas configurações do app do navegador, ative "Instalar apps desconhecidas"');
    } else if (step === 2) {
      alert('No navegador: Menu (⋮) > Configurações > Site settings');
    } else if (step === 3) {
      // Tentar forçar instalação
      window.location.reload();
    }
    
    if (step < xiaomiSteps.length - 1) {
      setInstallStep(step + 1);
    } else {
      setShowXiaomiGuide(false);
    }
  };

  const handleAutoFix = async () => {
    console.log('🔧 Iniciando correção automática para Xiaomi...');
    
    // 1. Registrar Service Worker com configurações específicas para Xiaomi
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none'
        });
        console.log('✅ Service Worker registrado para Xiaomi');
      } catch (error) {
        console.error('❌ Erro no Service Worker:', error);
      }
    }

    // 2. Tentar adicionar à tela inicial automaticamente
    const addToHomeScreen = () => {
      // Criar evento customizado para Xiaomi
      const event = new CustomEvent('beforeinstallprompt', {
        detail: { platforms: ['android'] }
      });
      
      window.dispatchEvent(event);
      
      // Mostrar instruções específicas
      setTimeout(() => {
        setShowXiaomiGuide(true);
      }, 1000);
    };

    addToHomeScreen();
  };

  if (!isXiaomi) return null;

  return (
    <>
      {/* Banner específico para Xiaomi */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-3 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <i className="ri-smartphone-line text-xl"></i>
            </div>
            <div>
              <h3 className="font-bold text-sm">📱 Xiaomi Mi 12 Detectado!</h3>
              <p className="text-xs opacity-90">Configuração especial para MIUI</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleAutoFix}
              className="bg-white text-orange-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-100 transition-colors"
            >
              Configurar Automático
            </button>
            <button
              onClick={() => setShowXiaomiGuide(true)}
              className="bg-white bg-opacity-20 text-white px-3 py-2 rounded-lg hover:bg-opacity-30 transition-colors"
            >
              Guia Manual
            </button>
          </div>
        </div>
      </div>

      {/* Modal de guia passo-a-passo */}
      {showXiaomiGuide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center text-2xl">
                    📱
                  </div>
                  <div>
                    <h3 className="font-bold text-xl">Xiaomi Mi 12</h3>
                    <p className="text-sm opacity-90">Guia de Instalação MIUI</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowXiaomiGuide(false)}
                  className="text-white hover:text-gray-200 p-2"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>
            </div>

            {/* Progress */}
            <div className="p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Progresso: {installStep + 1} de {xiaomiSteps.length}
                </span>
                <span className="text-sm text-gray-500">
                  {Math.round(((installStep + 1) / xiaomiSteps.length) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((installStep + 1) / xiaomiSteps.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="mb-6">
                <h4 className="font-bold text-lg text-gray-800 mb-2">
                  {xiaomiSteps[installStep].title}
                </h4>
                <p className="text-gray-600 mb-4">
                  {xiaomiSteps[installStep].content}
                </p>
                
                <div className="bg-blue-50 rounded-xl p-4 mb-4">
                  <h5 className="font-semibold text-blue-800 mb-2">Instruções:</h5>
                  <ul className="space-y-1">
                    {xiaomiSteps[installStep].details.map((detail, index) => (
                      <li key={index} className="text-sm text-blue-700 flex items-start gap-2">
                        <span className="w-4 h-4 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
                          {index + 1}
                        </span>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleStepAction(installStep)}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-4 rounded-xl font-semibold hover:opacity-90 transition-opacity"
                >
                  {xiaomiSteps[installStep].action}
                </button>
                
                {installStep > 0 && (
                  <button
                    onClick={() => setInstallStep(installStep - 1)}
                    className="px-4 py-3 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Voltar
                  </button>
                )}
              </div>

              {/* Skip option */}
              <div className="mt-4 text-center">
                <button
                  onClick={() => setShowXiaomiGuide(false)}
                  className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Pular guia (não recomendado)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}