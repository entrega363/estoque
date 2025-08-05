// Instalador PWA Instantâneo para Celular
console.log('📱 INSTALADOR PWA INSTANTÂNEO');

// Criar botão de instalação instantânea
function createInstantInstaller() {
  // Remover instalador anterior se existir
  const existing = document.getElementById('instant-pwa-installer');
  if (existing) existing.remove();
  
  // Criar container do instalador
  const installer = document.createElement('div');
  installer.id = 'instant-pwa-installer';
  installer.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: linear-gradient(135deg, #1e40af, #3b82f6);
    color: white;
    padding: 15px;
    z-index: 9999;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    font-family: Arial, sans-serif;
    text-align: center;
  `;
  
  // Detectar dispositivo
  const ua = navigator.userAgent;
  const isXiaomi = /Xiaomi|MIUI/.test(ua);
  const isSamsung = /Samsung/.test(ua);
  const isAndroid = /Android/.test(ua);
  const isIOS = /iPhone|iPad|iPod/.test(ua);
  
  let deviceName = 'Android';
  if (isXiaomi) deviceName = 'Xiaomi';
  else if (isSamsung) deviceName = 'Samsung';
  else if (isIOS) deviceName = 'iPhone/iPad';
  
  installer.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
      <div style="flex: 1; min-width: 200px;">
        <div style="font-size: 18px; font-weight: bold; margin-bottom: 5px;">
          📱 G+E Sistema de Estoque
        </div>
        <div style="font-size: 14px; opacity: 0.9;">
          Instale o app no seu ${deviceName} - Um clique!
        </div>
      </div>
      <div style="display: flex; gap: 10px; align-items: center;">
        <button id="install-now-btn" style="
          background: #ffffff;
          color: #1e40af;
          border: none;
          padding: 12px 20px;
          border-radius: 25px;
          font-weight: bold;
          font-size: 16px;
          cursor: pointer;
          box-shadow: 0 2px 10px rgba(0,0,0,0.2);
          transition: all 0.3s ease;
        ">
          🚀 INSTALAR AGORA
        </button>
        <button id="close-installer" style="
          background: rgba(255,255,255,0.2);
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 20px;
          cursor: pointer;
          font-size: 14px;
        ">
          ✕
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(installer);
  
  // Animação de entrada
  installer.style.transform = 'translateY(-100%)';
  setTimeout(() => {
    installer.style.transition = 'transform 0.5s ease';
    installer.style.transform = 'translateY(0)';
  }, 100);
  
  return installer;
}

// Função de instalação instantânea
async function instantInstall() {
  console.log('🚀 Iniciando instalação instantânea...');
  
  const installBtn = document.getElementById('install-now-btn');
  if (installBtn) {
    installBtn.innerHTML = '⏳ Instalando...';
    installBtn.disabled = true;
  }
  
  try {
    // 1. Limpar cache rapidamente
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }
    
    // 2. Registrar Service Worker
    if ('serviceWorker' in navigator) {
      await navigator.serviceWorker.register('/sw.js');
    }
    
    // 3. Aguardar prompt de instalação
    let installPrompt = null;
    let promptDetected = false;
    
    const promptHandler = (e) => {
      console.log('🎯 Prompt detectado!');
      e.preventDefault();
      installPrompt = e;
      promptDetected = true;
      
      // Executar instalação imediatamente
      setTimeout(async () => {
        try {
          await installPrompt.prompt();
          const result = await installPrompt.userChoice;
          
          if (result.outcome === 'accepted') {
            console.log('🎉 Instalado com sucesso!');
            showSuccess();
          } else {
            console.log('❌ Instalação cancelada');
            showManualInstructions();
          }
        } catch (error) {
          console.error('💥 Erro na instalação:', error);
          showManualInstructions();
        }
      }, 500);
    };
    
    window.addEventListener('beforeinstallprompt', promptHandler, { once: true });
    
    // 4. Simular interação para ativar prompt
    document.body.click();
    
    // 5. Timeout para instruções manuais
    setTimeout(() => {
      if (!promptDetected) {
        console.log('⏰ Prompt não detectado - instruções manuais');
        showManualInstructions();
      }
    }, 3000);
    
  } catch (error) {
    console.error('❌ Erro na instalação:', error);
    showManualInstructions();
  }
}

// Mostrar sucesso
function showSuccess() {
  const installer = document.getElementById('instant-pwa-installer');
  if (installer) {
    installer.innerHTML = `
      <div style="text-align: center; padding: 10px;">
        <div style="font-size: 24px; margin-bottom: 10px;">🎉</div>
        <div style="font-size: 18px; font-weight: bold; margin-bottom: 5px;">
          App Instalado com Sucesso!
        </div>
        <div style="font-size: 14px; opacity: 0.9;">
          Procure o ícone G+E na sua tela inicial
        </div>
      </div>
    `;
    
    setTimeout(() => {
      installer.style.transform = 'translateY(-100%)';
      setTimeout(() => installer.remove(), 500);
    }, 3000);
  }
}

// Mostrar instruções manuais
function showManualInstructions() {
  const installer = document.getElementById('instant-pwa-installer');
  if (!installer) return;
  
  const ua = navigator.userAgent;
  const isXiaomi = /Xiaomi|MIUI/.test(ua);
  const isSamsung = /Samsung/.test(ua);
  const isIOS = /iPhone|iPad|iPod/.test(ua);
  
  let instructions = '';
  
  if (isIOS) {
    instructions = `
      <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">
        📱 Como instalar no iPhone/iPad:
      </div>
      <div style="font-size: 14px; line-height: 1.5; text-align: left;">
        1. Toque no botão <strong>Compartilhar (□↗)</strong> na barra inferior<br>
        2. Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong><br>
        3. Toque em <strong>"Adicionar"</strong> no canto superior direito<br>
        4. O app G+E aparecerá na sua tela inicial!
      </div>
    `;
  } else if (isXiaomi) {
    instructions = `
      <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">
        📱 Como instalar no Xiaomi:
      </div>
      <div style="font-size: 14px; line-height: 1.5; text-align: left;">
        1. Toque no <strong>menu (⋮)</strong> no canto superior direito<br>
        2. Procure por <strong>"Instalar app"</strong> ou <strong>"Adicionar à tela inicial"</strong><br>
        3. Se não aparecer, vá em: <strong>Configurações > Apps > Permissões</strong><br>
        4. Ative <strong>"Instalar apps desconhecidas"</strong> para o navegador<br>
        5. Volte e confirme a instalação
      </div>
    `;
  } else if (isSamsung) {
    instructions = `
      <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">
        📱 Como instalar no Samsung:
      </div>
      <div style="font-size: 14px; line-height: 1.5; text-align: left;">
        1. No Samsung Internet: toque no <strong>menu (⋮)</strong><br>
        2. Selecione <strong>"Adicionar página à tela inicial"</strong><br>
        3. No Chrome: procure o <strong>ícone de instalação</strong> na barra<br>
        4. Ou toque no <strong>menu (⋮) > "Instalar app"</strong><br>
        5. Confirme a instalação
      </div>
    `;
  } else {
    instructions = `
      <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">
        📱 Como instalar no Android:
      </div>
      <div style="font-size: 14px; line-height: 1.5; text-align: left;">
        1. Toque no <strong>menu (⋮)</strong> no navegador<br>
        2. Procure por <strong>"Instalar app"</strong> ou <strong>"Adicionar à tela inicial"</strong><br>
        3. Se só aparecer "Adicionar à tela inicial":<br>
        4. Vá em <strong>Configurações > Apps > [Navegador] > Permissões</strong><br>
        5. Ative <strong>"Instalar apps desconhecidas"</strong>
      </div>
    `;
  }
  
  installer.innerHTML = `
    <div style="padding: 15px; max-height: 300px; overflow-y: auto;">
      ${instructions}
      <div style="margin-top: 15px; text-align: center;">
        <button onclick="document.getElementById('instant-pwa-installer').remove()" style="
          background: rgba(255,255,255,0.2);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 20px;
          cursor: pointer;
          font-size: 14px;
        ">
          Entendi
        </button>
      </div>
    </div>
  `;
}

// Inicializar instalador
function initInstaller() {
  // Verificar se já está instalado
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                      window.navigator.standalone ||
                      document.referrer.includes('android-app://');
  
  if (isStandalone) {
    console.log('✅ App já está instalado');
    return;
  }
  
  // Verificar se é mobile
  const isMobile = /Android|iPhone|iPad|iPod/.test(navigator.userAgent);
  if (!isMobile) {
    console.log('💻 Desktop detectado - instalador não necessário');
    return;
  }
  
  // Criar instalador
  const installer = createInstantInstaller();
  
  // Adicionar eventos
  const installBtn = document.getElementById('install-now-btn');
  const closeBtn = document.getElementById('close-installer');
  
  if (installBtn) {
    installBtn.addEventListener('click', instantInstall);
  }
  
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      installer.style.transform = 'translateY(-100%)';
      setTimeout(() => installer.remove(), 500);
    });
  }
  
  console.log('📱 Instalador criado - clique em "INSTALAR AGORA"');
}

// Expor funções
window.InstantPWA = {
  init: initInstaller,
  install: instantInstall,
  create: createInstantInstaller
};

// Executar automaticamente
console.log('🚀 Iniciando instalador em 1 segundo...');
setTimeout(initInstaller, 1000);