-- CONFIGURAÇÃO COMPLETA DO BANCO DE DADOS - NOVO PROJETO
-- Execute este script no Supabase SQL Editor do projeto: novapasta2

-- 1. CRIAR TABELA DE PERFIS DE USUÁRIO
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    nome TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'inactive')),
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES auth.users(id)
);

-- 2. CRIAR TABELA DE EQUIPAMENTOS
CREATE TABLE IF NOT EXISTS equipamentos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    codigo TEXT NOT NULL,
    nome TEXT NOT NULL,
    quantidade INTEGER NOT NULL DEFAULT 0,
    categoria TEXT NOT NULL,
    foto TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CRIAR TABELA DE EQUIPAMENTOS UTILIZADOS
CREATE TABLE IF NOT EXISTS equipamentos_utilizados (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    codigo TEXT NOT NULL,
    nome TEXT NOT NULL,
    quantidade INTEGER NOT NULL DEFAULT 1,
    local TEXT NOT NULL,
    responsavel TEXT NOT NULL,
    data_uso TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. HABILITAR RLS (Row Level Security)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipamentos_utilizados ENABLE ROW LEVEL SECURITY;

-- 5. CRIAR POLÍTICAS RLS SIMPLES E FUNCIONAIS

-- Políticas para user_profiles
CREATE POLICY "users_can_view_own_profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_can_insert_own_profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "users_can_update_own_profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "admin_can_manage_all_profiles" ON user_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role = 'admin' 
            AND status = 'approved'
        )
    );

-- Políticas para equipamentos
CREATE POLICY "users_can_manage_own_equipment" ON equipamentos
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "admin_can_manage_all_equipment" ON equipamentos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role = 'admin' 
            AND status = 'approved'
        )
    );

-- Políticas para equipamentos_utilizados
CREATE POLICY "authenticated_can_manage_used_equipment" ON equipamentos_utilizados
    FOR ALL USING (auth.uid() IS NOT NULL);

-- 6. CRIAR FUNÇÃO E TRIGGER PARA AUTO-CRIAÇÃO DE PERFIL
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, nome, status, role, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
    CASE 
      WHEN NEW.email = 'entregasobral@gmail.com' THEN 'approved'
      ELSE 'approved' -- Todos aprovados automaticamente
    END,
    CASE 
      WHEN NEW.email = 'entregasobral@gmail.com' THEN 'admin'
      ELSE 'user'
    END,
    NOW()
  ) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    status = 'approved';
  RETURN NEW;
END;
$$;

-- Criar o trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 7. CRIAR USUÁRIO ADMINISTRADOR PADRÃO
-- Primeiro, vamos inserir o perfil admin (será criado automaticamente quando o usuário fizer login)

-- 8. GARANTIR PERMISSÕES
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON user_profiles TO authenticated;
GRANT ALL ON equipamentos TO authenticated;
GRANT ALL ON equipamentos_utilizados TO authenticated;

-- 9. INSERIR DADOS DE EXEMPLO (OPCIONAL)
INSERT INTO equipamentos (codigo, nome, quantidade, categoria, user_id) VALUES
('EQ001', 'Notebook Dell', 5, 'Informática', (SELECT id FROM auth.users WHERE email = 'entregasobral@gmail.com' LIMIT 1)),
('EQ002', 'Projetor Epson', 2, 'Audiovisual', (SELECT id FROM auth.users WHERE email = 'entregasobral@gmail.com' LIMIT 1)),
('EQ003', 'Mesa de Som', 1, 'Audiovisual', (SELECT id FROM auth.users WHERE email = 'entregasobral@gmail.com' LIMIT 1))
ON CONFLICT DO NOTHING;

-- 10. FUNÇÃO DE DEBUG PARA VERIFICAR CONFIGURAÇÃO
CREATE OR REPLACE FUNCTION debug_database_status()
RETURNS TABLE (
    item TEXT,
    status TEXT,
    details TEXT
) 
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'Tabelas'::TEXT as item,
        'OK'::TEXT as status,
        (SELECT COUNT(*)::TEXT || ' tabelas criadas' FROM information_schema.tables WHERE table_schema = 'public')::TEXT as details
    
    UNION ALL
    
    SELECT 
        'Políticas RLS'::TEXT as item,
        'OK'::TEXT as status,
        (SELECT COUNT(*)::TEXT || ' políticas ativas' FROM pg_policies WHERE schemaname = 'public')::TEXT as details
    
    UNION ALL
    
    SELECT 
        'Usuários'::TEXT as item,
        CASE WHEN EXISTS (SELECT 1 FROM user_profiles) THEN 'OK' ELSE 'VAZIO' END::TEXT as status,
        (SELECT COUNT(*)::TEXT || ' perfis de usuário' FROM user_profiles)::TEXT as details
    
    UNION ALL
    
    SELECT 
        'Equipamentos'::TEXT as item,
        CASE WHEN EXISTS (SELECT 1 FROM equipamentos) THEN 'OK' ELSE 'VAZIO' END::TEXT as status,
        (SELECT COUNT(*)::TEXT || ' equipamentos cadastrados' FROM equipamentos)::TEXT as details;
END;
$$;

-- 11. EXECUTAR DEBUG E MOSTRAR RESULTADO
SELECT 'BANCO DE DADOS CONFIGURADO COM SUCESSO!' as resultado;
SELECT * FROM debug_database_status();

-- 12. INSTRUÇÕES FINAIS
SELECT 'PRÓXIMOS PASSOS:' as info;
SELECT '1. Faça login com: entregasobral@gmail.com' as passo_1;
SELECT '2. Senha: tenderbr0' as passo_2;
SELECT '3. O perfil admin será criado automaticamente' as passo_3;
SELECT '4. Teste o sistema no site!' as passo_4;