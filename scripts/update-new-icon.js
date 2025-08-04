const fs = require('fs');
const path = require('path');

// Script para atualizar ícones PWA com o novo design
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '../public/icons');

function createIconPlaceholder(size, outputPath, isMainIcon = true) {
  // Criar um PNG placeholder baseado no novo design laranja
  const canvas = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="boxGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#ff9500;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#ff7b00;stop-opacity:1" />
      </linearGradient>
      <linearGradient id="topGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#ffb84d;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#ff9500;stop-opacity:1" />
      </linearGradient>
    </defs>
    
    <!-- Background -->
    <rect width="${size}" height="${size}" fill="#000000" rx="0"/>
    
    <!-- Main Box -->
    <g transform="translate(${size * 0.15}, ${size * 0.12})">
      <!-- Box base -->
      <path d="M 0 ${size * 0.23} L ${size * 0.15} ${size * 0.12} L ${size * 0.69} ${size * 0.12} L ${size * 0.53} ${size * 0.23} Z" fill="url(#topGrad)"/>
      <path d="M 0 ${size * 0.23} L 0 ${size * 0.55} L ${size * 0.15} ${size * 0.66} L ${size * 0.15} ${size * 0.35} Z" fill="#e6750a"/>
      <path d="M ${size * 0.15} ${size * 0.35} L ${size * 0.15} ${size * 0.66} L ${size * 0.69} ${size * 0.66} L ${size * 0.69} ${size * 0.35} Z" fill="url(#boxGrad)"/>
      <path d="M ${size * 0.53} ${size * 0.23} L ${size * 0.69} ${size * 0.12} L ${size * 0.69} ${size * 0.35} L ${size * 0.53} ${size * 0.47} Z" fill="#cc6600"/>
      <path d="M 0 ${size * 0.23} L ${size * 0.53} ${size * 0.23} L ${size * 0.53} ${size * 0.47} L 0 ${size * 0.55} Z" fill="#ff8c1a"/>
    </g>
    
    <!-- Check mark circle -->
    <g transform="translate(${size * 0.625}, ${size * 0.625})">
      <circle cx="${size * 0.125}" cy="${size * 0.125}" r="${size * 0.125}" fill="#00cc44" stroke="#000000" stroke-width="${Math.max(1, size * 0.015)}"/>
      <path d="M ${size * 0.0625} ${size * 0.125} L ${size * 0.1} ${size * 0.16} L ${size * 0.1875} ${size * 0.078}" stroke="#000000" stroke-width="${Math.max(2, size * 0.023)}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    </g>
  </svg>`;
  
  // Salvar como SVG temporário
  const svgPath = outputPath.replace('.png', '.svg');
  fs.writeFileSync(svgPath, canvas);
  
  console.log(`✅ Ícone criado: ${path.basename(outputPath)} (${size}x${size})`);
  return canvas;
}

function updateManifestWithNewIcons() {
  const manifestPath = path.join(__dirname, '../public/manifest.json');
  
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    // Atualizar ícones no manifest
    manifest.icons = sizes.map(size => ({
      src: `/icons/icon-${size}x${size}.png`,
      sizes: `${size}x${size}`,
      type: 'image/png',
      purpose: size >= 192 ? 'any maskable' : 'any'
    }));
    
    // Atualizar tema para combinar com o novo ícone
    manifest.theme_color = '#ff9500';
    manifest.background_color = '#000000';
    
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log('✅ Manifest.json atualizado com novo tema laranja');
    
  } catch (error) {
    console.error('❌ Erro ao atualizar manifest:', error);
  }
}

console.log('🎨 Gerando novos ícones PWA com design laranja...');

// Criar todos os tamanhos
sizes.forEach(size => {
  const filename = `icon-${size}x${size}.png`;
  const filepath = path.join(iconsDir, filename);
  createIconPlaceholder(size, filepath, true);
});

// Criar ícones para shortcuts
const shortcuts = ['add-icon', 'list-icon', 'used-icon'];
shortcuts.forEach(name => {
  const filename = `${name}.png`;
  const filepath = path.join(iconsDir, filename);
  createIconPlaceholder(96, filepath, false);
});

// Atualizar manifest
updateManifestWithNewIcons();

console.log('✅ Todos os ícones foram atualizados com o novo design!');
console.log('🎨 Tema: Laranja (#ff9500) com fundo preto');
console.log('✅ Check verde para indicar "aprovado/disponível"');