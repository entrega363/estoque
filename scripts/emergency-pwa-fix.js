// Script de emergência para corrigir PWA completamente
console.log('🚨 CORREÇÃO DE EMERGÊNCIA PWA');

// 1. Limpar tudo completamente
async function emergencyCleanup() {
  console.log('🧹 Limpeza completa...');
  
  try {
    // Limpar todos os caches
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
    console.log(`✅ ${cacheNames.length} caches removidos`);
    
    // Desregistrar todos os Service Workers
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map(reg => reg.unregister()));
    console.log(`✅ ${registrations.length} Service Workers removidos`);
    
    // Limpar localStorage
    localStorage.clear();
    sessionStorage.clear();
    console.log('✅ Storage limpo');
    
  } catch (error) {
    console.error('❌ Erro na limpeza:', error);
  }
}

// 2. Reconfigurar PWA do zero
async function reconfigurePWA() {
  console.log('🔧 Reconfigurando PWA...');
  
  try {
    // Registrar Service Worker
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none'
    });
    
    console.log('✅ Service Worker registrado');
    
    // Aguardar ativação
    await new Promise((resolve) => {
      if (registration.active) {
        resolve(registration);
      } else {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'activated') {
                resolve(registration);
              }
            });
          }
        });
      }
    });
    
    console.log('✅ Service Worker ativo');
    
  } catch (error) {
    console.error('❌ Erro na reconfiguração:', error);
  }
}

// 3. Forçar instalação PWA
async function forceInstallPWA() {
  console.log('🚀 Forçando instalação PWA...');
  
  return new Promise((resolve) => {
    let resolved = false;
    
    const handlePrompt = async (e) => {
      if (resolved) return;
      resolved = true;
      
      console.log('🎯 Prompt detectado!');
      e.preventDefault();
      
      try {
        await e.prompt();
        const result = await e.userChoice;
        
        if (result.outcome === 'accepted') {
          console.log('🎉 PWA instalado com sucesso!');
          resolve(true);
        } else {
          console.log('❌ Instalação rejeitada');
          resolve(false);
        }
      } catch (error) {
        console.error('💥 Erro na instalação:', error);
        resolve(false);
      }
    };
    
    window.addEventListener('beforeinstallprompt', handlePrompt, { once: true });
    
    // Timeout
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        console.log('⏰ Timeout - prompt não detectado');
        resolve(false);
      }
    }, 5000);
    
    // Simular interação
    document.body.click();
  });
}

// 4. Verificar critérios PWA
async function checkPWACriteria() {
  console.log('📋 Verificando critérios PWA...');
  
  const checks = {
    https: location.protocol === 'https:' || location.hostname === 'localhost',
    manifest: false,
    serviceWorker: 'serviceWorker' in navigator,
    icons: false,
    standalone: window.matchMedia('(display-mode: standalone)').matches
  };
  
  try {
    const manifestResponse = await fetch('/manifest.json');
    const manifest = await manifestResponse.json();
    
    checks.manifest = true;
    checks.icons = manifest.icons && manifest.icons.length >= 2;
    
    console.log('📊 Critérios PWA:', checks);
    console.log('📱 Manifest:', {
      name: manifest.name,
      display: manifest.display,
      icons: manifest.icons?.length || 0
    });
    
  } catch (error) {
    console.error('❌ Erro ao verificar manifest:', error);
  }
  
  return checks;
}

// 5. Função principal
async function emergencyFix() {
  console.log('🚨 INICIANDO CORREÇÃO DE EMERGÊNCIA');
  
  // Passo 1: Limpeza
  await emergencyCleanup();
  
  // Aguardar um pouco
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Passo 2: Reconfiguração
  await reconfigurePWA();
  
  // Aguardar um pouco
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Passo 3: Verificar critérios
  const criteria = await checkPWACriteria();
  
  // Passo 4: Tentar instalação
  if (criteria.https && criteria.manifest && criteria.serviceWorker) {
    console.log('✅ Critérios atendidos - tentando instalação...');
    const installed = await forceInstallPWA();
    
    if (!installed) {
      console.log('⚠️ Instalação automática falhou');
      showManualInstructions();
    }
  } else {
    console.log('❌ Critérios não atendidos:', criteria);
    showManualInstructions();
  }
}

// 6. Instruções manuais
function showManualInstructions() {
  console.log('\n📱 INSTRUÇÕES MANUAIS:');
  console.log('');
  console.log('🤖 ANDROID:');
  console.log('1. Menu (⋮) > "Instalar app" ou "Adicionar à tela inicial"');
  console.log('2. Se não aparecer "Instalar app", vá em:');
  console.log('   Configurações > Apps > [Navegador] > Permissões');
  console.log('   Ative "Instalar apps desconhecidas"');
  console.log('');
  console.log('🍎 iOS:');
  console.log('1. Botão compartilhar (□↗)');
  console.log('2. "Adicionar à Tela de Início"');
  console.log('3. "Adicionar"');
  console.log('');
  console.log('💻 DESKTOP:');
  console.log('1. Ícone de instalação (⬇) na barra de endereço');
  console.log('2. Ou Menu (⋮) > "Instalar Sistema de Estoque"');
}

// 7. Expor funções
window.EmergencyPWA = {
  fix: emergencyFix,
  cleanup: emergencyCleanup,
  reconfig: reconfigurePWA,
  install: forceInstallPWA,
  check: checkPWACriteria,
  instructions: showManualInstructions
};

// 8. Auto-executar
console.log('\n💡 Comandos disponíveis:');
console.log('- EmergencyPWA.fix() - Correção completa');
console.log('- EmergencyPWA.cleanup() - Limpar tudo');
console.log('- EmergencyPWA.check() - Verificar critérios');
console.log('');
console.log('🔄 Executando correção automática em 3 segundos...');

setTimeout(() => {
  emergencyFix().catch(console.error);
}, 3000);