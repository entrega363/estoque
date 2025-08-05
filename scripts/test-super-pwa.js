// Script para testar o SuperPWAInstaller
console.log('🧪 Testando SuperPWAInstaller...');

// Simular diferentes user agents para testar detecção
const testUserAgents = [
  {
    name: 'iPhone Safari',
    ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
  },
  {
    name: 'Samsung Chrome',
    ua: 'Mozilla/5.0 (Linux; Android 12; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Mobile Safari/537.36'
  },
  {
    name: 'Xiaomi MIUI',
    ua: 'Mozilla/5.0 (Linux; U; Android 12; pt-br; Redmi Note 11 Build/SKQ1.211103.001) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/100.0.4896.127 Mobile Safari/537.36 XiaoMi/MiuiBrowser/13.16.1-gn'
  },
  {
    name: 'Huawei EMUI',
    ua: 'Mozilla/5.0 (Linux; Android 10; ELE-L29) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.106 Mobile Safari/537.36 EdgA/45.06.4.5042'
  },
  {
    name: 'OnePlus OxygenOS',
    ua: 'Mozilla/5.0 (Linux; Android 11; OnePlus 9 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36'
  },
  {
    name: 'Desktop Chrome',
    ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36'
  }
];

// Função para testar detecção de dispositivo
function testDeviceDetection(userAgent) {
  // Simular window.navigator.userAgent
  const originalUA = navigator.userAgent;
  Object.defineProperty(navigator, 'userAgent', {
    value: userAgent.ua,
    configurable: true
  });

  console.log(`\n📱 Testando: ${userAgent.name}`);
  console.log(`UA: ${userAgent.ua.substring(0, 80)}...`);

  // Testar funções de detecção
  const isIOS = /iPad|iPhone|iPod/.test(userAgent.ua);
  const isAndroid = /Android/.test(userAgent.ua);
  
  let device = 'Desktop';
  let brand = '';
  
  if (/Xiaomi|MIUI/.test(userAgent.ua)) {
    device = 'Xiaomi';
    brand = 'Xiaomi';
  } else if (/Samsung/.test(userAgent.ua)) {
    device = 'Samsung';
    brand = 'Samsung';
  } else if (/Huawei|Honor/.test(userAgent.ua)) {
    device = /Honor/.test(userAgent.ua) ? 'Honor' : 'Huawei';
    brand = 'Huawei';
  } else if (/OnePlus/.test(userAgent.ua)) {
    device = 'OnePlus';
    brand = 'OnePlus';
  }

  let browser = 'Navegador';
  if (/Mi Browser/.test(userAgent.ua)) browser = 'Mi Browser';
  else if (/SamsungBrowser/.test(userAgent.ua)) browser = 'Samsung Internet';
  else if (/Chrome/.test(userAgent.ua) && !/Edg/.test(userAgent.ua)) browser = 'Chrome';
  else if (/Safari/.test(userAgent.ua) && !/Chrome/.test(userAgent.ua)) browser = 'Safari';

  console.log(`✅ Plataforma: ${isIOS ? 'iOS' : isAndroid ? 'Android' : 'Desktop'}`);
  console.log(`✅ Dispositivo: ${device}`);
  console.log(`✅ Marca: ${brand || 'Genérica'}`);
  console.log(`✅ Navegador: ${browser}`);

  // Restaurar UA original
  Object.defineProperty(navigator, 'userAgent', {
    value: originalUA,
    configurable: true
  });
}

// Executar testes
console.log('🚀 Iniciando testes de detecção de dispositivos...\n');

testUserAgents.forEach(testDeviceDetection);

// Testar Service Worker
console.log('\n🔧 Testando Service Worker...');

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations()
    .then(registrations => {
      console.log(`✅ Service Workers registrados: ${registrations.length}`);
      registrations.forEach((registration, index) => {
        console.log(`   ${index + 1}. Scope: ${registration.scope}`);
        console.log(`      Estado: ${registration.active ? 'Ativo' : 'Inativo'}`);
      });
    })
    .catch(error => {
      console.error('❌ Erro ao verificar Service Workers:', error);
    });
} else {
  console.log('❌ Service Worker não suportado');
}

// Testar Manifest
console.log('\n📋 Testando Manifest...');

fetch('/manifest.json')
  .then(response => response.json())
  .then(manifest => {
    console.log('✅ Manifest carregado com sucesso');
    console.log(`   Nome: ${manifest.name}`);
    console.log(`   Nome curto: ${manifest.short_name}`);
    console.log(`   Display: ${manifest.display}`);
    console.log(`   Tema: ${manifest.theme_color}`);
    console.log(`   Ícones: ${manifest.icons.length} disponíveis`);
    console.log(`   Shortcuts: ${manifest.shortcuts ? manifest.shortcuts.length : 0} disponíveis`);
  })
  .catch(error => {
    console.error('❌ Erro ao carregar manifest:', error);
  });

// Testar capacidades PWA
console.log('\n⚡ Testando capacidades PWA...');

// Verificar se está em modo standalone
const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                    window.navigator.standalone ||
                    document.referrer.includes('android-app://');

console.log(`${isStandalone ? '✅' : '❌'} Modo standalone: ${isStandalone}`);

// Verificar beforeinstallprompt
let hasInstallPrompt = false;
window.addEventListener('beforeinstallprompt', (e) => {
  hasInstallPrompt = true;
  console.log('✅ beforeinstallprompt detectado');
});

setTimeout(() => {
  console.log(`${hasInstallPrompt ? '✅' : '❌'} Install prompt disponível: ${hasInstallPrompt}`);
}, 1000);

// Verificar notificações
if ('Notification' in window) {
  console.log(`✅ Notificações suportadas: ${Notification.permission}`);
} else {
  console.log('❌ Notificações não suportadas');
}

// Verificar cache
if ('caches' in window) {
  caches.keys()
    .then(cacheNames => {
      console.log(`✅ Caches disponíveis: ${cacheNames.length}`);
      cacheNames.forEach(name => {
        console.log(`   - ${name}`);
      });
    });
} else {
  console.log('❌ Cache API não suportada');
}

console.log('\n🎉 Testes concluídos!');
console.log('\n💡 Para testar a instalação:');
console.log('1. Abra as ferramentas de desenvolvedor (F12)');
console.log('2. Vá para Application > Manifest');
console.log('3. Clique em "Install" se disponível');
console.log('4. Ou use o botão de instalação na página');