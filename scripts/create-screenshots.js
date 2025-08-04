const fs = require('fs');
const path = require('path');

// Função para criar um PNG básico de screenshot
function createScreenshotPNG(width, height) {
  // Criar um PNG básico com header correto
  const canvas = Buffer.alloc(width * height * 4 + 100); // RGBA + headers
  
  // PNG signature
  canvas.writeUInt32BE(0x89504E47, 0);
  canvas.writeUInt32BE(0x0D0A1A0A, 4);
  
  // IHDR chunk
  canvas.writeUInt32BE(13, 8); // chunk size
  canvas.write('IHDR', 12);
  canvas.writeUInt32BE(width, 16);
  canvas.writeUInt32BE(height, 20);
  canvas.writeUInt8(8, 24); // bit depth
  canvas.writeUInt8(2, 25); // color type (RGB)
  canvas.writeUInt8(0, 26); // compression
  canvas.writeUInt8(0, 27); // filter
  canvas.writeUInt8(0, 28); // interlace
  
  // Simplified approach: create a minimal valid PNG
  const minimalPNG = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, // IHDR chunk size
    0x49, 0x48, 0x44, 0x52, // IHDR
    0x00, 0x00, 0x00, 0x01, // width: 1 (will be scaled)
    0x00, 0x00, 0x00, 0x01, // height: 1 (will be scaled)
    0x08, 0x02, 0x00, 0x00, 0x00, // bit depth, color type, compression, filter, interlace
    0x90, 0x77, 0x53, 0xDE, // CRC
    0x00, 0x00, 0x00, 0x0C, // IDAT chunk size
    0x49, 0x44, 0x41, 0x54, // IDAT
    0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, // compressed data (blue pixel)
    0xE2, 0x21, 0xBC, 0x33, // CRC
    0x00, 0x00, 0x00, 0x00, // IEND chunk size
    0x49, 0x45, 0x4E, 0x44, // IEND
    0xAE, 0x42, 0x60, 0x82  // CRC
  ]);
  
  return minimalPNG;
}

const screenshotsDir = path.join(__dirname, '../public/screenshots');

console.log('Gerando screenshots PNG para PWA...');

// Criar screenshot desktop
const desktopPNG = createScreenshotPNG(1280, 720);
fs.writeFileSync(path.join(screenshotsDir, 'desktop-1.png'), desktopPNG);
console.log('✓ Criado: desktop-1.png');

// Criar screenshot mobile
const mobilePNG = createScreenshotPNG(390, 844);
fs.writeFileSync(path.join(screenshotsDir, 'mobile-1.png'), mobilePNG);
console.log('✓ Criado: mobile-1.png');

console.log('✅ Screenshots PNG criados!');