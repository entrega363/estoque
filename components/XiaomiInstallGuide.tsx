'use client';

import { useState } from 'react';

interface XiaomiInstallGuideProps {
  isOpen: boolean;
  onClose: () => void;
  deviceInfo: { device: string; os: string };
  browserName: string;
}

export default function XiaomiInstallGuide({ isOpen, onClose, deviceInfo, browserName }: XiaomiInstallGuideProps) {
  const [currentStep, setCurrentStep] = useState(1);

  if (!isOpen) return null;

  const steps = [
    {
      title: "1. Use o Chrome (Recomendado)",
      content: (
        <div className="space-y-4">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <p className="text-yellow-800 font-semibold">⚠️ Importante para Xiaomi/MIUI</p>
            <p className="text-yellow-700 text-sm">O Mi Browser pode criar apenas atalhos. Use o Chrome para instalação real!</p>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <div>
                <p className="font-semibold">Baixe o Chrome</p>
                <p className="text-sm text-gray-600">Se não tiver, baixe da Play Store</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <div>
                <p className="font-semibold">Abra este site no Chrome</p>
                <p className="text-sm text-gray-600">Copie a URL e cole no Chrome</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <div>
                <p className="font-semibold">Toque nos 3 pontos (⋮)</p>
                <p className="text-sm text-gray-600">No canto superior direito do Chrome</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
              <div>
                <p className="font-semibold">Toque em "Instalar app"</p>
                <p className="text-sm text-gray-600">Ou "Adicionar à tela inicial"</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "2. Configurar Permissões (Crucial!)",
      content: (
        <div className="space-y-4">
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
            <p className="text-red-800 font-semibold">🚨 Passo Obrigatório para Xiaomi</p>
            <p className="text-red-700 text-sm">Sem isso, será apenas um atalho que abre o navegador!</p>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <div>
                <p className="font-semibold">Vá em Configurações</p>
                <p className="text-sm text-gray-600">Abra as Configurações do MIUI</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <div>
                <p className="font-semibold">Apps → Gerenciar apps</p>
                <p className="text-sm text-gray-600">Ou "Aplicativos" dependendo da versão</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <div>
                <p className="font-semibold">Encontre "Sistema de Estoque"</p>
                <p className="text-sm text-gray-600">Procure na lista de apps instalados</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
              <div>
                <p className="font-semibold">Ative as permissões:</p>
                <ul className="text-sm text-gray-600 ml-4 list-disc">
                  <li>"Exibir sobre outros apps"</li>
                  <li>"Modificar configurações do sistema"</li>
                  <li>"Inicialização automática" (opcional)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "3. Teste o Resultado",
      content: (
        <div className="space-y-4">
          <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
            <p className="text-green-800 font-semibold">✅ Como saber se funcionou</p>
            <p className="text-green-700 text-sm">O app deve abrir em tela cheia, sem barra do navegador!</p>
          </div>
          
          <div className="space-y-3">
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-semibold text-green-600 mb-2">✅ App Real (Correto):</h4>
              <ul className="text-sm space-y-1">
                <li>• Abre em tela cheia</li>
                <li>• Sem barra de endereços</li>
                <li>• Ícone próprio na tela inicial</li>
                <li>• Funciona offline</li>
                <li>• Aparece na lista de apps</li>
              </ul>
            </div>
            
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-semibold text-red-600 mb-2">❌ Apenas Atalho (Incorreto):</h4>
              <ul className="text-sm space-y-1">
                <li>• Abre o navegador</li>
                <li>• Mostra barra de endereços</li>
                <li>• Não funciona offline</li>
                <li>• Não aparece como app real</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-800 font-semibold">💡 Dica Final</p>
            <p className="text-blue-700 text-sm">Se ainda criar apenas atalho, tente desinstalar e reinstalar usando o Chrome, seguindo todos os passos!</p>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                📱 Guia de Instalação - {deviceInfo.device}
              </h3>
              <p className="text-sm text-gray-600">
                {deviceInfo.os} • {browserName} • Passo {currentStep} de {steps.length}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index + 1 <= currentStep
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {index + 1}
                </div>
              ))}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / steps.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Content */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-4">{steps[currentStep - 1].title}</h4>
            {steps[currentStep - 1].content}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Anterior
            </button>
            
            <div className="flex gap-2">
              {currentStep < steps.length ? (
                <button
                  onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Próximo →
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Concluído ✓
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}