// Script para diagnosticar e corrigir problemas de instalação PWA
console.log('🔧 Diagnóstico PWA - Sistema de Estoque');

// Função para verificar critérios PWA
async function checkPWACriteria() {
  console.log('\n📋 Verificando critérios PWA...');
  
  const criteria = {
    https: location.protocol === 'https:' || location.hostname === 'localhost',
    manifest: false,
    serviceWorker: 'serviceWorker' in navigator,
    icons: false,
    startUrl: false,
    display: false,
    installable: false
  };

  // Verificar manifest
  try {
    const manifestResponse = await fetch('/manifest.json');
    const manifest = await manifestResponse.json();
    
    criteria.manifest = true;
    criteria.icons = manifest.icons && manifest.icons.length >= 2;
    criteria.startUrl = !!manifest.start_url;
    criteria.display = manifest.display === 'standalone';
    
    console.log('✅ Manifest carregado:', {
      name: manifest.name,
      shortName: manifest.short_name,
      display: manifest.display,
      startUrl: manifest.start_url,
      icons: manifest.icons?.length || 0
    });
  } catch (error) {
    console.error('❌ Erro ao carregar manifest:', error);
  }

  // Verificar Service Worker
  if (criteria.serviceWorker) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      console.log('✅ Service Workers:', registrations.length);
      
      registrations.forEach((reg, index) => {
        console.log(`   ${index + 1}. Scope: ${reg.scope}`);
        console.log(`      Estado: ${reg.active ? 'Ativo' : 'Inativo'}`);
      });
    } catch (error) {
      console.error('❌ Erro ao verificar SW:', error);
    }
  }

  // Verificar se é instalável
  let installPromptAvailable = false;
  
  const checkInstallPrompt = new Promise((resolve) => {
    const timeout = setTimeout(() => resolve(false), 2000);
    
    window.addEventListener('beforeinstallprompt', (e) => {
      clearTimeout(timeout);
      installPromptAvailable = true;
      resolve(true);
    }, { once: true });
  });

  criteria.installable = await checkInstallPrompt;

  // Mostrar resultados
  console.log('\n📊 Resultados dos critérios PWA:');
  Object.entries(criteria).forEach(([key, value]) => {
    console.log(`${value ? '✅' : '❌'} ${key}: ${value}`);
  });

  return criteria;
}

// Função para forçar instalação
function forceInstallation() {
  console.log('\n🚀 Tentando forçar instalação...');
  
  // Verificar se já está instalado
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                      window.navigator.standalone ||
                      document.referrer.includes('android-app://');
  
  if (isStandalone) {
    console.log('✅ App já está instalado (modo standalone)');
    return;
  }

  // Tentar usar prompt nativo se disponível
  if (window.beforeInstallPromptEvent) {
    console.log('🎯 Usando prompt nativo disponível...');
    window.beforeInstallPromptEvent.prompt()
      .then(() => window.beforeInstallPromptEvent.userChoice)
      .then(result => {
        console.log('📊 Resultado:', result.outcome);
        if (result.outcome === 'accepted') {
          console.log('🎉 Instalação aceita!');
        } else {
          console.log('❌ Instalação rejeitada');
          showManualInstructions();
        }
      })
      .catch(error => {
        console.error('💥 Erro na instalação:', error);
        showManualInstructions();
      });
  } else {
    console.log('⚠️ Prompt nativo não disponível');
    showManualInstructions();
  }
}

// Função para mostrar instruções manuais
function showManualInstructions() {
  console.log('\n📱 Instruções manuais de instalação:');
  
  const userAgent = navigator.userAgent;
  
  if (/iPhone|iPad|iPod/.test(userAgent)) {
    console.log('🍎 iOS/Safari:');
    console.log('1. Toque no botão de compartilhar (□↗)');
    console.log('2. Role para baixo e toque em "Adicionar à Tela de Início"');
    console.log('3. Toque em "Adicionar"');
  } else if (/Android/.test(userAgent)) {
    if (/Chrome/.test(userAgent)) {
      console.log('🤖 Android Chrome:');
      console.log('1. Toque no menu (⋮) no canto superior direito');
      console.log('2. Procure por "Instalar app" ou "Adicionar à tela inicial"');
      console.log('3. Confirme a instalação');
    } else {
      console.log('🤖 Android (outros navegadores):');
      console.log('1. Toque no menu do navegador');
      console.log('2. Procure por "Adicionar à tela inicial"');
      console.log('3. Se não aparecer, ative "Fontes desconhecidas" nas configurações');
    }
  } else {
    console.log('💻 Desktop:');
    console.log('1. Procure pelo ícone de instalação (⬇) na barra de endereço');
    console.log('2. Ou clique no menu (⋮) > "Instalar Sistema de Estoque"');
    console.log('3. Clique em "Instalar"');
  }
}

// Função para limpar cache e tentar novamente
async function resetPWA() {
  console.log('\n🔄 Resetando PWA...');
  
  try {
    // Limpar todos os caches
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => {
        console.log(`🗑️ Removendo cache: ${cacheName}`);
        return caches.delete(cacheName);
      })
    );

    // Desregistrar Service Workers
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      registrations.map(registration => {
        console.log(`🗑️ Desregistrando SW: ${registration.scope}`);
        return registration.unregister();
      })
    );

    // Limpar localStorage relacionado
    localStorage.removeItem('pwa-installed');
    localStorage.removeItem('pwa-banner-dismissed');
    localStorage.removeItem('pwa-install-rejected');

    console.log('✅ PWA resetado com sucesso!');
    console.log('🔄 Recarregue a página para tentar novamente');
    
  } catch (error) {
    console.error('❌ Erro ao resetar PWA:', error);
  }
}

// Função para testar instalação
async function testInstallation() {
  console.log('\n🧪 Testando instalação PWA...');
  
  const criteria = await checkPWACriteria();
  
  const requiredCriteria = ['https', 'manifest', 'serviceWorker', 'icons', 'startUrl', 'display'];
  const missingCriteria = requiredCriteria.filter(key => !criteria[key]);
  
  if (missingCriteria.length === 0) {
    console.log('✅ Todos os critérios PWA atendidos!');
    
    if (criteria.installable) {
      console.log('🎯 Prompt de instalação disponível');
      forceInstallation();
    } else {
      console.log('⚠️ Prompt de instalação não detectado');
      console.log('💡 Isso pode ser normal em alguns navegadores');
      showManualInstructions();
    }
  } else {
    console.log('❌ Critérios PWA não atendidos:', missingCriteria);
    console.log('🔧 Execute resetPWA() para tentar corrigir');
  }
}

// Expor funções globalmente para uso no console
window.PWADiagnostic = {
  check: checkPWACriteria,
  test: testInstallation,
  install: forceInstallation,
  reset: resetPWA,
  instructions: showManualInstructions
};

// Executar diagnóstico automaticamente
testInstallation();

console.log('\n💡 Comandos disponíveis:');
console.log('- PWADiagnostic.check() - Verificar critérios');
console.log('- PWADiagnostic.test() - Testar instalação');
console.log('- PWADiagnostic.install() - Forçar instalação');
console.log('- PWADiagnostic.reset() - Resetar PWA');
console.log('- PWADiagnostic.instructions() - Mostrar instruções');