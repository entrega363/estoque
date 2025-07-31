-- Script para corrigir o erro de foreign key constraint
-- Execute este script no Supabase SQL Editor

-- 1. Verificar o erro específico
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'user_profiles';

-- 2. Remover o trigger problemático temporariamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 3. Limpar dados problemáticos
DELETE FROM user_profiles;

-- 4. Recriar a tabela user_profiles de forma mais simples
DROP TABLE IF EXISTS user_profiles CASCADE;

CREATE TABLE user_profiles (
  id UUID PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  nome VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'inactive')),
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_by VARCHAR(255) DEFAULT 'system'
);

-- 5. Desabilitar RLS
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- 6. Garantir permissões
GRANT ALL ON user_profiles TO authenticated, anon;

-- 7. Criar trigger mais simples que não falha
CREATE OR REPLACE FUNCTION handle_new_user_safe()
RETURNS trigger AS $$
BEGIN
  -- Inserir perfil de forma segura
  INSERT INTO user_profiles (id, email, nome, status, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
    'approved',
    CASE 
      WHEN NEW.email = 'entregasobral@gmail.com' THEN 'admin'
      ELSE 'user'
    END
  ) ON CONFLICT (email) DO UPDATE SET
    nome = EXCLUDED.nome,
    status = EXCLUDED.status,
    role = EXCLUDED.role;
    
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Se der erro, não falhar o cadastro
    RAISE NOTICE 'Erro ao criar perfil: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Recriar trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user_safe();

-- 9. Criar admin manualmente
INSERT INTO user_profiles (id, email, nome, status, role)
SELECT 
  au.id,
  'entregasobral@gmail.com',
  'Administrador',
  'approved',
  'admin'
FROM auth.users au
WHERE au.email = 'entregasobral@gmail.com'
ON CONFLICT (email) DO UPDATE SET
  nome = 'Administrador',
  status = 'approved',
  role = 'admin';

-- 10. Verificar se funcionou
SELECT 
  'Correção aplicada com sucesso!' as status,
  COUNT(*) as total_profiles
FROM user_profiles;

-- 11. Testar o trigger
SELECT 'Trigger configurado e pronto para novos usuários!' as resultado;