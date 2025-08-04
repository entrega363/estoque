import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAInstallState {
  isInstallable: boolean;
  isInstalled: boolean;
  isStandalone: boolean;
  platform: string;
  canInstall: boolean;
  isIOS: boolean;
  isAndroid: boolean;
}

export const usePWA = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  // Detectar plataforma
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

  const isChrome = () => {
    const ua = getUserAgent();
    return /Chrome/.test(ua) && !/Edg/.test(ua);
  };

  const isSamsung = () => {
    const ua = getUserAgent();
    return /SamsungBrowser/.test(ua);
  };

  const isXiaomi = () => {
    const ua = getUserAgent();
    return /Xiaomi|MIUI|Mi Browser/.test(ua);
  };

  const isMIUI = () => {
    const ua = getUserAgent();
    return /MIUI/.test(ua);
  };

  const getBrowserName = () => {
    const ua = getUserAgent();
    if (/Mi Browser/.test(ua)) return 'Mi Browser';
    if (/Chrome/.test(ua) && !/Edg/.test(ua)) return 'Chrome';
    if (/SamsungBrowser/.test(ua)) return 'Samsung Internet';
    if (/Firefox/.test(ua)) return 'Firefox';
    if (/Safari/.test(ua) && !/Chrome/.test(ua)) return 'Safari';
    if (/Edg/.test(ua)) return 'Edge';
    return 'Navegador desconhecido';
  };

  const isHuawei = () => {
    const ua = getUserAgent();
    return /Huawei|Honor|EMUI|HarmonyOS/.test(ua);
  };

  const isOppo = () => {
    const ua = getUserAgent();
    return /OPPO|ColorOS/.test(ua);
  };

  const isVivo = () => {
    const ua = getUserAgent();
    return /vivo|Funtouch/.test(ua);
  };

  const isOnePlus = () => {
    const ua = getUserAgent();
    return /OnePlus|OxygenOS/.test(ua);
  };

  const isMotorola = () => {
    const ua = getUserAgent();
    return /Motorola|Moto/.test(ua);
  };

  const isLG = () => {
    const ua = getUserAgent();
    return /LG/.test(ua);
  };

  const getDeviceInfo = () => {
    const ua = getUserAgent();
    let device = 'Android';
    let os = '';
    let brand = '';
    
    // Detectar marca e sistema
    if (/Xiaomi|MIUI/.test(ua)) {
      device = 'Xiaomi';
      brand = 'Xiaomi';
      if (/MIUI/.test(ua)) {
        const miuiMatch = ua.match(/MIUI\/(\d+\.\d+)/);
        os = miuiMatch ? `MIUI ${miuiMatch[1]}` : 'MIUI';
      }
    } else if (/Samsung/.test(ua)) {
      device = 'Samsung';
      brand = 'Samsung';
      if (/One UI/.test(ua)) {
        os = 'One UI';
      }
    } else if (/Huawei|Honor/.test(ua)) {
      device = /Honor/.test(ua) ? 'Honor' : 'Huawei';
      brand = 'Huawei';
      if (/EMUI/.test(ua)) {
        const emuiMatch = ua.match(/EMUI\/(\d+\.\d+)/);
        os = emuiMatch ? `EMUI ${emuiMatch[1]}` : 'EMUI';
      } else if (/HarmonyOS/.test(ua)) {
        os = 'HarmonyOS';
      }
    } else if (/OPPO/.test(ua)) {
      device = 'OPPO';
      brand = 'OPPO';
      if (/ColorOS/.test(ua)) {
        const colorMatch = ua.match(/ColorOS\/(\d+\.\d+)/);
        os = colorMatch ? `ColorOS ${colorMatch[1]}` : 'ColorOS';
      }
    } else if (/vivo/.test(ua)) {
      device = 'Vivo';
      brand = 'Vivo';
      if (/Funtouch/.test(ua)) {
        os = 'Funtouch OS';
      }
    } else if (/OnePlus/.test(ua)) {
      device = 'OnePlus';
      brand = 'OnePlus';
      if (/OxygenOS/.test(ua)) {
        os = 'OxygenOS';
      }
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
    
    // Detectar versão do Android
    if (isAndroid() && !os) {
      const androidMatch = ua.match(/Android (\d+\.\d+)/);
      if (androidMatch) {
        os = `Android ${androidMatch[1]}`;
      }
    }
    
    return { device, os, brand };
  };

  const isMobile = () => {
    return isIOS() || isAndroid();
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
    
    // Verificar se está em modo standalone
    if (checkStandalone()) return true;
    
    // Verificar localStorage para instalação manual
    return localStorage.getItem('pwa-installed') === 'true';
  };

  // Registrar Service Worker
  const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });
        
        console.log('Service Worker registrado:', registration);
        
        // Verificar atualizações
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Nova versão disponível
                if (confirm('Nova versão disponível! Deseja atualizar?')) {
                  window.location.reload();
                }
              }
            });
          }
        });
        
        return registration;
      } catch (error) {
        console.error('Erro ao registrar Service Worker:', error);
      }
    }
  };

  // Instalar PWA
  const installPWA = async () => {
    const browserName = getBrowserName();
    console.log('🚀 Tentando instalar PWA...');
    console.log('📱 installPrompt disponível:', !!installPrompt);
    console.log('🔍 Plataforma:', isIOS() ? 'iOS' : isAndroid() ? 'Android' : 'Desktop');
    console.log('🌐 Navegador:', browserName);
    
    // Para iOS, sempre mostrar instruções específicas
    if (isIOS()) {
      console.log('📱 Mostrando instruções para iOS');
      setShowInstallPrompt(true);
      return 'ios-instructions';
    }

    // Para Android, tentar instalação automática primeiro
    if (isAndroid()) {
      if (installPrompt) {
        try {
          console.log('✅ Executando prompt de instalação Android...');
          
          // Garantir que o prompt seja nativo
          const promptResult = await installPrompt.prompt();
          console.log('📱 Prompt executado:', promptResult);
          
          const choiceResult = await installPrompt.userChoice;
          console.log('📊 Resultado da escolha:', choiceResult.outcome);
          
          if (choiceResult.outcome === 'accepted') {
            console.log('🎉 PWA instalado com sucesso no Android!');
            setIsInstalled(true);
            localStorage.setItem('pwa-installed', 'true');
            
            // Aguardar um pouco para garantir que a instalação foi processada
            setTimeout(() => {
              if (checkStandalone()) {
                console.log('✅ App agora está em modo standalone');
                setIsStandalone(true);
              }
            }, 1000);
            
            return true;
          } else {
            console.log('❌ Usuário rejeitou a instalação');
            return 'android-manual';
          }
        } catch (error) {
          console.error('💥 Erro ao instalar PWA no Android:', error);
          return 'android-manual';
        } finally {
          setInstallPrompt(null);
        }
      } else {
        console.log('❌ Nenhum installPrompt disponível no Android');
        // Tentar forçar detecção
        setTimeout(() => {
          const event = new Event('beforeinstallprompt');
          (event as any).platforms = ['android'];
          (event as any).userChoice = Promise.resolve({ outcome: 'accepted', platform: 'android' });
          (event as any).prompt = async () => {
            console.log('🚀 Prompt simulado para Android');
            return Promise.resolve();
          };
          window.dispatchEvent(event);
        }, 100);
        return 'android-manual';
      }
    }

    // Para Desktop
    if (installPrompt) {
      try {
        console.log('✅ Executando prompt de instalação Desktop...');
        await installPrompt.prompt();
        const choiceResult = await installPrompt.userChoice;
        
        console.log('📊 Resultado da escolha:', choiceResult.outcome);
        
        if (choiceResult.outcome === 'accepted') {
          console.log('🎉 PWA instalado com sucesso no Desktop!');
          setIsInstalled(true);
          localStorage.setItem('pwa-installed', 'true');
          return true;
        } else {
          console.log('❌ Usuário rejeitou a instalação');
          return 'desktop-manual';
        }
      } catch (error) {
        console.error('💥 Erro ao instalar PWA no Desktop:', error);
        return 'desktop-manual';
      } finally {
        setInstallPrompt(null);
      }
    }

    console.log('⚠️ Nenhum método de instalação disponível');
    return false;
  };

  // Verificar se pode mostrar prompt de instalação
  const shouldShowInstallPrompt = () => {
    if (isInstalled || isStandalone) return false;
    
    // Para mobile, sempre mostrar se não foi rejeitado recentemente
    if (isMobile()) {
      const lastRejected = localStorage.getItem('pwa-install-rejected');
      if (lastRejected) {
        const rejectedTime = parseInt(lastRejected);
        const daysSinceRejection = (Date.now() - rejectedTime) / (1000 * 60 * 60 * 24);
        if (daysSinceRejection < 0.1) return false; // Apenas 2.4 horas
      }
      return true; // Sempre mostrar no mobile se não foi rejeitado
    }
    
    // Para desktop, sempre mostrar se não foi rejeitado muito recentemente
    const lastRejected = localStorage.getItem('pwa-install-rejected');
    if (lastRejected) {
      const rejectedTime = parseInt(lastRejected);
      const daysSinceRejection = (Date.now() - rejectedTime) / (1000 * 60 * 60 * 24);
      if (daysSinceRejection < 0.1) return false; // Apenas 2.4 horas
    }
    
    // Sempre mostrar no desktop se não foi rejeitado muito recentemente
    return true;
  };

  // Rejeitar instalação
  const dismissInstall = () => {
    localStorage.setItem('pwa-install-rejected', Date.now().toString());
    setShowInstallPrompt(false);
  };

  // Incrementar contador de visitas
  const incrementVisitCount = () => {
    const currentCount = parseInt(localStorage.getItem('pwa-visit-count') || '0');
    localStorage.setItem('pwa-visit-count', (currentCount + 1).toString());
  };

  // Forçar verificação de instalação
  const forceInstallCheck = () => {
    console.log('🔄 Forçando verificação de instalação...');
    
    // Limpar estado anterior
    setInstallPrompt(null);
    
    // Tentar detectar novamente
    setTimeout(() => {
      const event = new Event('beforeinstallprompt');
      (event as any).platforms = ['web'];
      (event as any).userChoice = Promise.resolve({ outcome: 'accepted', platform: 'web' });
      (event as any).prompt = async () => {
        console.log('🚀 Prompt simulado executado');
        return Promise.resolve();
      };
      
      window.dispatchEvent(event);
    }, 100);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Registrar Service Worker
    registerServiceWorker();

    // Verificar estado inicial
    setIsInstalled(checkInstalled());
    setIsStandalone(checkStandalone());

    // Incrementar contador de visitas
    incrementVisitCount();

    // Listener para evento de instalação
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    // Listener para quando o app é instalado
    const handleAppInstalled = () => {
      console.log('PWA foi instalado');
      setIsInstalled(true);
      setInstallPrompt(null);
      localStorage.setItem('pwa-installed', 'true');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Verificar se deve mostrar prompt após um tempo
    setTimeout(() => {
      if (shouldShowInstallPrompt()) {
        setShowInstallPrompt(true);
      }
    }, 500); // 0.5 segundos após carregar

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const pwaState: PWAInstallState = {
    isInstallable: !!installPrompt || isIOS() || isAndroid(),
    isInstalled,
    isStandalone,
    platform: isIOS() ? 'ios' : isAndroid() ? 'android' : 'desktop',
    canInstall: !!installPrompt || isIOS() || isAndroid() || true, // Sempre true para forçar
    isIOS: isIOS(),
    isAndroid: isAndroid()
  };

  return {
    ...pwaState,
    installPWA,
    showInstallPrompt,
    setShowInstallPrompt,
    dismissInstall,
    registerServiceWorker,
    forceInstallCheck,
    getBrowserName,
    isChrome,
    isSamsung,
    isXiaomi,
    isMIUI,
    isHuawei,
    isOppo,
    isVivo,
    isOnePlus,
    isMotorola,
    isLG,
    getDeviceInfo
  };
};