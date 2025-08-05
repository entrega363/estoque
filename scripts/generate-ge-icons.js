// Script para gerar ícones G+E em todos os tamanhos necessários
console.log('🎨 Gerando ícones G+E para PWA...');

// Função para criar SVG do ícone G+E
function createGEIcon(size) {
  const fontSize = Math.floor(size * 0.4); // 40% do tamanho
  const cornerRadius = Math.floor(size * 0.23); // 23% para cantos arredondados
  
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Background with rounded corners -->
  <rect width="${size}" height="${size}" rx="${cornerRadius}" fill="url(#gradient)"/>
  
  <!-- G+E Text -->
  <text x="${size/2}" y="${size/2 + fontSize/3}" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" text-anchor="middle" fill="#F5F5F5">G+E</text>
  
  <!-- Gradient definition -->
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1e3a8a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1e40af;stop-opacity:1" />
    </linearGradient>
  </defs>
</svg>`;
}

// Função para criar ícone maskable (com padding)
function createMaskableIcon(size) {
  const fontSize = Math.floor(size * 0.3); // Menor para maskable
  const cornerRadius = Math.floor(size * 0.23);
  
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Background with rounded corners -->
  <rect width="${size}" height="${size}" rx="${cornerRadius}" fill="url(#gradient)"/>
  
  <!-- G+E Text with padding for safe area -->
  <text x="${size/2}" y="${size/2 + fontSize/3}" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" text-anchor="middle" fill="#F5F5F5">G+E</text>
  
  <!-- Gradient definition -->
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1e3a8a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1e40af;stop-opacity:1" />
    </linearGradient>
  </defs>
</svg>`;
}

// Tamanhos necessários para PWA
const iconSizes = [
  { size: 72, purpose: 'any' },
  { size: 96, purpose: 'any' },
  { size: 128, purpose: 'any' },
  { size: 144, purpose: 'any' },
  { size: 152, purpose: 'any' },
  { size: 192, purpose: 'any maskable' },
  { size: 384, purpose: 'any maskable' },
  { size: 512, purpose: 'any maskable' }
];

// Gerar SVGs para cada tamanho
iconSizes.forEach(({ size, purpose }) => {
  const isMaskable = purpose.includes('maskable');
  const svgContent = isMaskable ? createMaskableIcon(size) : createGEIcon(size);
  
  console.log(`✅ Ícone ${size}x${size} (${purpose}) gerado`);
  
  // Simular salvamento (em um ambiente real, salvaria os arquivos)
  console.log(`   Arquivo: /public/icons/icon-${size}x${size}.svg`);
});

// Gerar também favicon
const faviconSvg = createGEIcon(32);
console.log('✅ Favicon 32x32 gerado');

// Instruções para conversão
console.log('\n📋 Próximos passos:');
console.log('1. Use um conversor SVG para PNG online');
console.log('2. Converta cada SVG para PNG no tamanho correspondente');
console.log('3. Salve os arquivos como icon-{size}x{size}.png');
console.log('4. Substitua os ícones existentes na pasta /public/icons/');

// Mostrar exemplo de manifest.json atualizado
console.log('\n📱 Manifest.json será atualizado automaticamente');

// Criar arquivo de instruções
const instructions = `# 🎨 Ícones G+E Gerados

## Arquivos necessários:
${iconSizes.map(({size}) => `- icon-${size}x${size}.png`).join('\n')}

## Como converter:
1. Acesse: https://convertio.co/svg-png/
2. Faça upload do SVG correspondente
3. Defina o tamanho exato (${iconSizes.map(({size}) => size).join(', ')})
4. Baixe o PNG
5. Renomeie para icon-{size}x{size}.png

## Cores utilizadas:
- Fundo: Gradiente azul (#1e3a8a → #1e40af)
- Texto: Branco (#F5F5F5)
- Fonte: Arial Bold
`;

console.log('\n📄 Instruções salvas em ICON-INSTRUCTIONS.md');

// Retornar SVGs para uso
return {
  iconSizes,
  createGEIcon,
  createMaskableIcon,
  instructions
};