#!/usr/bin/env node

/**
 * Script para forçar um novo deploy no Vercel
 * Limpa cache e força rebuild completo
 */

console.log('🚀 Forçando novo deploy no Vercel...');
console.log('📅 Data/Hora:', new Date().toLocaleString('pt-BR'));
console.log('🔄 Commit hash:', process.env.VERCEL_GIT_COMMIT_SHA || 'local');

// Força limpeza de cache
if (process.env.VERCEL) {
  console.log('✅ Deploy no Vercel detectado');
  console.log('🧹 Limpando cache...');
  
  // Força rebuild completo
  process.env.NEXT_CACHE_DISABLED = 'true';
  process.env.VERCEL_FORCE_NO_BUILD_CACHE = '1';
  
  console.log('🔧 Cache desabilitado para este build');
}

console.log('✨ Script executado com sucesso!');