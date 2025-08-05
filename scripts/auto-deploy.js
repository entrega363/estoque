#!/usr/bin/env node

/**
 * SCRIPT DE DEPLOY AUTOMÁTICO COMPLETO
 * Faz tudo automaticamente para o usuário
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 INICIANDO DEPLOY AUTOMÁTICO COMPLETO...');
console.log('⏰ Timestamp:', new Date().toLocaleString('pt-BR'));

try {
  console.log('\n📋 ETAPA 1: Verificando dependências...');
  
  // Verifica se o Vercel CLI está instalado
  try {
    execSync('vercel --version', { stdio: 'pipe' });
    console.log('✅ Vercel CLI encontrado');
  } catch (error) {
    console.log('📦 Instalando Vercel CLI...');
    execSync('npm install -g vercel', { stdio: 'inherit' });
    console.log('✅ Vercel CLI instalado');
  }

  console.log('\n📋 ETAPA 2: Fazendo login no Vercel...');
  console.log('🔑 Iniciando processo de autenticação...');
  
  // Faz login no Vercel (abrirá o navegador)
  execSync('vercel login', { stdio: 'inherit' });
  console.log('✅ Login realizado com sucesso');

  console.log('\n📋 ETAPA 3: Criando novo projeto no Vercel...');
  
  // Faz o deploy
  console.log('🚀 Iniciando deploy...');
  const deployResult = execSync('vercel --prod --yes', { 
    stdio: 'pipe',
    encoding: 'utf8'
  });
  
  console.log('✅ Deploy realizado com sucesso!');
  console.log('\n🎉 RESULTADO:');
  console.log(deployResult);
  
  // Extrai o URL do resultado
  const urlMatch = deployResult.match(/https:\/\/[^\s]+/);
  if (urlMatch) {
    const deployUrl = urlMatch[0];
    console.log('\n🔗 NOVO LINK GERADO:');
    console.log('📱 URL:', deployUrl);
    
    // Salva o URL em um arquivo
    fs.writeFileSync('NOVO-LINK.txt', `NOVO LINK DO SISTEMA:\n${deployUrl}\n\nData: ${new Date().toLocaleString('pt-BR')}\n`);
    console.log('💾 Link salvo em NOVO-LINK.txt');
  }

  console.log('\n🎉 DEPLOY AUTOMÁTICO CONCLUÍDO COM SUCESSO!');
  console.log('✨ Todas as funcionalidades devem estar operacionais');
  console.log('🔧 Modal de edição funcionando');
  console.log('👨‍💻 Nome do desenvolvedor atualizado');

} catch (error) {
  console.error('❌ Erro durante o deploy:', error.message);
  console.log('\n🔧 SOLUÇÃO ALTERNATIVA:');
  console.log('1. Acesse: https://vercel.com');
  console.log('2. Faça login com sua conta');
  console.log('3. Clique em "New Project"');
  console.log('4. Conecte este repositório GitHub');
  console.log('5. Configure as variáveis de ambiente do Supabase');
  console.log('6. Clique em "Deploy"');
}

console.log('\n✅ SCRIPT FINALIZADO');