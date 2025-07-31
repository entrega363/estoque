-- Script para corrigir as políticas RLS e resolver o erro de recursão infinita
-- Execute este script no SQL Editor do Supabase

-- 1. Remover todas as políticas existentes
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON user_profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON user_profiles;
DROP POLICY IF EXISTS "Admins podem ver todos os perfis" ON user_profiles;
DROP POLICY IF EXISTS "Admins podem atualizar todos os perfis" ON user_profiles;
DROP POLICY IF EXISTS "Permitir inserção de novos perfis" ON user_profiles;

DROP POLICY IF EXISTS "Usuários podem ver seus próprios equipamentos" ON equipamentos;
DROP POLICY IF EXISTS "Usuários podem inserir seus próprios equipamentos" ON equipamentos;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios equipamentos" ON equipamentos;
DROP POLICY IF EXISTS "Usuários podem deletar seus próprios equipamentos" ON equipamentos;
DROP POLICY IF EXISTS "Admins podem ver todos os equipamentos" ON equipamentos;
DROP POLICY IF EXISTS "Usuários podem gerenciar seus próprios equipamentos" ON equipamentos;
DROP POLICY IF EXISTS "Admins podem gerenciar todos os equipamentos" ON equipamentos;

DROP POLICY IF EXISTS "Usuários aprovados podem gerenciar equipamentos utilizados" ON equipamentos_utilizados;
DROP POLICY IF EXISTS "Usuários podem gerenciar equipamentos utilizados" ON equipamentos_utilizados;
DROP POLICY IF EXISTS "Admins podem gerenciar todos equipamentos utilizados" ON equipamentos_utilizados;

-- 2. Criar políticas simplificadas para user_profiles
CREATE POLICY "allow_select_own_profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "allow_insert_own_profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "allow_update_own_profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Política especial para admin (usando email diretamente)
CREATE POLICY "allow_admin_all_profiles" ON user_profiles
  FOR ALL USING (
    auth.jwt() ->> 'email' = 'entregasobral@gmail.com'
  );

-- 3. Criar políticas simplificadas para equipamentos
CREATE POLICY "allow_user_own_equipment" ON equipamentos
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "allow_admin_all_equipment" ON equipamentos
  FOR ALL USING (
    auth.jwt() ->> 'email' = 'entregasobral@gmail.com'
  );

-- 4. Criar políticas simplificadas para equipamentos_utilizados
CREATE POLICY "allow_authenticated_equipment_used" ON equipamentos_utilizados
  FOR ALL USING (auth.uid() IS NOT NULL);

-- 5. Recriar o trigger para criação automática de perfil
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 6. Verificar se o admin já existe e criar se necessário
DO $$
DECLARE
  admin_exists boolean;
BEGIN
  -- Verificar se já existe um usuário admin
  SELECT EXISTS(
    SELECT 1 FROM auth.users WHERE email = 'entregasobral@gmail.com'
  ) INTO admin_exists;
  
  -- Se não existir, criar o usuário admin
  IF NOT admin_exists THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'entregasobral@gmail.com',
      crypt('tenderbr0', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    );
  END IF;
END $$;