const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rtajuzunzkoamruejtim.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0YWp1enVuemtvYW1ydWVqdGltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDA0MTMsImV4cCI6MjA2OTcxNjQxM30.dlestmqzHPy-zMeJubohj13dvPaZ7MEUeoRti5OF0uU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAdminAccess() {
  try {
    console.log('🔍 Testando acesso do admin...');
    
    // 1. Fazer login como admin
    console.log('1. Fazendo login...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'entregasobral@gmail.com',
      password: 'tenderbr0'
    });
    
    if (loginError) {
      console.error('❌ Erro no login:', loginError);
      return;
    }
    
    console.log('✅ Login bem-sucedido:', loginData.user.email);
    
    // 2. Verificar sessão
    const { data: session } = await supabase.auth.getSession();
    console.log('📋 Sessão ativa:', session.session?.user?.email);
    
    // 3. Buscar perfil do usuário
    console.log('3. Buscando perfil...');
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', loginData.user.id)
      .single();
    
    if (profileError) {
      console.error('❌ Erro ao buscar perfil:', profileError);
    } else {
      console.log('✅ Perfil encontrado:', profile);
    }
    
    // 4. Tentar buscar todos os usuários
    console.log('4. Tentando buscar todos os usuários...');
    const { data: users, error: usersError } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (usersError) {
      console.error('❌ Erro ao buscar usuários:', usersError);
    } else {
      console.log('✅ Usuários encontrados:', users.length);
      users.forEach(user => {
        console.log(`  - ${user.nome} (${user.email}) - ${user.role} - ${user.status}`);
      });
    }
    
    // 5. Fazer logout
    await supabase.auth.signOut();
    console.log('🚪 Logout realizado');
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testAdminAccess();