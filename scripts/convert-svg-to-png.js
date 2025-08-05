// Script para converter SVGs em PNGs usando Canvas API
console.log('🔄 Convertendo ícones SVG para PNG...');

// Função para converter SVG para PNG
async function convertSVGtoPNG(svgContent, size, filename) {
  return new Promise((resolve, reject) => {
    // Criar um canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Definir tamanho do canvas
    canvas.width = size;
    canvas.height = size;
    
    // Criar uma imagem
    const img = new Image();
    
    img.onload = function() {
      // Desenhar a imagem no canvas
      ctx.drawImage(img, 0, 0, size, size);
      
      // Converter para PNG
      canvas.toBlob((blob) => {
        if (blob) {
          console.log(`✅ ${filename} convertido (${size}x${size})`);
          
          // Criar URL para download
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          
          resolve(blob);
        } else {
          reject(new Error(`Falha ao converter ${filename}`));
        }
      }, 'image/png');
    };
    
    img.onerror = () => reject(new Error(`Erro ao carregar SVG para ${filename}`));
    
    // Criar data URL do SVG
    const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });
    const svgUrl = URL.createObjectURL(svgBlob);
    img.src = svgUrl;
  });
}

// Lista de ícones para converter
const iconsToConvert = [
  { size: 72, file: 'icon-72x72' },
  { size: 96, file: 'icon-96x96' },
  { size: 128, file: 'icon-128x128' },
  { size: 144, file: 'icon-144x144' },
  { size: 152, file: 'icon-152x152' },
  { size: 192, file: 'icon-192x192' },
  { size: 384, file: 'icon-384x384' },
  { size: 512, file: 'icon-512x512' }
];

// Função principal para converter todos os ícones
async function convertAllIcons() {
  console.log('🚀 Iniciando conversão de todos os ícones...');
  
  for (const icon of iconsToConvert) {
    try {
      // Buscar o SVG
      const response = await fetch(`/icons/${icon.file}.svg`);
      const svgContent = await response.text();
      
      // Converter para PNG
      await convertSVGtoPNG(svgContent, icon.size, `${icon.file}.png`);
      
      // Aguardar um pouco entre conversões
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`❌ Erro ao converter ${icon.file}:`, error);
    }
  }
  
  console.log('🎉 Conversão concluída!');
  console.log('📁 Arquivos PNG baixados automaticamente');
  console.log('📋 Próximo passo: Substitua os arquivos na pasta /public/icons/');
}

// Função alternativa usando HTML2Canvas (se disponível)
async function convertWithHTML2Canvas() {
  if (typeof html2canvas === 'undefined') {
    console.log('⚠️ html2canvas não disponível, usando método Canvas nativo');
    return convertAllIcons();
  }
  
  console.log('🎨 Usando html2canvas para conversão...');
  
  for (const icon of iconsToConvert) {
    try {
      // Criar elemento SVG temporário
      const svgResponse = await fetch(`/icons/${icon.file}.svg`);
      const svgContent = await svgResponse.text();
      
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = svgContent;
      tempDiv.style.width = `${icon.size}px`;
      tempDiv.style.height = `${icon.size}px`;
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      document.body.appendChild(tempDiv);
      
      // Converter com html2canvas
      const canvas = await html2canvas(tempDiv, {
        width: icon.size,
        height: icon.size,
        backgroundColor: null
      });
      
      // Baixar PNG
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${icon.file}.png`;
        a.click();
        URL.revokeObjectURL(url);
      });
      
      // Remover elemento temporário
      document.body.removeChild(tempDiv);
      
      console.log(`✅ ${icon.file}.png convertido`);
      
    } catch (error) {
      console.error(`❌ Erro ao converter ${icon.file}:`, error);
    }
  }
}

// Expor funções globalmente
window.IconConverter = {
  convertAll: convertAllIcons,
  convertWithHTML2Canvas: convertWithHTML2Canvas,
  convertSingle: convertSVGtoPNG
};

// Instruções de uso
console.log('\n💡 Como usar:');
console.log('1. Execute: IconConverter.convertAll()');
console.log('2. Os arquivos PNG serão baixados automaticamente');
console.log('3. Substitua os arquivos na pasta /public/icons/');
console.log('4. Ou use: IconConverter.convertWithHTML2Canvas() se disponível');

// Auto-executar se estiver no navegador
if (typeof window !== 'undefined') {
  console.log('\n🔄 Executando conversão automática em 3 segundos...');
  setTimeout(() => {
    convertAllIcons().catch(console.error);
  }, 3000);
}