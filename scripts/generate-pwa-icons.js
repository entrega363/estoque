const fs = require('fs');
const path = require('path');

// Criar ícones temporários usando Canvas (se disponível) ou placeholders
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '../public/icons');

// Criar diretório se não existir
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Função para criar SVG de ícone
function createIconSVG(size) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${size * 0.125}" fill="#3b82f6"/>
  <g transform="translate(${size * 0.25}, ${size * 0.25})">
    <rect x="${size * 0.125}" y="${size * 0.1875}" width="${size * 0.25}" height="${size * 0.1875}" rx="${size * 0.015625}" fill="white" opacity="0.9"/>
    <rect x="${size * 0.125}" y="${size * 0.1875}" width="${size * 0.25}" height="${size * 0.03125}" rx="${size * 0.015625}" fill="white"/>
    <rect x="${size * 0.0625}" y="${size * 0.125}" width="${size * 0.25}" height="${size * 0.1875}" rx="${size * 0.015625}" fill="white" opacity="0.7"/>
    <rect x="${size * 0.0625}" y="${size * 0.125}" width="${size * 0.25}" height="${size * 0.03125}" rx="${size * 0.015625}" fill="white" opacity="0.9"/>
    <rect x="${size * 0.1875}" y="${size * 0.0625}" width="${size * 0.25}" height="${size * 0.1875}" rx="${size * 0.015625}" fill="white" opacity="0.5"/>
    <rect x="${size * 0.1875}" y="${size * 0.0625}" width="${size * 0.25}" height="${size * 0.03125}" rx="${size * 0.015625}" fill="white" opacity="0.7"/>
    <circle cx="${size * 0.15625}" cy="${size * 0.203125}" r="${size * 0.0078125}" fill="#3b82f6"/>
    <circle cx="${size * 0.09375}" cy="${size * 0.140625}" r="${size * 0.0078125}" fill="#3b82f6"/>
    <circle cx="${size * 0.21875}" cy="${size * 0.078125}" r="${size * 0.0078125}" fill="#3b82f6"/>
  </g>
</svg>`;
}

// Gerar ícones SVG para cada tamanho
sizes.forEach(size => {
  const svgContent = createIconSVG(size);
  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(iconsDir, filename);
  
  fs.writeFileSync(filepath, svgContent);
  console.log(`✅ Criado: ${filename}`);
});

// Criar ícones de atalhos
const shortcuts = [
  { name: 'add-icon', icon: 'ri-add-line' },
  { name: 'list-icon', icon: 'ri-list-check' },
  { name: 'used-icon', icon: 'ri-tools-line' }
];

shortcuts.forEach(shortcut => {
  const svgContent = `<svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="96" height="96" rx="12" fill="#3b82f6"/>
  <text x="48" y="58" text-anchor="middle" fill="white" font-family="RemixIcon" font-size="32">&#xe${Math.floor(Math.random() * 1000).toString(16).padStart(3, '0')};</text>
</svg>`;
  
  const filename = `${shortcut.name}.svg`;
  const filepath = path.join(iconsDir, filename);
  
  fs.writeFileSync(filepath, svgContent);
  console.log(`✅ Criado: ${filename}`);
});

// Criar diretório de screenshots
const screenshotsDir = path.join(__dirname, '../public/screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Criar placeholder para screenshots
const desktopScreenshot = `<svg width="1280" height="720" viewBox="0 0 1280 720" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="1280" height="720" fill="#f3f4f6"/>
  <rect x="0" y="0" width="1280" height="64" fill="#3b82f6"/>
  <text x="640" y="40" text-anchor="middle" fill="white" font-family="Arial" font-size="24" font-weight="bold">Sistema de Controle de Estoque</text>
  <rect x="64" y="128" width="1152" height="528" rx="8" fill="white"/>
  <text x="640" y="400" text-anchor="middle" fill="#6b7280" font-family="Arial" font-size="32">Interface Principal do Sistema</text>
</svg>`;

const mobileScreenshot = `<svg width="390" height="844" viewBox="0 0 390 844" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="390" height="844" fill="#f3f4f6"/>
  <rect x="0" y="0" width="390" height="64" fill="#3b82f6"/>
  <text x="195" y="40" text-anchor="middle" fill="white" font-family="Arial" font-size="18" font-weight="bold">Estoque Pro</text>
  <rect x="16" y="96" width="358" height="700" rx="8" fill="white"/>
  <text x="195" y="450" text-anchor="middle" fill="#6b7280" font-family="Arial" font-size="16">Interface Mobile</text>
</svg>`;

fs.writeFileSync(path.join(screenshotsDir, 'desktop-1.svg'), desktopScreenshot);
fs.writeFileSync(path.join(screenshotsDir, 'mobile-1.svg'), mobileScreenshot);

console.log('✅ Screenshots placeholder criados');
console.log('\n🎉 Ícones PWA gerados com sucesso!');
console.log('\n📝 Próximos passos:');
console.log('1. Converta os arquivos SVG para PNG usando um conversor online');
console.log('2. Ou substitua pelos seus próprios ícones PNG');
console.log('3. Faça o build e deploy do projeto');
console.log('\n🔗 Conversores recomendados:');
console.log('- https://convertio.co/svg-png/');
console.log('- https://cloudconvert.com/svg-to-png');
console.log('- https://www.pwabuilder.com/imageGenerator');