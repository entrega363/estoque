-- CONFIGURAÇÃO COMPLETA DO BANCO DE DADOS SUPABASE
-- Execute este script no SQL Editor do Supabase

-- 1. CRIAR TABELAS PRINCIPAIS

-- Tabela de perfis de usuário
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'inactive')),
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_by UUID
);

-- Tabela de equipamentos
CREATE TABLE IF NOT EXISTS equipamentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo VARCHAR(50) NOT NULL,
  nome VARCHAR(255) NOT NULL,
  quantidade INTEGER NOT NULL DEFAULT 0,
  categoria VARCHAR(100) NOT NULL,
  foto TEXT,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de equipamentos utilizados
CREATE TABLE IF NOT EXISTS equipamentos_utilizados (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo VARCHAR(50) NOT NULL,
  nome VARCHAR(255) NOT NULL,
  quantidade INTEGER NOT NULL DEFAULT 1,
  local VARCHAR(255) NOT NULL,
  responsavel VARCHAR(255) NOT NULL,
  data_uso DATE NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CRIAR ÍNDICES
CREATE INDEX IF NOT EXISTS idx_equipamentos_codigo ON equipamentos(codigo);
CREATE INDEX IF NOT EXISTS idx_equipamentos_categoria ON equipamentos(categoria);
CREATE INDEX IF NOT EXISTS idx_equipamentos_user_id ON equipamentos(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- 3. CONFIGURAR RLS (MODO SIMPLES)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipamentos_utilizados ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas
DROP POLICY IF EXISTS "allow_select_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "allow_insert_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "allow_update_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "allow_admin_all_profiles" ON user_profiles;
DROP POLICY IF EXISTS "allow_user_own_equipment" ON equipamentos;
DROP POLICY IF EXISTS "allow_admin_all_equipment" ON equipamentos;
DROP POLICY IF EXISTS "allow_authenticated_equipment_used" ON equipamentos_utilizados;

-- Políticas simples e funcionais
CREATE POLICY "users_can_access_own_profile" ON user_profiles
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "admin_can_access_all_profiles" ON user_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

CREATE POLICY "users_can_access_own_equipment" ON equipamentos
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "admin_can_access_all_equipment" ON equipamentos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

CREATE POLICY "authenticated_can_access_used_equipment" ON equipamentos_utilizados
    FOR ALL USING (auth.uid() IS NOT NULL);

-- 4. CRIAR FUNÇÃO E TRIGGER PARA NOVOS USUÁRIOS
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, nome, status, role, created_at, approved_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
    'approved', -- Todos aprovados automaticamente
    CASE 
      WHEN NEW.email = 'entregasobral@gmail.com' THEN 'admin'
      ELSE 'user'
    END,
    NOW(),
    NOW()
  ) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    status = 'approved',
    role = CASE 
      WHEN NEW.email = 'entregasobral@gmail.com' THEN 'admin'
      ELSE user_profiles.role
    END;
  RETURN NEW;
END;
$$;

-- Criar trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 5. CRIAR USUÁRIO ADMIN SE NÃO EXISTIR
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Buscar o ID do usuário admin
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'entregasobral@gmail.com';
    
    IF admin_user_id IS NOT NULL THEN
        -- Garantir que o perfil admin existe e está correto
        INSERT INTO user_profiles (
            id, email, nome, status, role, created_at, approved_at
        ) VALUES (
            admin_user_id,
            'entregasobral@gmail.com',
            'Administrador',
            'approved',
            'admin',
            NOW(),
            NOW()
        ) ON CONFLICT (id) DO UPDATE SET
            status = 'approved',
            role = 'admin',
            nome = 'Administrador',
            approved_at = NOW();
            
        RAISE NOTICE 'Perfil admin configurado com sucesso!';
    ELSE
        RAISE NOTICE 'Usuário admin não encontrado. Faça o cadastro primeiro.';
    END IF;
END $$;

-- 6. GARANTIR PERMISSÕES
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON user_profiles TO authenticated;
GRANT ALL ON equipamentos TO authenticated;
GRANT ALL ON equipamentos_utilizados TO authenticated;

-- 7. INSERIR DADOS DE EXEMPLO (OPCIONAL)
INSERT INTO equipamentos (codigo, nome, quantidade, categoria, user_id) 
SELECT 
    'COMP001',
    'Computador Dell',
    5,
    'Informática',
    up.id
FROM user_profiles up 
WHERE up.email = 'entregasobral@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM equipamentos WHERE codigo = 'COMP001'
);

INSERT INTO equipamentos (codigo, nome, quantidade, categoria, user_id) 
SELECT 
    'PROJ001',
    'Projetor Epson',
    2,
    'Audiovisual',
    up.id
FROM user_profiles up 
WHERE up.email = 'entregasobral@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM equipamentos WHERE codigo = 'PROJ001'
);

-- 8. VERIFICAR CONFIGURAÇÃO
SELECT 'BANCO DE DADOS CONFIGURADO COM SUCESSO!' as resultado;

-- Mostrar usuários
SELECT 
    'USUÁRIOS CADASTRADOS:' as info,
    email,
    nome,
    status,
    role
FROM user_profiles
ORDER BY role DESC, email;

-- Mostrar equipamentos
SELECT 
    'EQUIPAMENTOS CADASTRADOS:' as info,
    codigo,
    nome,
    quantidade,
    categoria
FROM equipamentos
ORDER BY codigo;

-- Função de debug
CREATE OR REPLACE FUNCTION debug_database_status()
RETURNS TABLE (
    tabela TEXT,
    total_registros BIGINT,
    status TEXT
) 
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'user_profiles'::TEXT as tabela,
        COUNT(*) as total_registros,
        'OK'::TEXT as status
    FROM user_profiles
    
    UNION ALL
    
    SELECT 
        'equipamentos'::TEXT as tabela,
        COUNT(*) as total_registros,
        'OK'::TEXT as status
    FROM equipamentos
    
    UNION ALL
    
    SELECT 
        'equipamentos_utilizados'::TEXT as tabela,
        COUNT(*) as total_registros,
        'OK'::TEXT as status
    FROM equipamentos_utilizados;
END;
$$;

-- Executar debug
SELECT * FROM debug_database_status();

SELECT 'CONFIGURAÇÃO COMPLETA FINALIZADA!' as final_result;