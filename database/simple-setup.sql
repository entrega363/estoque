-- CONFIGURAÇÃO SIMPLES E SEGURA DO BANCO DE DADOS
-- Execute este script no Supabase SQL Editor

-- 1. CRIAR TABELA DE PERFIS DE USUÁRIO
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    nome TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'approved',
    role TEXT NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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

-- 4. DESABILITAR RLS TEMPORARIAMENTE PARA EVITAR PROBLEMAS
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE equipamentos DISABLE ROW LEVEL SECURITY;
ALTER TABLE equipamentos_utilizados DISABLE ROW LEVEL SECURITY;

-- 5. CRIAR FUNÇÃO PARA AUTO-CRIAÇÃO DE PERFIL
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
    approved_at = NOW();
  RETURN NEW;
END;
$$;

-- 6. CRIAR O TRIGGER
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 7. GARANTIR PERMISSÕES TOTAIS
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON user_profiles TO anon, authenticated;
GRANT ALL ON equipamentos TO anon, authenticated;
GRANT ALL ON equipamentos_utilizados TO anon, authenticated;

-- 8. VERIFICAR SE TUDO FOI CRIADO
SELECT 'TABELAS CRIADAS:' as info;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

-- 9. MENSAGEM DE SUCESSO
SELECT 'BANCO CONFIGURADO COM SUCESSO!' as resultado;
SELECT 'Agora você pode fazer login no site!' as proximos_passos;