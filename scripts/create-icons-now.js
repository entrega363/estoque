// Script para criar ícones G+E imediatamente
console.log('🎨 Criando ícones G+E agora...');

function createIcon(size) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  canvas.width = size;
  canvas.height = size;
  
  // Fundo azul com gradiente
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#1e3a8a');
  gradient.addColorStop(1, '#1e40af');
  
  // Desenhar fundo com cantos arredondados
  const radius = size * 0.2;
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, radius);
  ctx.fill();
  
  // Texto G+E
  const fontSize = size * 0.35;
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${fontSize}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('G+E', size/2, size/2);
  
  return canvas.toDataURL('image/png');
}

// Criar ícones e baixar
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

sizes.forEach(size => {
  const dataUrl = createIcon(size);
  const link = document.createElement('a');
  link.download = `icon-${size}x${size}.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  console.log(`✅ icon-${size}x${size}.png criado`);
});

console.log('🎉 Todos os ícones criados e baixados!');