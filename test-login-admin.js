const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rtajuzunzkoamruejtim.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0YWp1enVuemtvYW1ydWVqdGltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDA0MTMsImV4cCI6MjA2OTcxNjQxM30.dlestmqzHPy-zMeJubohj13dvPaZ7MEUeoRti5OF0uU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLoginAndProfile() {
  try {
    console.log('🔍 Testando login e perfil do admin...');
    
    // Limpar sessão existente
    await supabase.auth.signOut();
    console.log('🚪 Sessão limpa');
    
    // Fazer login
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'entregasobral@gmail.com',
      password: 'tenderbr0'
    });
    
    if (loginError) {
      console.error('❌ Erro no login:', loginError);
      return;
    }
    
    console.log('✅ Login bem-sucedido');
    console.log('📧 Email:', loginData.user.email);
    console.log('🆔 ID:', loginData.user.id);
    
    // Buscar perfil
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', loginData.user.id)
      .single();
    
    if (profileError) {
      console.error('❌ Erro ao buscar perfil:', profileError);
      return;
    }
    
    console.log('✅ Perfil encontrado:');
    console.log('  Nome:', profile.nome);
    console.log('  Email:', profile.email);
    console.log('  Role:', profile.role);
    console.log('  Status:', profile.status);
    console.log('  É admin?', profile.role === 'admin');
    console.log('  Está aprovado?', profile.status === 'approved');
    
    // Testar acesso a usuários
    const { data: users, error: usersError } = await supabase
      .from('user_profiles')
      .select('*');
    
    if (usersError) {
      console.error('❌ Erro ao buscar usuários:', usersError);
    } else {
      console.log('✅ Pode acessar usuários:', users.length, 'usuários encontrados');
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testLoginAndProfile();