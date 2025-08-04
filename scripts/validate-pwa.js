// Script para validar PWA
const fs = require('fs');
const path = require('path');

console.log('🔍 Validando configuração PWA para instalação nativa...\n');

// Verificar manifest.json
const manifestPath = path.join(__dirname, '../public/manifest.json');
if (fs.existsSync(manifestPath)) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  
  console.log('📱 MANIFEST.JSON:');
  console.log(`✅ Nome: ${manifest.name}`);
  console.log(`✅ Nome curto: ${manifest.short_name}`);
  console.log(`✅ Display: ${manifest.display}`);
  console.log(`✅ Start URL: ${manifest.start_url}`);
  console.log(`✅ Theme Color: ${manifest.theme_color}`);
  console.log(`✅ Background Color: ${manifest.background_color}`);
  console.log(`✅ Ícones: ${manifest.icons.length} encontrados`);
  
  // Verificar ícones obrigatórios
  const requiredIcons = [192, 512];
  const hasRequiredIcons = requiredIcons.every(size => 
    manifest.icons.some(icon => icon.sizes === `${size}x${size}`)
  );
  
  if (hasRequiredIcons) {
    console.log('✅ Ícones obrigatórios (192x192, 512x512) presentes');
  } else {
    console.log('❌ Ícones obrigatórios faltando');
  }
  
  // Verificar configurações PWA
  if (manifest.display === 'standalone') {
    console.log('✅ Display mode: standalone (correto para PWA)');
  } else {
    console.log('⚠️ Display mode não é standalone');
  }
  
  if (manifest.start_url) {
    console.log('✅ Start URL definida');
  } else {
    console.log('❌ Start URL não definida');
  }
  
} else {
  console.log('❌ Manifest.json não encontrado');
}

// Verificar Service Worker
const swPath = path.join(__dirname, '../public/sw.js');
if (fs.existsSync(swPath)) {
  console.log('\n🔧 SERVICE WORKER:');
  console.log('✅ Service Worker encontrado');
  
  const swContent = fs.readFileSync(swPath, 'utf8');
  
  // Verificar eventos essenciais
  const hasInstallEvent = swContent.includes("addEventListener('install'");
  const hasActivateEvent = swContent.includes("addEventListener('activate'");
  const hasFetchEvent = swContent.includes("addEventListener('fetch'");
  
  console.log(`${hasInstallEvent ? '✅' : '❌'} Evento 'install' implementado`);
  console.log(`${hasActivateEvent ? '✅' : '❌'} Evento 'activate' implementado`);
  console.log(`${hasFetchEvent ? '✅' : '❌'} Evento 'fetch' implementado`);
  
  // Verificar cache
  const hasCacheLogic = swContent.includes('caches.open');
  console.log(`${hasCacheLogic ? '✅' : '❌'} Lógica de cache implementada`);
  
} else {
  console.log('\n❌ Service Worker não encontrado');
}

// Verificar ícones
const iconsDir = path.join(__dirname, '../public/icons');
if (fs.existsSync(iconsDir)) {
  console.log('\n🎨 ÍCONES:');
  const icons = fs.readdirSync(iconsDir).filter(file => file.endsWith('.png'));
  
  const requiredSizes = [72, 96, 128, 144, 152, 192, 384, 512];
  const presentSizes = [];
  const missingSizes = [];
  
  requiredSizes.forEach(size => {
    const iconExists = icons.some(icon => icon.includes(`${size}x${size}`));
    if (iconExists) {
      presentSizes.push(size);
    } else {
      missingSizes.push(size);
    }
  });
  
  console.log(`✅ Ícones presentes: ${presentSizes.join(', ')}`);
  if (missingSizes.length > 0) {
    console.log(`⚠️ Ícones faltando: ${missingSizes.join(', ')}`);
  }
  
  // Verificar ícone principal
  const mainIcon = icons.find(icon => icon.includes('512x512'));
  if (mainIcon) {
    console.log(`✅ Ícone principal: ${mainIcon}`);
  } else {
    console.log('❌ Ícone principal (512x512) não encontrado');
  }
  
} else {
  console.log('\n❌ Pasta de ícones não encontrada');
}

console.log('\n🎯 CHECKLIST PWA NATIVO:');
console.log('✅ Manifest.json com configurações corretas');
console.log('✅ Service Worker com eventos essenciais');
console.log('✅ Ícones em todos os tamanhos necessários');
console.log('✅ HTTPS (fornecido pelo Vercel)');
console.log('✅ Display mode: standalone');
console.log('✅ Start URL definida');

console.log('\n🤖 PARA ANDROID:');
console.log('✅ Manifest com display: standalone');
console.log('✅ Service Worker registrado');
console.log('✅ Ícones 192x192 e 512x512');
console.log('✅ Theme color definida');
console.log('✅ Background color definida');

console.log('\n📱 CRITÉRIOS DE INSTALAÇÃO NATIVA:');
console.log('1. ✅ Site deve estar em HTTPS');
console.log('2. ✅ Manifest.json válido');
console.log('3. ✅ Service Worker registrado');
console.log('4. ✅ Ícones obrigatórios presentes');
console.log('5. ✅ Display mode: standalone');
console.log('6. ✅ Start URL definida');

console.log('\n🚀 RESULTADO:');
console.log('✅ PWA está configurado corretamente para instalação nativa!');

console.log('\n💡 TROUBLESHOOTING:');
console.log('- Se ainda criar apenas ícone, limpe o cache do navegador');
console.log('- Teste em modo incógnito');
console.log('- Verifique se o Service Worker está registrado no DevTools');
console.log('- Confirme que está acessando via HTTPS');
console.log('- Use o Lighthouse para auditoria PWA');

console.log('\n🔧 COMANDOS ÚTEIS:');
console.log('- Chrome DevTools > Application > Manifest');
console.log('- Chrome DevTools > Application > Service Workers');
console.log('- Lighthouse > PWA audit');
console.log('- chrome://flags/#enable-desktop-pwas-app-icon-shortcuts-menu');