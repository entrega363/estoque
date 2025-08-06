#!/usr/bin/env node

/**
 * Script para fazer deploy completo do zero no Vercel
 * Cria um novo projeto com link principal atualizado
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando deploy completo do zero...');

// Função para executar comandos
function runCommand(command, description) {
  console.log(`\n📋 ${description}`);
  console.log(`💻 Executando: ${command}`);
  try {
    const output = execSync(command, { 
      stdio: 'inherit', 
      encoding: 'utf8',
      cwd: process.cwd()
    });
    console.log('✅ Sucesso!');
    return output;
  } catch (error) {
    console.error(`❌ Erro: ${error.message}`);
    throw error;
  }
}

async function main() {
  try {
    // 1. Verificar se está logado no Vercel
    console.log('\n🔐 Verificando login no Vercel...');
    try {
      execSync('vercel whoami', { stdio: 'pipe' });
      console.log('✅ Já está logado no Vercel');
    } catch {
      console.log('🔑 Fazendo login no Vercel...');
      runCommand('vercel login', 'Login no Vercel');
    }

    // 2. Limpar cache local
    console.log('\n🧹 Limpando cache local...');
    const cacheDirs = ['.next', 'node_modules/.cache', '.vercel'];
    cacheDirs.forEach(dir => {
      if (fs.existsSync(dir)) {
        console.log(`🗑️ Removendo ${dir}...`);
        fs.rmSync(dir, { recursive: true, force: true });
      }
    });

    // 3. Reinstalar dependências
    runCommand('npm install', 'Reinstalando dependências');

    // 4. Build local para verificar se está tudo OK
    runCommand('npm run build', 'Fazendo build local');

    // 5. Deploy com nome único
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const projectName = `sistema-estoque-${timestamp}`;
    
    console.log(`\n🚀 Fazendo deploy com nome: ${projectName}`);
    
    // Deploy para produção com nome específico
    runCommand(
      `vercel --prod --name ${projectName} --yes`, 
      'Deploy para produção'
    );

    // 6. Configurar domínio personalizado (opcional)
    console.log('\n🌐 Deploy concluído!');
    console.log('\n📋 PRÓXIMOS PASSOS:');
    console.log('1. Acesse o Vercel Dashboard: https://vercel.com/dashboard');
    console.log('2. Encontre o projeto recém-criado');
    console.log('3. Configure um domínio personalizado se desejar');
    console.log('4. O novo link principal estará disponível');

    // 7. Tentar obter a URL do deployment
    try {
      const deploymentInfo = execSync('vercel ls --json', { encoding: 'utf8' });
      const deployments = JSON.parse(deploymentInfo);
      const latestDeployment = deployments.find(d => d.name === projectName);
      
      if (latestDeployment) {
        console.log(`\n🎉 NOVO LINK PRINCIPAL: https://${latestDeployment.url}`);
      }
    } catch (error) {
      console.log('\n💡 Verifique o link no Vercel Dashboard');
    }

  } catch (error) {
    console.error('\n❌ Erro durante o deploy:', error.message);
    console.log('\n🔧 SOLUÇÕES ALTERNATIVAS:');
    console.log('1. Verifique se está logado: vercel whoami');
    console.log('2. Faça login: vercel login');
    console.log('3. Tente novamente: node scripts/fresh-deploy.js');
    process.exit(1);
  }
}

main();