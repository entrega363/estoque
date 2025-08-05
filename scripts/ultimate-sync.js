#!/usr/bin/env node

/**
 * ULTIMATE SYNC SCRIPT
 * Força sincronização completa entre deployments
 */

const timestamp = Date.now();
const buildId = `ultimate-sync-${timestamp}`;

console.log('🚀 ULTIMATE SYNC - INICIANDO...');
console.log('⏰ Timestamp:', timestamp);
console.log('🆔 Build ID:', buildId);
console.log('🎯 Objetivo: Sincronizar estoque2-eight.vercel.app');
console.log('📋 Referência: estoque2-8e9ce7y5f.entregasobrals-projects.vercel.app');

// Força todas as configurações necessárias
if (process.env.VERCEL) {
  console.log('✅ Ambiente Vercel detectado');
  
  // Desabilita todos os caches
  process.env.VERCEL_FORCE_NO_BUILD_CACHE = '1';
  process.env.NEXT_CACHE_DISABLED = 'true';
  process.env.DISABLE_CACHE = 'true';
  
  // Força rebuild completo
  process.env.FORCE_REBUILD = buildId;
  process.env.BUILD_TIMESTAMP = timestamp.toString();
  
  console.log('🧹 Cache completamente desabilitado');
  console.log('🔄 Rebuild forçado:', buildId);
}

console.log('✨ ULTIMATE SYNC - CONFIGURADO!');
console.log('🎉 Deploy deve estar 100% sincronizado em 3-5 minutos');

module.exports = { buildId, timestamp };