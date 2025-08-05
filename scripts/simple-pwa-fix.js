// Script simples para corrigir PWA
console.log('🔧 Correção Simples PWA');

// Função principal
async function fixPWA() {
  console.log('🚀 Iniciando correção...');
  
  try {
    // 1. Limpar cache
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      for (const name of cacheNames) {
        await caches.delete(name);
        console.log('🗑️ Cache removido: ' + name);
      }
    }
    
    // 2. Limpar storage
    localStorage.clear();
    sessionStorage.clear();
    console.log('✅ Storage limpo');
    
    // 3. Registrar Service Worker
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('✅ Service Worker registrado');
    }
    
    // 4. Aguardar um pouco
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 5. Tentar instalação
    console.log('🎯 Tentando instalação...');
    
    let installPrompt = null;
    
    window.addEventListener('beforeinstallprompt', function(e) {
      console.log('📱 Prompt de instalação detectado!');
      e.preventDefault();
      installPrompt = e;
      
      // Executar prompt automaticamente
      setTimeout(async function() {
        try {
          await installPrompt.prompt();
          const result = await installPrompt.userChoice;
          
          if (result.outcome === 'accepted') {
            console.log('🎉 PWA instalado com sucesso!');
          } else {
            console.log('❌ Instalação rejeitada');
            showInstructions();
          }
        } catch (error) {
          console.error('💥 Erro na instalação:', error);
          showInstructions();
        }
      }, 1000);
    });
    
    // 6. Simular clique para ativar prompt
    document.body.click();
    
    // 7. Timeout para instruções manuais
    setTimeout(function() {
      if (!installPrompt) {
        console.log('⏰ Prompt não detectado - mostrando instruções');
        showInstructions();
      }
    }, 5000);
    
  } catch (error) {
    console.error('❌ Erro na correção:', error);
    showInstructions();
  }
}

// Instruções manuais
function showInstructions() {
  console.log('\n📱 INSTRUÇÕES MANUAIS:');
  console.log('');
  console.log('🤖 ANDROID:');
  console.log('1. Menu (⋮) > "Instalar app"');
  console.log('2. Se não aparecer, vá em Configurações > Apps > [Navegador] > Permissões');
  console.log('3. Ative "Instalar apps desconhecidas"');
  console.log('');
  console.log('🍎 iOS:');
  console.log('1. Botão compartilhar (□↗)');
  console.log('2. "Adicionar à Tela de Início"');
  console.log('');
  console.log('💻 DESKTOP:');
  console.log('1. Ícone (⬇) na barra de endereço');
  console.log('2. Ou Menu (⋮) > "Instalar"');
}

// Verificar critérios PWA
async function checkPWA() {
  console.log('📋 Verificando PWA...');
  
  try {
    const response = await fetch('/manifest.json');
    const manifest = await response.json();
    
    console.log('✅ Manifest:', manifest.name);
    console.log('✅ Ícones:', manifest.icons.length);
    console.log('✅ Display:', manifest.display);
    
    const hasServiceWorker = 'serviceWorker' in navigator;
    const isHTTPS = location.protocol === 'https:' || location.hostname === 'localhost';
    
    console.log('✅ Service Worker:', hasServiceWorker);
    console.log('✅ HTTPS:', isHTTPS);
    
    return {
      manifest: true,
      icons: manifest.icons.length > 0,
      serviceWorker: hasServiceWorker,
      https: isHTTPS
    };
    
  } catch (error) {
    console.error('❌ Erro ao verificar PWA:', error);
    return false;
  }
}

// Expor funções
window.SimplePWA = {
  fix: fixPWA,
  check: checkPWA,
  instructions: showInstructions
};

// Executar automaticamente
console.log('🔄 Executando em 2 segundos...');
setTimeout(fixPWA, 2000);