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
    console.log('🚀 Tentando instalar PWA...');
    console.log('📱 installPrompt disponível:', !!installPrompt);
    console.log('🔍 Plataforma:', isIOS() ? 'iOS' : isAndroid() ? 'Android' : 'Desktop');
    
    if (!installPrompt) {
      console.log('❌ Nenhum installPrompt disponível');
      
      // Para iOS, sempre mostrar instruções
      if (isIOS()) {
        console.log('📱 Mostrando instruções para iOS');
        setShowInstallPrompt(true);
        return false;
      }
      
      // Para Android/Desktop sem prompt, tentar forçar
      if (isAndroid() || !isMobile()) {
        console.log('🔄 Tentando forçar detecção de instalação...');
        
        // Tentar disparar o evento manualmente
        const event = new Event('beforeinstallprompt');
        window.dispatchEvent(event);
        
        // Aguardar um pouco e tentar novamente
        setTimeout(() => {
          if (!installPrompt) {
            console.log('⚠️ Não foi possível detectar suporte à instalação');
            setShowInstallPrompt(true);
          }
        }, 500);
        
        return false;
      }
      
      return false;
    }

    try {
      console.log('✅ Executando prompt de instalação...');
      await installPrompt.prompt();
      const choiceResult = await installPrompt.userChoice;
      
      console.log('📊 Resultado da escolha:', choiceResult.outcome);
      
      if (choiceResult.outcome === 'accepted') {
        console.log('🎉 PWA instalado com sucesso!');
        setIsInstalled(true);
        localStorage.setItem('pwa-installed', 'true');
        return true;
      } else {
        console.log('❌ Usuário rejeitou a instalação');
        return false;
      }
      
    } catch (error) {
      console.error('💥 Erro ao instalar PWA:', error);
      
      // Fallback: mostrar instruções manuais
      setShowInstallPrompt(true);
      return false;
    } finally {
      setInstallPrompt(null);
    }
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
        if (daysSinceRejection < 3) return false; // Reduzido para 3 dias
      }
      return true; // Sempre mostrar no mobile se não foi rejeitado
    }
    
    // Para desktop, verificar se tem installPrompt
    if (!installPrompt) return false;
    
    // Não mostrar se já foi rejeitado recentemente
    const lastRejected = localStorage.getItem('pwa-install-rejected');
    if (lastRejected) {
      const rejectedTime = parseInt(lastRejected);
      const daysSinceRejection = (Date.now() - rejectedTime) / (1000 * 60 * 60 * 24);
      if (daysSinceRejection < 7) return false;
    }
    
    // Mostrar após primeira visita no desktop
    const visitCount = parseInt(localStorage.getItem('pwa-visit-count') || '0');
    return visitCount >= 1;
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
    }, 2000); // 2 segundos após carregar

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const pwaState: PWAInstallState = {
    isInstallable: !!installPrompt || isIOS(),
    isInstalled,
    isStandalone,
    platform: isIOS() ? 'ios' : isAndroid() ? 'android' : 'desktop',
    canInstall: !!installPrompt || (isIOS() && !isStandalone),
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
    forceInstallCheck
  };
};