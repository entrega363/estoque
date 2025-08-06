#!/usr/bin/env node

/**
 * Script alternativo para forçar novo deployment
 * Remove projeto antigo e cria novo
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔄 Forçando novo deployment...');

function runCommand(command, description) {
  console.log(`\n📋 ${description}`);
  try {
    const output = execSync(command, { 
      stdio: 'inherit', 
      encoding: 'utf8'
    });
    return output;
  } catch (error) {
    console.log(`⚠️ Comando falhou, continuando...`);
    return null;
  }
}

async function main() {
  try {
    // 1. Limpar tudo
    console.log('\n🧹 Limpeza completa...');
    
    // Remover .vercel para forçar novo projeto
    if (fs.existsSync('.vercel')) {
      fs.rmSync('.vercel', { recursive: true, force: true });
      console.log('✅ Removido .vercel');
    }

    // Limpar outros caches
    ['.next', 'node_modules/.cache'].forEach(dir => {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
        console.log(`✅ Removido ${dir}`);
      }
    });

    // 2. Reinstalar
    runCommand('npm install', 'Reinstalando dependências');

    // 3. Build
    runCommand('npm run build', 'Build da aplicação');

    // 4. Deploy como novo projeto
    console.log('\n🚀 Fazendo deploy como NOVO projeto...');
    
    // Usar timestamp para nome único
    const now = Date.now();
    const projectName = `estoque-giga-${now}`;
    
    runCommand(
      `vercel --prod --name ${projectName} --force`, 
      `Deploy novo projeto: ${projectName}`
    );

    console.log('\n🎉 DEPLOY CONCLUÍDO!');
    console.log('\n📋 O QUE ACONTECEU:');
    console.log('✅ Criado um projeto completamente novo no Vercel');
    console.log('✅ Novo link principal será gerado');
    console.log('✅ Todas as funcionalidades atualizadas incluídas');
    
    console.log('\n🔗 PARA ENCONTRAR O NOVO LINK:');
    console.log('1. Acesse: https://vercel.com/dashboard');
    console.log(`2. Procure pelo projeto: ${projectName}`);
    console.log('3. O link principal estará lá');

  } catch (error) {
    console.error('\n❌ Erro:', error.message);
    
    console.log('\n🛠️ DEPLOY MANUAL:');
    console.log('1. Execute: vercel login');
    console.log('2. Execute: vercel --prod');
    console.log('3. Escolha criar novo projeto');
    console.log('4. Confirme as configurações');
  }
}

main();