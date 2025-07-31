-- Solução alternativa: Desabilitar RLS temporariamente para user_profiles
-- Execute este script se o anterior não resolver

-- 1. Desabilitar RLS na tabela user_profiles
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- 2. Recriar o trigger mais simples
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
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
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 3. Reabilitar RLS com políticas mais simples
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas mais permissivas
DROP POLICY IF EXISTS "allow_select_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "allow_insert_new_profile" ON user_profiles;
DROP POLICY IF EXISTS "allow_update_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "allow_admin_all_profiles" ON user_profiles;

-- Política para ver próprio perfil
CREATE POLICY "select_own_profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Política para atualizar próprio perfil  
CREATE POLICY "update_own_profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Política para inserção (mais permissiva)
CREATE POLICY "insert_profile" ON user_profiles
  FOR INSERT WITH CHECK (true);

-- Política para admin ver/editar tudo
CREATE POLICY "admin_all_access" ON user_profiles
  FOR ALL USING (
    auth.jwt() ->> 'email' = 'entregasobral@gmail.com'
  );