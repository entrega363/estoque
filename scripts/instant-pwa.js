// Script instantâneo para PWA - Funciona em qualquer situação
console.log('⚡ PWA INSTANTÂNEO');

// Função super simples
function instantPWA() {
  console.log('🚀 Instalação instantânea...');
  
  // Limpar cache rapidamente
  if (window.caches) {
    caches.keys().then(function(names) {
      names.forEach(function(name) {
        caches.delete(name);
      });
      console.log('✅ Cache limpo');
    });
  }
  
  // Registrar SW
  if (navigator.serviceWorker) {
    navigator.serviceWorker.register('/sw.js').then(function() {
      console.log('✅ Service Worker OK');
    });
  }
  
  // Tentar instalação
  var installPrompt = null;
  
  window.addEventListener('beforeinstallprompt', function(e) {
    console.log('📱 PROMPT DETECTADO!');
    e.preventDefault();
    installPrompt = e;
    
    // Instalar automaticamente
    setTimeout(function() {
      if (installPrompt) {
        installPrompt.prompt().then(function() {
          return installPrompt.userChoice;
        }).then(function(result) {
          if (result.outcome === 'accepted') {
            console.log('🎉 INSTALADO COM SUCESSO!');
          } else {
            console.log('❌ Rejeitado - veja instruções abaixo');
            showSimpleInstructions();
          }
        });
      }
    }, 500);
  });
  
  // Ativar prompt
  document.body.click();
  
  // Timeout para instruções
  setTimeout(function() {
    if (!installPrompt) {
      console.log('⏰ Sem prompt - instruções manuais:');
      showSimpleInstructions();
    }
  }, 3000);
}

// Instruções super simples
function showSimpleInstructions() {
  console.log('');
  console.log('📱 COMO INSTALAR:');
  console.log('');
  console.log('📱 CELULAR:');
  console.log('• Menu (⋮) > "Instalar app"');
  console.log('• Se não aparecer: Configurações > Apps > Navegador > Permissões');
  console.log('');
  console.log('💻 COMPUTADOR:');
  console.log('• Ícone (⬇) na barra de endereço');
  console.log('• Ou Menu (⋮) > "Instalar"');
  console.log('');
  console.log('🍎 iPhone:');
  console.log('• Botão compartilhar > "Adicionar à Tela de Início"');
}

// Verificar PWA
function checkPWANow() {
  fetch('/manifest.json').then(function(r) {
    return r.json();
  }).then(function(manifest) {
    console.log('✅ PWA: ' + manifest.name);
    console.log('✅ Ícones: ' + manifest.icons.length);
    console.log('✅ HTTPS: ' + (location.protocol === 'https:'));
    console.log('✅ SW: ' + ('serviceWorker' in navigator));
  });
}

// Expor funções
window.InstantPWA = {
  install: instantPWA,
  check: checkPWANow,
  help: showSimpleInstructions
};

// Executar imediatamente
console.log('🔄 Executando em 1 segundo...');
setTimeout(instantPWA, 1000);