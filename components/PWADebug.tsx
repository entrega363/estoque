'use client';

import { useState, useEffect } from 'react';
import { usePWA } from '../lib/usePWA';

export default function PWADebug() {
  const {
    canInstall,
    isInstalled,
    isStandalone,
    showInstallPrompt,
    setShowInstallPrompt,
    installPWA,
    isIOS,
    isAndroid,
    platform,
    getBrowserName,
    forceInstallCheck
  } = usePWA();

  const [debugInfo, setDebugInfo] = useState<any>({});
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    const updateDebugInfo = () => {
      setDebugInfo({
        canInstall,
        isInstalled,
        isStandalone,
        showInstallPrompt,
        isIOS,
        isAndroid,
        platform,
        browserName: getBrowserName(),
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
        isServiceWorkerSupported: 'serviceWorker' in navigator,
        isServiceWorkerRegistered: navigator.serviceWorker?.controller !== null,
        displayMode: typeof window !== 'undefined' ? window.matchMedia('(display-mode: standalone)').matches : false,
        localStorage: {
          pwaInstalled: localStorage.getItem('pwa-installed'),
          pwaRejected: localStorage.getItem('pwa-install-rejected'),
          visitCount: localStorage.getItem('pwa-visit-count')
        }
      });
    };

    updateDebugInfo();
    const interval = setInterval(updateDebugInfo, 1000);
    return () => clearInterval(interval);
  }, [canInstall, isInstalled, isStandalone, showInstallPrompt, isIOS, isAndroid, platform]);

  const handleForceShow = () => {
    setShowInstallPrompt(true);
  };

  const handleForceInstall = async () => {
    const result = await installPWA();
    console.log('Resultado da instalação forçada:', result);
  };

  const handleClearStorage = () => {
    localStorage.removeItem('pwa-installed');
    localStorage.removeItem('pwa-install-rejected');
    localStorage.removeItem('pwa-visit-count');
    window.location.reload();
  };

  const handleForceCheck = () => {
    forceInstallCheck();
  };

  if (!showDebug) {
    return (
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={() => setShowDebug(true)}
          className="bg-red-500 text-white px-3 py-1 rounded text-xs font-mono"
        >
          PWA Debug
        </button>
      </div>
    );
  }

  return (
    <div className="fixed top-4 left-4 z-50 bg-black text-white p-4 rounded-lg max-w-md text-xs font-mono max-h-96 overflow-y-auto">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">PWA Debug Info</h3>
        <button
          onClick={() => setShowDebug(false)}
          className="text-red-400 hover:text-red-300"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2">
        <div>
          <strong>Status:</strong>
          <div className="ml-2">
            <div>canInstall: <span className={canInstall ? 'text-green-400' : 'text-red-400'}>{canInstall.toString()}</span></div>
            <div>isInstalled: <span className={debugInfo.isInstalled ? 'text-green-400' : 'text-red-400'}>{debugInfo.isInstalled?.toString()}</span></div>
            <div>isStandalone: <span className={debugInfo.isStandalone ? 'text-green-400' : 'text-red-400'}>{debugInfo.isStandalone?.toString()}</span></div>
            <div>showInstallPrompt: <span className={debugInfo.showInstallPrompt ? 'text-green-400' : 'text-red-400'}>{debugInfo.showInstallPrompt?.toString()}</span></div>
          </div>
        </div>

        <div>
          <strong>Plataforma:</strong>
          <div className="ml-2">
            <div>platform: <span className="text-blue-400">{debugInfo.platform}</span></div>
            <div>isIOS: <span className={debugInfo.isIOS ? 'text-green-400' : 'text-red-400'}>{debugInfo.isIOS?.toString()}</span></div>
            <div>isAndroid: <span className={debugInfo.isAndroid ? 'text-green-400' : 'text-red-400'}>{debugInfo.isAndroid?.toString()}</span></div>
            <div>browser: <span className="text-blue-400">{debugInfo.browserName}</span></div>
          </div>
        </div>

        <div>
          <strong>Service Worker:</strong>
          <div className="ml-2">
            <div>supported: <span className={debugInfo.isServiceWorkerSupported ? 'text-green-400' : 'text-red-400'}>{debugInfo.isServiceWorkerSupported?.toString()}</span></div>
            <div>registered: <span className={debugInfo.isServiceWorkerRegistered ? 'text-green-400' : 'text-red-400'}>{debugInfo.isServiceWorkerRegistered?.toString()}</span></div>
          </div>
        </div>

        <div>
          <strong>LocalStorage:</strong>
          <div className="ml-2">
            <div>installed: <span className="text-yellow-400">{debugInfo.localStorage?.pwaInstalled || 'null'}</span></div>
            <div>rejected: <span className="text-yellow-400">{debugInfo.localStorage?.pwaRejected || 'null'}</span></div>
            <div>visits: <span className="text-yellow-400">{debugInfo.localStorage?.visitCount || '0'}</span></div>
          </div>
        </div>

        <div>
          <strong>Display Mode:</strong>
          <div className="ml-2">
            <div>standalone: <span className={debugInfo.displayMode ? 'text-green-400' : 'text-red-400'}>{debugInfo.displayMode?.toString()}</span></div>
          </div>
        </div>

        <div className="pt-2 border-t border-gray-600">
          <strong>Ações:</strong>
          <div className="flex flex-wrap gap-1 mt-1">
            <button
              onClick={handleForceShow}
              className="bg-blue-600 px-2 py-1 rounded text-xs hover:bg-blue-700"
            >
              Forçar Prompt
            </button>
            <button
              onClick={handleForceInstall}
              className="bg-green-600 px-2 py-1 rounded text-xs hover:bg-green-700"
            >
              Forçar Install
            </button>
            <button
              onClick={handleClearStorage}
              className="bg-red-600 px-2 py-1 rounded text-xs hover:bg-red-700"
            >
              Limpar Storage
            </button>
            <button
              onClick={handleForceCheck}
              className="bg-purple-600 px-2 py-1 rounded text-xs hover:bg-purple-700"
            >
              Force Check
            </button>
          </div>
        </div>

        <div className="pt-2 border-t border-gray-600 text-xs">
          <strong>User Agent:</strong>
          <div className="text-gray-400 break-all">
            {debugInfo.userAgent?.substring(0, 100)}...
          </div>
        </div>
      </div>
    </div>
  );
}