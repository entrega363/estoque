#!/usr/bin/env node

/**
 * Script de configuração automática do Supabase
 * Execute: node setup-supabase.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Configuração Automática do Supabase');
console.log('=====================================\n');

console.log('📋 Antes de continuar, certifique-se de que você:');
console.log('1. ✅ Criou uma conta no Supabase (https://supabase.com)');
console.log('2. ✅ Criou um novo projeto');
console.log('3. ✅ Tem as chaves de API em mãos\n');

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function main() {
  try {
    console.log('🔑 Vamos configurar suas chaves de API:\n');
    
    // Obter URL do projeto
    const projectUrl = await askQuestion('📍 Cole a URL do seu projeto Supabase (ex: https://abcdefg.supabase.co): ');
    
    if (!projectUrl.includes('supabase.co')) {
      console.log('❌ URL inválida! Deve conter "supabase.co"');
      process.exit(1);
    }
    
    // Obter chave anon
    const anonKey = await askQuestion('🔐 Cole sua chave anon public (começa com eyJ...): ');
    
    if (!anonKey.startsWith('eyJ')) {
      console.log('❌ Chave inválida! Deve começar com "eyJ"');
      process.exit(1);
    }
    
    // Atualizar arquivo .env.local
    const envContent = `# Configurações do Supabase - Configurado automaticamente
# Gerado em: ${new Date().toLocaleString('pt-BR')}

# URL do projeto Supabase
NEXT_PUBLIC_SUPABASE_URL=${projectUrl}

# Chave pública anon
NEXT_PUBLIC_SUPABASE_ANON_KEY=${anonKey}

# ✅ Configuração completa!
# Reinicie o servidor com: npm run dev
`;
    
    fs.writeFileSync('.env.local', envContent);
    
    console.log('\n✅ Arquivo .env.local configurado com sucesso!');
    console.log('\n📋 Próximos passos:');
    console.log('1. Execute o SQL no Supabase (vou mostrar o comando)');
    console.log('2. Reinicie o servidor: npm run dev');
    console.log('3. Teste o sistema!\n');
    
    // Mostrar SQL para executar
    console.log('📊 Execute este SQL no Supabase (SQL Editor):');
    console.log('='.repeat(50));
    
    const sqlContent = fs.readFileSync('database/schema.sql', 'utf8');
    console.log(sqlContent);
    
    console.log('='.repeat(50));
    console.log('\n🎯 Como executar o SQL:');
    console.log('1. No painel do Supabase, vá em "SQL Editor"');
    console.log('2. Clique em "New query"');
    console.log('3. Cole o SQL acima');
    console.log('4. Clique em "Run"');
    
    console.log('\n🎉 Configuração concluída!');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    rl.close();
  }
}

main();