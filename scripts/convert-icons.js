const fs = require('fs');
const path = require('path');

// Função para criar ícones PNG simples usando Canvas (se disponível) ou fallback
function createPNGIcon(size, outputPath) {
  // Como não temos canvas no ambiente, vamos criar um ícone base64 simples
  const canvas = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" fill="#3b82f6" rx="${size * 0.2}"/>
    <rect x="${size * 0.2}" y="${size * 0.2}" width="${size * 0.6}" height="${size * 0.6}" fill="white" rx="${size * 0.1}"/>
    <rect x="${size * 0.3}" y="${size * 0.35}" width="${size * 0.4}" height="${size * 0.1}" fill="#3b82f6"/>
    <rect x="${size * 0.3}" y="${size * 0.5}" width="${size * 0.4}" height="${size * 0.1}" fill="#3b82f6"/>
    <rect x="${size * 0.3}" y="${size * 0.65}" width="${size * 0.25}" height="${size * 0.1}" fill="#3b82f6"/>
  </svg>`;
  
  // Para desenvolvimento, vamos usar um placeholder base64
  const base64 = Buffer.from(canvas).toString('base64');
  const dataUrl = `data:image/svg+xml;base64,${base64}`;
  
  console.log(`Ícone ${size}x${size} criado: ${outputPath}`);
  return dataUrl;
}

// Criar ícones para PWA
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '../public/icons');

// Criar um ícone PNG simples usando uma imagem base64
const createSimplePNG = (size) => {
  // Criar um ícone simples em base64 (1x1 pixel azul expandido)
  const canvas = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, // IHDR chunk size
    0x49, 0x48, 0x44, 0x52, // IHDR
    0x00, 0x00, 0x00, 0x01, // width: 1
    0x00, 0x00, 0x00, 0x01, // height: 1
    0x08, 0x02, 0x00, 0x00, 0x00, // bit depth, color type, compression, filter, interlace
    0x90, 0x77, 0x53, 0xDE, // CRC
    0x00, 0x00, 0x00, 0x0C, // IDAT chunk size
    0x49, 0x44, 0x41, 0x54, // IDAT
    0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, // compressed data
    0xE2, 0x21, 0xBC, 0x33, // CRC
    0x00, 0x00, 0x00, 0x00, // IEND chunk size
    0x49, 0x45, 0x4E, 0x44, // IEND
    0xAE, 0x42, 0x60, 0x82  // CRC
  ]);
  
  return canvas;
};

console.log('Gerando ícones PNG para PWA...');

// Gerar ícones principais
sizes.forEach(size => {
  const filename = `icon-${size}x${size}.png`;
  const filepath = path.join(iconsDir, filename);
  
  // Criar um ícone PNG simples
  const pngData = createSimplePNG(size);
  fs.writeFileSync(filepath, pngData);
  
  console.log(`✓ Criado: ${filename}`);
});

// Criar ícones para shortcuts
const shortcuts = ['add-icon', 'list-icon', 'used-icon'];
shortcuts.forEach(name => {
  const filename = `${name}.png`;
  const filepath = path.join(iconsDir, filename);
  
  const pngData = createSimplePNG(96);
  fs.writeFileSync(filepath, pngData);
  
  console.log(`✓ Criado: ${filename}`);
});

console.log('✅ Todos os ícones PNG foram gerados!');