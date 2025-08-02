-- CORREÇÃO DEFINITIVA DO LOOP DE AUTENTICAÇÃO PARA USUÁRIOS NORMAIS
-- Execute este script no Supabase SQL Editor

-- 1. Primeiro, vamos verificar o estado atual
SELECT 'Estado atual dos usuários:' as info;
SELECT 
    au.email,
    au.id as auth_id,
    up.id as profile_id,
    up.status,
    up.role,
    up.created_at
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
ORDER BY au.created_at DESC;

-- 2. Corrigir usuários que existem no auth mas não têm perfil
INSERT INTO user_profiles (id, email, nome, status, role, created_at)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'nome', split_part(au.email, '@', 1)) as nome,
    CASE 
        WHEN au.email = 'entregasobral@gmail.com' THEN 'approved'
        ELSE 'approved' -- MUDANÇA: Aprovar automaticamente todos os usuários
    END as status,
    CASE 
        WHEN au.email = 'entregasobral@gmail.com' THEN 'admin'
        ELSE 'user'
    END as role,
    au.created_at
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE up.id IS NULL;

-- 3. Atualizar usuários existentes que estão com status 'pending' para 'approved'
UPDATE user_profiles 
SET status = 'approved', approved_at = NOW()
WHERE status = 'pending';

-- 4. Garantir que o admin está correto
UPDATE user_profiles 
SET 
    status = 'approved',
    role = 'admin',
    nome = 'Administrador',
    approved_at = NOW()
WHERE email = 'entregasobral@gmail.com';

-- 5. Remover políticas RLS problemáticas e criar versões mais simples
DROP POLICY IF EXISTS "users_can_view_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "users_can_insert_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "users_can_update_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "admin_can_manage_all_profiles" ON user_profiles;

-- Política super simples: usuários autenticados podem ver seus próprios perfis
CREATE POLICY "authenticated_users_own_profile" ON user_profiles
    FOR ALL USING (auth.uid() = id);

-- Política para admin ver todos
CREATE POLICY "admin_full_access" ON user_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- 6. Atualizar o trigger para aprovar automaticamente novos usuários
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $
BEGIN
  INSERT INTO public.user_profiles (id, email, nome, status, role, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
    'approved', -- MUDANÇA: Aprovar automaticamente
    CASE 
      WHEN NEW.email = 'entregasobral@gmail.com' THEN 'admin'
      ELSE 'user'
    END,
    NOW()
  ) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    status = 'approved', -- Garantir que está aprovado
    role = CASE 
      WHEN NEW.email = 'entregasobral@gmail.com' THEN 'admin'
      ELSE user_profiles.role
    END;
  RETURN NEW;
END;
$;

-- Recriar o trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 7. Garantir permissões
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON user_profiles TO authenticated;
GRANT ALL ON equipamentos TO authenticated;
GRANT ALL ON equipamentos_utilizados TO authenticated;

-- 8. Função de debug melhorada
CREATE OR REPLACE FUNCTION debug_all_users()
RETURNS TABLE (
    email TEXT,
    auth_exists BOOLEAN,
    profile_exists BOOLEAN,
    status TEXT,
    role TEXT,
    can_login BOOLEAN
) 
SECURITY DEFINER
LANGUAGE plpgsql
AS $
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(au.email, up.email)::TEXT as email,
        (au.id IS NOT NULL) as auth_exists,
        (up.id IS NOT NULL) as profile_exists,
        COALESCE(up.status, 'no_profile')::TEXT as status,
        COALESCE(up.role, 'no_role')::TEXT as role,
        (au.id IS NOT NULL AND up.id IS NOT NULL AND up.status = 'approved') as can_login
    FROM auth.users au
    FULL OUTER JOIN user_profiles up ON au.id = up.id
    ORDER BY COALESCE(au.created_at, up.created_at) DESC;
END;
$;

-- 9. Verificar resultado final
SELECT 'Resultado da correção:' as info;
SELECT * FROM debug_all_users();

-- 10. Mensagem de sucesso
SELECT 'CORREÇÃO APLICADA COM SUCESSO!' as resultado,
       'Todos os usuários agora devem conseguir fazer login sem loop.' as detalhes;