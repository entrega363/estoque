// Script para testar a conectividade com Supabase
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rtajuzunzkoamruejtim.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0YWp1enVuemtvYW1ydWVqdGltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDA0MTMsImV4cCI6MjA2OTcxNjQxM30.dlestmqzHPy-zMeJubohj13dvPaZ7MEUeoRti5OF0uU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔍 Testando conexão com Supabase...');
  
  try {
    // Teste 1: Verificar se consegue acessar as tabelas
    console.log('\n1. Testando acesso às tabelas...');
    const { data, error } = await supabase.from('user_profiles').select('count');
    
    if (error) {
      console.error('❌ Erro ao acessar tabelas:', error.message);
      return;
    }
    
    console.log('✅ Acesso às tabelas funcionando!');
    
    // Teste 2: Verificar autenticação
    console.log('\n2. Testando autenticação...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'teste-' + Date.now() + '@exemplo.com',
      password: '123456',
      options: {
        data: {
          nome: 'Teste'
        }
      }
    });
    
    if (authError) {
      console.error('❌ Erro na autenticação:', authError.message);
      console.error('Detalhes:', authError);
    } else {
      console.log('✅ Autenticação funcionando!');
      console.log('Dados retornados:', authData);
    }
    
  } catch (err) {
    console.error('❌ Erro geral:', err.message);
    console.error('Stack:', err.stack);
  }
}

testConnection();