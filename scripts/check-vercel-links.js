// Script para verificar links possíveis do Vercel
const possibleLinks = [
  'https://estoque-sistema.vercel.app',
  'https://estoque-sistema-entrega363.vercel.app',
  'https://estoque-sistema-git-main-entrega363.vercel.app',
  'https://estoque.vercel.app',
  'https://estoque-entrega363.vercel.app',
  'https://sistema-estoque.vercel.app',
  'https://sistema-estoque-entrega363.vercel.app',
  'https://estoque-2025.vercel.app',
  'https://estoque-sistema-2025.vercel.app'
];

console.log('🔍 Links possíveis do Vercel para testar:\n');

possibleLinks.forEach((link, index) => {
  console.log(`${index + 1}. ${link}`);
});

console.log('\n💡 Como testar:');
console.log('1. Copie cada link e cole no navegador');
console.log('2. O que funcionar é o link correto');
console.log('3. Procure pelos componentes PWA implementados');

console.log('\n🎯 O que procurar no site:');
console.log('✅ Banner laranja no topo (aparece em 3s)');
console.log('✅ Banner principal na página inicial');
console.log('✅ Botão flutuante no canto inferior direito');
console.log('✅ PWA Debug no canto superior esquerdo');
console.log('✅ Modal de instalação Android');

console.log('\n🚀 Se nenhum funcionar:');
console.log('- O deploy pode estar em processamento');
console.log('- Aguarde alguns minutos e tente novamente');
console.log('- Verifique o dashboard do Vercel');
console.log('- O repositório GitHub está correto: https://github.com/entrega363/estoque.git');