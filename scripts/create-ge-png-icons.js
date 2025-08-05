// Script para criar ícones PNG G+E usando Canvas
console.log('🎨 Criando ícones PNG G+E...');

// Função para criar ícone G+E em PNG
function createGEIconPNG(size, filename) {
  return new Promise((resolve) => {
    // Criar canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Definir tamanho
    canvas.width = size;
    canvas.height = size;
    
    // Criar gradiente de fundo
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#1e3a8a'); // Azul escuro
    gradient.addColorStop(1, '#1e40af'); // Azul médio
    
    // Desenhar fundo com cantos arredondados
    const cornerRadius = Math.floor(size * 0.23);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(0, 0, size, size, cornerRadius);
    ctx.fill();
    
    // Configurar texto
    const fontSize = Math.floor(size * 0.4);
    ctx.fillStyle = '#F5F5F5'; // Branco
    ctx.font = `bold ${fontSize}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Desenhar texto G+E
    const textY = size / 2 + fontSize * 0.05; // Pequeno ajuste vertical
    ctx.fillText('G+E', size / 2, textY);
    
    // Converter para blob e baixar
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log(`✅ ${filename} criado (${size}x${size})`);
      resolve(blob);
    }, 'image/png', 1.0);
  });
}

// Lista de ícones para criar
const iconSizes = [
  { size: 72, filename: 'icon-72x72.png' },
  { size: 96, filename: 'icon-96x96.png' },
  { size: 128, filename: 'icon-128x128.png' },
  { size: 144, filename: 'icon-144x144.png' },
  { size: 152, filename: 'icon-152x152.png' },
  { size: 192, filename: 'icon-192x192.png' },
  { size: 384, filename: 'icon-384x384.png' },
  { size: 512, filename: 'icon-512x512.png' }
];

// Função para criar todos os ícones
async function createAllIcons() {
  console.log('🚀 Iniciando criação de todos os ícones PNG...');
  
  for (const icon of iconSizes) {
    try {
      await createGEIconPNG(icon.size, icon.filename);
      // Aguardar um pouco entre criações
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`❌ Erro ao criar ${icon.filename}:`, error);
    }
  }
  
  console.log('🎉 Todos os ícones PNG criados!');
  console.log('📁 Arquivos baixados automaticamente');
  console.log('📋 Substitua os arquivos na pasta /public/icons/');
}

// Função para testar um ícone específico
function testIcon(size = 192) {
  createGEIconPNG(size, `test-icon-${size}x${size}.png`);
}

// Expor funções globalmente
window.GEIconCreator = {
  createAll: createAllIcons,
  createSingle: createGEIconPNG,
  test: testIcon
};

// Instruções
console.log('\n💡 Como usar:');
console.log('1. Execute: GEIconCreator.createAll()');
console.log('2. Os arquivos PNG serão baixados automaticamente');
console.log('3. Substitua os arquivos na pasta /public/icons/');
console.log('4. Ou teste um ícone: GEIconCreator.test(192)');

// Auto-executar após 2 segundos
setTimeout(() => {
  console.log('\n🔄 Criando ícones automaticamente...');
  createAllIcons();
}, 2000);