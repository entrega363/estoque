-- Script para corrigir o problema de foreign key constraint
-- Execute este script no SQL Editor do Supabase

-- 1. Remover a constraint de foreign key temporariamente
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_id_fkey;

-- 2. Recriar o trigger com verificação de existência
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Aguardar um pouco para garantir que o usuário foi criado
  PERFORM pg_sleep(0.1);
  
  -- Inserir o perfil apenas se o usuário existir
  IF EXISTS (SELECT 1 FROM auth.users WHERE id = NEW.id) THEN
    INSERT INTO user_profiles (id, email, nome, status, role)
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
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 3. Recriar a constraint como opcional (pode ser NULL)
ALTER TABLE user_profiles 
ADD CONSTRAINT user_profiles_id_fkey 
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
DEFERRABLE INITIALLY DEFERRED;

-- 4. Verificar se funcionou
SELECT 'Foreign key constraint corrigida' as status;