-- Script para corrigir a política de inserção de user_profiles
-- Execute este script no SQL Editor do Supabase

-- 1. Remover a política de inserção restritiva
DROP POLICY IF EXISTS "allow_insert_own_profile" ON user_profiles;

-- 2. Criar uma política de inserção mais permissiva para o trigger
CREATE POLICY "allow_insert_new_profile" ON user_profiles
  FOR INSERT WITH CHECK (true);

-- 3. Verificar se o trigger está funcionando corretamente
-- Recriar o trigger com SECURITY DEFINER para contornar RLS
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, nome, status, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', 'Usuário'),
    CASE 
      WHEN NEW.email = 'entregasobral@gmail.com' THEN 'approved'
      ELSE 'pending'
    END,
    CASE 
      WHEN NEW.email = 'entregasobral@gmail.com' THEN 'admin'
      ELSE 'user'
    END
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 4. Alternativa: Desabilitar temporariamente RLS para inserção via trigger
-- Se ainda não funcionar, execute também este comando:
-- ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;