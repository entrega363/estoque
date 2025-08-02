-- SOLUÇÃO DRÁSTICA - DESABILITAR RLS TEMPORARIAMENTE
-- Execute este script no Supabase SQL Editor

-- 1. Desabilitar RLS na tabela user_profiles temporariamente
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- 2. Remover todas as políticas problemáticas
DROP POLICY IF EXISTS "allow_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "allow_admin_all" ON user_profiles;
DROP POLICY IF EXISTS "users_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "admin_all_profiles" ON user_profiles;
DROP POLICY IF EXISTS "authenticated_users_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "admin_full_access" ON user_profiles;
DROP POLICY IF EXISTS "users_can_view_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "users_can_insert_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "users_can_update_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "admin_can_manage_all_profiles" ON user_profiles;

-- 3. Garantir que todos os usuários estão aprovados
UPDATE user_profiles SET status = 'approved' WHERE status != 'approved';

-- 4. Verificar resultado
SELECT 'RLS DESABILITADO - TODOS PODEM ACESSAR AGORA!' as resultado;
SELECT email, status, role FROM user_profiles ORDER BY email;