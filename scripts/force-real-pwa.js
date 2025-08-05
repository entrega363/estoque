// Script para forçar instalação PWA real (não apenas atalho)
console.log('🚀 Forçando instalação PWA real...');

// Função para verificar se é PWA instalável
async function checkPWAInstallability() {
  console.log('\n📋 Verificando critérios PWA para instalação real...');
  
  const checks = {
    https: location.protocol === 'https:' || location.hostname === 'localhost',
    manifest: false,
    serviceWorker: false,
    icons: false,
    display: false,
    startUrl: false,
    scope: false,
    name: false
  };

  // Verificar manifest
  try {
    const response = await fetch('/manifest.json');
    const manifest = await response.json();
    
    checks.manifest = true;
    checks.name = !!(manifest.name && manifest.short_name);
    checks.display = manifest.display === 'standalone';
    checks.startUrl = !!manifest.start_url;
    checks.scope = !!manifest.scope;
    checks.icons = manifest.icons && manifest.icons.length >= 2 && 
                   manifest.icons.some(icon => {
                     const size = parseInt(icon.sizes.split('x')[0]);
                     return size >= 192;
                   });

    console.log('✅ Manifest válido:', {
      name: manifest.name,
      shortName: manifest.short_name,
      display: manifest.display,
      startUrl: manifest.start_url,
      scope: manifest.scope,
      icons: manifest.icons?.length || 0,
      id: manifest.id
    });
  } catch (error) {
    console.error('❌ Erro no manifest:', error);
  }

  // Verificar Service Worker
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      checks.serviceWorker = registrations.length > 0 && 
                            registrations.some(reg => reg.active);
      
      console.log('✅ Service Worker:', {
        registrations: registrations.length,
        active: registrations.filter(reg => reg.active).length
      });
    } catch (error) {
      console.error('❌ Erro no Service Worker:', error);
    }
  }

  // Mostrar resultados
  console.log('\n📊 Critérios PWA:');
  Object.entries(checks).forEach(([key, value]) => {
    console.log(`${value ? '✅' : '❌'} ${key}: ${value}`);
  });

  const allPassed = Object.values(checks).every(Boolean);
  console.log(`\n${allPassed ? '🎉' : '⚠️'} PWA ${allPassed ? 'INSTALÁVEL' : 'NÃO INSTALÁVEL'}`);
  
  return { checks, allPassed };
}

// Função para forçar prompt de instalação
function forceInstallPrompt() {
  console.log('\n🎯 Tentando forçar prompt de instalação...');
  
  return new Promise((resolve) => {
    let promptEvent = null;
    let timeout;

    // Listener para capturar o evento
    const handlePrompt = (e) => {
      console.log('🎯 beforeinstallprompt capturado!');
      e.preventDefault();
      promptEvent = e;
      clearTimeout(timeout);
      
      // Executar prompt imediatamente
      setTimeout(async () => {
        try {
          console.log('🚀 Executando prompt...');
          await promptEvent.prompt();
          const result = await promptEvent.userChoice;
          
          console.log('📊 Resultado:', result.outcome);
          
          if (result.outcome === 'accepted') {
            console.log('🎉 PWA instalado com sucesso!');
            resolve({ success: true, method: 'native' });
          } else {
            console.log('❌ Instalação rejeitada pelo usuário');
            resolve({ success: false, method: 'native', reason: 'rejected' });
          }
        } catch (error) {
          console.error('💥 Erro na instalação:', error);
          resolve({ success: false, method: 'native', error });
        }
      }, 100);
    };

    // Adicionar listener
    window.addEventListener('beforeinstallprompt', handlePrompt, { once: true });

    // Timeout para fallback
    timeout = setTimeout(() => {
      window.removeEventListener('beforeinstallprompt', handlePrompt);
      console.log('⏰ Timeout - prompt não detectado');
      resolve({ success: false, method: 'timeout' });
    }, 5000);

    // Tentar disparar o evento
    console.log('🔄 Tentando disparar beforeinstallprompt...');
    
    // Simular interação do usuário
    const simulateClick = () => {
      const event = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true,
      });
      document.body.dispatchEvent(event);
    };

    // Múltiplas tentativas
    simulateClick();
    setTimeout(simulateClick, 100);
    setTimeout(simulateClick, 500);
    setTimeout(simulateClick, 1000);
  });
}

// Função para mostrar instruções específicas
function showInstallInstructions() {
  console.log('\n📱 Instruções para instalação PWA real:');
  
  const ua = navigator.userAgent;
  
  if (/Chrome/.test(ua) && /Android/.test(ua)) {
    console.log('🤖 Chrome Android:');
    console.log('1. Certifique-se que está usando Chrome atualizado');
    console.log('2. Procure o ícone de instalação (⬇) na barra de endereço');
    console.log('3. Se não aparecer, toque no menu (⋮) > "Instalar app"');
    console.log('4. IMPORTANTE: Deve aparecer "Instalar app", não "Adicionar à tela inicial"');
    console.log('5. Se só aparecer "Adicionar à tela inicial", o PWA não atende todos os critérios');
  } else if (/iPhone|iPad/.test(ua)) {
    console.log('🍎 iOS Safari:');
    console.log('1. Toque no botão compartilhar (□↗)');
    console.log('2. Role para baixo e toque em "Adicionar à Tela de Início"');
    console.log('3. No iOS, PWAs sempre aparecem como "Adicionar à Tela de Início"');
  } else {
    console.log('💻 Desktop Chrome:');
    console.log('1. Procure o ícone de instalação (⬇) na barra de endereço');
    console.log('2. Ou clique no menu (⋮) > "Instalar Sistema de Estoque"');
    console.log('3. Deve aparecer uma caixa de diálogo de instalação');
  }
}

// Função para corrigir problemas comuns
async function fixCommonIssues() {
  console.log('\n🔧 Tentando corrigir problemas comuns...');
  
  // 1. Reregistrar Service Worker
  if ('serviceWorker' in navigator) {
    try {
      console.log('🔄 Reregistrando Service Worker...');
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      });
      
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
      
      console.log('✅ Service Worker reregistrado');
    } catch (error) {
      console.error('❌ Erro ao reregistrar SW:', error);
    }
  }

  // 2. Limpar cache antigo
  try {
    console.log('🗑️ Limpando caches antigos...');
    const cacheNames = await caches.keys();
    const oldCaches = cacheNames.filter(name => 
      !name.includes('v2.1.0') && name.includes('estoque')
    );
    
    await Promise.all(oldCaches.map(name => caches.delete(name)));
    console.log(`✅ ${oldCaches.length} caches antigos removidos`);
  } catch (error) {
    console.error('❌ Erro ao limpar cache:', error);
  }

  // 3. Verificar se manifest está acessível
  try {
    console.log('🔍 Verificando manifest...');
    const response = await fetch('/manifest.json');
    if (response.ok) {
      console.log('✅ Manifest acessível');
    } else {
      console.error('❌ Manifest não acessível:', response.status);
    }
  } catch (error) {
    console.error('❌ Erro ao acessar manifest:', error);
  }

  // 4. Verificar ícones
  try {
    console.log('🖼️ Verificando ícones...');
    const iconChecks = [
      '/icons/icon-192x192.png',
      '/icons/icon-512x512.png'
    ];
    
    const iconResults = await Promise.all(
      iconChecks.map(async (icon) => {
        try {
          const response = await fetch(icon);
          return { icon, ok: response.ok };
        } catch {
          return { icon, ok: false };
        }
      })
    );
    
    iconResults.forEach(({ icon, ok }) => {
      console.log(`${ok ? '✅' : '❌'} ${icon}`);
    });
  } catch (error) {
    console.error('❌ Erro ao verificar ícones:', error);
  }
}

// Função principal
async function main() {
  console.log('🎯 Iniciando diagnóstico e correção PWA...');
  
  // 1. Verificar critérios
  const { allPassed } = await checkPWAInstallability();
  
  if (!allPassed) {
    console.log('\n🔧 Alguns critérios não foram atendidos. Tentando corrigir...');
    await fixCommonIssues();
    
    // Verificar novamente após correções
    setTimeout(async () => {
      const { allPassed: newCheck } = await checkPWAInstallability();
      if (newCheck) {
        console.log('\n🎉 Critérios corrigidos! Tentando instalação...');
        const result = await forceInstallPrompt();
        if (!result.success) {
          showInstallInstructions();
        }
      } else {
        console.log('\n⚠️ Ainda há problemas. Mostrando instruções manuais...');
        showInstallInstructions();
      }
    }, 2000);
  } else {
    console.log('\n🎉 Todos os critérios atendidos! Tentando instalação...');
    const result = await forceInstallPrompt();
    if (!result.success) {
      showInstallInstructions();
    }
  }
}

// Expor funções globalmente
window.PWAForcer = {
  check: checkPWAInstallability,
  install: forceInstallPrompt,
  fix: fixCommonIssues,
  instructions: showInstallInstructions,
  run: main
};

// Executar automaticamente
main();

console.log('\n💡 Comandos disponíveis:');
console.log('- PWAForcer.check() - Verificar critérios');
console.log('- PWAForcer.install() - Forçar instalação');
console.log('- PWAForcer.fix() - Corrigir problemas');
console.log('- PWAForcer.instructions() - Mostrar instruções');
console.log('- PWAForcer.run() - Executar diagnóstico completo');