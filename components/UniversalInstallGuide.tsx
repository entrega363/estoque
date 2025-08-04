'use client';

import { useState, useEffect } from 'react';
import { usePWA } from '../lib/usePWA';

interface UniversalInstallGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UniversalInstallGuide({ isOpen, onClose }: UniversalInstallGuideProps) {
  const { getBrowserName, getDeviceInfo, isIOS, isAndroid, isChrome, isSamsung, isXiaomi, isMIUI } = usePWA();
  const [currentStep, setCurrentStep] = useState(0);
  const [deviceType, setDeviceType] = useState('');

  useEffect(() => {
    if (isOpen) {
      const device = getDeviceInfo();
      const browser = getBrowserName();
      
      if (isIOS()) {
        setDeviceType('ios');
      } else if (isXiaomi() || isMIUI()) {
        setDeviceType('xiaomi');
      } else if (device.device === 'Samsung') {
        setDeviceType('samsung');
      } else if (isAndroid()) {
        setDeviceType('android');
      } else {
        setDeviceType('desktop');
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getInstructions = () => {
    const deviceInfo = getDeviceInfo();
    const browserName = getBrowserName();

    switch (deviceType) {
      case 'ios':
        return {
          title: `📱 iPhone/iPad - ${browserName}`,
          subtitle: 'Instalação via Safari (método oficial da Apple)',
          steps: [
            {
              title: 'Abra no Safari',
              description: 'Certifique-se de estar usando o Safari (navegador padrão)',
              icon: '🌐',
              details: [
                'Se estiver em outro navegador, copie a URL',
                'Cole no Safari e acesse o site',
                'O Safari é necessário para instalação PWA no iOS'
              ]
            },
            {
              title: 'Toque em Compartilhar',
              description: 'Toque no ícone de compartilhar na parte inferior',
              icon: '⬆️',
              details: [
                'Procure pelo ícone de seta para cima',
                'Geralmente fica na barra inferior do Safari',
                'Se não aparecer, role a página para cima'
              ]
            },
            {
              title: 'Adicionar à Tela de Início',
              description: 'Role para baixo e toque nesta opção',
              icon: '➕',
              details: [
                'Role para baixo no menu de compartilhamento',
                'Procure por "Adicionar à Tela de Início"',
                'Toque na opção'
              ]
            },
            {
              title: 'Confirmar Instalação',
              description: 'Toque em "Adicionar" no canto superior direito',
              icon: '✅',
              details: [
                'Você pode editar o nome do app se quiser',
                'Toque em "Adicionar" para confirmar',
                'O app aparecerá na sua tela inicial'
              ]
            }
          ]
        };

      case 'xiaomi':
        return {
          title: `📱 ${deviceInfo.device} - ${deviceInfo.os || 'MIUI'}`,
          subtitle: 'Instalação otimizada para dispositivos Xiaomi',
          steps: [
            {
              title: 'Use o Chrome (Recomendado)',
              description: 'Baixe o Chrome da Play Store se não tiver',
              icon: '🌐',
              details: [
                'O Mi Browser pode criar apenas atalhos',
                'Chrome garante instalação como app real',
                'Abra este site no Chrome após instalar'
              ]
            },
            {
              title: 'Menu do Chrome',
              description: 'Toque nos 3 pontos (⋮) no canto superior direito',
              icon: '⋮',
              details: [
                'Procure pelos 3 pontos verticais',
                'Fica no canto superior direito do Chrome',
                'Toque para abrir o menu'
              ]
            },
            {
              title: 'Instalar App',
              description: 'Toque em "Instalar app" ou "Adicionar à tela inicial"',
              icon: '📱',
              details: [
                'Procure por "Instalar app" no menu',
                'Ou "Adicionar à tela inicial"',
                'Toque na opção e confirme'
              ]
            },
            {
              title: 'Configurar Permissões (IMPORTANTE)',
              description: 'Configure as permissões no MIUI para funcionar corretamente',
              icon: '⚙️',
              details: [
                'Vá em Configurações > Apps > Gerenciar apps',
                'Encontre "Sistema de Estoque"',
                'Ative "Exibir sobre outros apps"',
                'Ative "Modificar configurações do sistema"',
                'Isso garante que funcione como app real!'
              ]
            }
          ]
        };

      case 'samsung':
        return {
          title: `📱 Samsung - ${browserName}`,
          subtitle: 'Instalação para dispositivos Samsung',
          steps: [
            {
              title: 'Chrome ou Samsung Internet',
              description: 'Use o Chrome ou Samsung Internet Browser',
              icon: '🌐',
              details: [
                'Ambos suportam instalação PWA',
                'Chrome é mais universal',
                'Samsung Internet também funciona bem'
              ]
            },
            {
              title: 'Menu do Navegador',
              description: 'Toque no menu do navegador',
              icon: '≡',
              details: [
                'Chrome: 3 pontos (⋮) no canto superior direito',
                'Samsung Internet: 3 linhas (≡) na parte inferior',
                'Toque para abrir o menu'
              ]
            },
            {
              title: 'Instalar/Adicionar',
              description: 'Procure pela opção de instalação',
              icon: '📱',
              details: [
                'Chrome: "Instalar app"',
                'Samsung Internet: "Adicionar página a" → "Tela inicial"',
                'Confirme a instalação'
              ]
            },
            {
              title: 'Pronto!',
              description: 'O app aparecerá na sua tela inicial',
              icon: '✅',
              details: [
                'Procure pelo ícone na tela inicial',
                'O app abrirá em tela cheia',
                'Funcionará como aplicativo nativo'
              ]
            }
          ]
        };

      case 'android':
        return {
          title: `📱 Android - ${browserName}`,
          subtitle: 'Instalação universal para Android',
          steps: [
            {
              title: 'Use o Chrome',
              description: 'Recomendamos usar o Google Chrome',
              icon: '🌐',
              details: [
                'Chrome tem melhor suporte para PWA',
                'Baixe da Play Store se não tiver',
                'Abra este site no Chrome'
              ]
            },
            {
              title: 'Procure o Banner',
              description: 'Pode aparecer um banner de instalação no topo',
              icon: '📢',
              details: [
                'Procure por um banner no topo da página',
                'Pode dizer "Instalar" ou "Adicionar à tela inicial"',
                'Se aparecer, toque nele'
              ]
            },
            {
              title: 'Menu do Chrome',
              description: 'Se não aparecer banner, use o menu',
              icon: '⋮',
              details: [
                'Toque nos 3 pontos (⋮) no canto superior direito',
                'Procure por "Instalar app"',
                'Ou "Adicionar à tela inicial"'
              ]
            },
            {
              title: 'Confirmar',
              description: 'Confirme a instalação',
              icon: '✅',
              details: [
                'Toque em "Instalar" quando aparecer',
                'O app será adicionado à tela inicial',
                'Funcionará como aplicativo real'
              ]
            }
          ]
        };

      default:
        return {
          title: `💻 Desktop - ${browserName}`,
          subtitle: 'Instalação para computador',
          steps: [
            {
              title: 'Procure o Ícone',
              description: 'Procure pelo ícone de instalação na barra de endereços',
              icon: '⊕',
              details: [
                'Procure por um ícone ⊕ ou 📱 na barra de endereços',
                'Geralmente fica do lado direito',
                'Clique nele se aparecer'
              ]
            },
            {
              title: 'Menu do Navegador',
              description: 'Se não aparecer ícone, use o menu',
              icon: '⋮',
              details: [
                'Clique nos 3 pontos (⋮) do navegador',
                'Procure por "Instalar Sistema de Estoque"',
                'Ou "Instalar aplicativo"'
              ]
            },
            {
              title: 'Confirmar Instalação',
              description: 'Confirme a instalação do aplicativo',
              icon: '✅',
              details: [
                'Clique em "Instalar" na janela que aparecer',
                'O app será instalado como programa',
                'Aparecerá no menu iniciar/aplicativos'
              ]
            },
            {
              title: 'Usar o App',
              description: 'O app funcionará como programa independente',
              icon: '🚀',
              details: [
                'Procure pelo app no menu iniciar',
                'Ou na área de trabalho',
                'Abrirá como programa independente'
              ]
            }
          ]
        };
    }
  };

  const instructions = getInstructions();
  const currentStepData = instructions.steps[currentStep];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                {instructions.title}
              </h3>
              <p className="text-sm text-gray-600">
                {instructions.subtitle}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              {instructions.steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index <= currentStep
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
                style={{ width: `${((currentStep + 1) / instructions.steps.length) * 100}%` }}
              ></div>
            </div>
            <p className="text-center text-sm text-gray-600 mt-2">
              Passo {currentStep + 1} de {instructions.steps.length}
            </p>
          </div>

          {/* Current Step */}
          <div className="mb-6">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">{currentStepData.icon}</div>
              <h4 className="text-xl font-bold text-gray-800 mb-2">
                {currentStepData.title}
              </h4>
              <p className="text-gray-600 mb-4">
                {currentStepData.description}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-semibold text-gray-800 mb-3">📋 Detalhes:</h5>
              <ul className="space-y-2">
                {currentStepData.details.map((detail, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-blue-500 font-bold">•</span>
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              ← Anterior
            </button>

            <div className="flex gap-2">
              {currentStep < instructions.steps.length - 1 ? (
                <button
                  onClick={() => setCurrentStep(Math.min(instructions.steps.length - 1, currentStep + 1))}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  Próximo →
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                >
                  Concluído ✓
                </button>
              )}
            </div>
          </div>

          {/* Quick Tips */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h5 className="font-semibold text-blue-800 mb-2">💡 Dicas Rápidas:</h5>
            <div className="text-sm text-blue-700 space-y-1">
              {deviceType === 'ios' && (
                <>
                  <p>• Use apenas o Safari para instalação no iOS</p>
                  <p>• O app aparecerá como ícone real na tela inicial</p>
                </>
              )}
              {(deviceType === 'android' || deviceType === 'xiaomi' || deviceType === 'samsung') && (
                <>
                  <p>• Chrome é o navegador mais compatível</p>
                  <p>• Procure por banners de instalação no topo da página</p>
                  <p>• O app funcionará offline após instalado</p>
                </>
              )}
              {deviceType === 'desktop' && (
                <>
                  <p>• O app funcionará como programa independente</p>
                  <p>• Não precisará abrir o navegador para usar</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}