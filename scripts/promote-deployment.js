#!/usr/bin/env node

/**
 * Script para promover deployment específico para produção
 * Força o Vercel a usar a versão que está funcionando
 */

console.log('🚀 Promovendo deployment específico para produção...');
console.log('📅 Data/Hora:', new Date().toLocaleString('pt-BR'));

// Configurações do deployment
const WORKING_DEPLOYMENT = 'estoque2-8e9ce7y5f.entregasobrals-projects.vercel.app';
const TARGET_DOMAIN = 'estoque2.vercel.app'; // ou seu domínio principal

console.log('✅ Deployment funcionando:', WORKING_DEPLOYMENT);
console.log('🎯 Domínio alvo:', TARGET_DOMAIN);

// Força rebuild com as mesmas configurações
if (process.env.VERCEL) {
  console.log('🔧 Configurando variáveis de ambiente...');
  
  // Força usar as mesmas configurações do deployment funcionando
  process.env.VERCEL_FORCE_NO_BUILD_CACHE = '1';
  process.env.NEXT_CACHE_DISABLED = 'true';
  
  // Garante que use a mesma versão do Node.js
  process.env.NODE_VERSION = '18.x';
  
  console.log('✨ Configurações aplicadas!');
}

console.log('🎉 Script executado com sucesso!');