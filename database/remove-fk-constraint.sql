-- Script para remover constraint de foreign key que pode estar causando problemas
-- Execute este script no Supabase SQL Editor

-- 1. Verificar constraints existentes
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
AND tc.table_name IN ('user_profiles', 'equipamentos');

-- 2. Remover constraint problemática se existir
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_approved_by_fkey;

-- 3. Limpar todos os dados existentes
DELETE FROM equipamentos_utilizados;
DELETE FROM equipamentos;
DELETE FROM user_profiles;

-- 4. Recriar tabela user_profiles sem foreign key problemática
DROP TABLE IF EXISTS user_profiles CASCADE;

CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  nome VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'inactive')),
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_by VARCHAR(255) DEFAULT 'system'
);

-- 5. Desabilitar RLS completamente
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE equipamentos DISABLE ROW LEVEL SECURITY;
ALTER TABLE equipamentos_utilizados DISABLE ROW LEVEL SECURITY;

-- 6. Garantir permissões completas
GRANT ALL ON user_profiles TO authenticated, anon;
GRANT ALL ON equipamentos TO authenticated, anon;
GRANT ALL ON equipamentos_utilizados TO authenticated, anon;

-- 7. Criar trigger simples para auto-aprovar usuários
CREATE OR REPLACE FUNCTION handle_new_user_simple()
RETURNS trigger AS $$
BEGIN
  INSERT INTO user_profiles (id, email, nome, status, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
    'approved', -- Auto-aprovar todos os usuários
    CASE 
      WHEN NEW.email = 'entregasobral@gmail.com' THEN 'admin'
      ELSE 'user'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recriar trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user_simple();

-- 8. Resultado
SELECT 'Banco limpo e reconfigurado com sucesso!' as status;