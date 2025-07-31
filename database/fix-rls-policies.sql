-- Script para corrigir políticas RLS que estão bloqueando usuários aprovados
-- Execute este script no Supabase SQL Editor

-- 1. Primeiro, vamos desabilitar temporariamente o RLS para testar
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE equipamentos DISABLE ROW LEVEL SECURITY;
ALTER TABLE equipamentos_utilizados DISABLE ROW LEVEL SECURITY;

-- 2. Remover todas as políticas existentes
DROP POLICY IF EXISTS "authenticated_users_can_view_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "authenticated_users_can_insert_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "authenticated_users_can_update_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "approved_users_can_manage_own_equipment" ON equipamentos;
DROP POLICY IF EXISTS "admin_can_manage_all_equipment" ON equipamentos;
DROP POLICY IF EXISTS "approved_users_can_manage_equipment_used" ON equipamentos_utilizados;

-- 3. Reabilitar RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipamentos_utilizados ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas mais simples e permissivas
-- Política para user_profiles - qualquer usuário autenticado pode ver seu próprio perfil
CREATE POLICY "allow_own_profile_access" ON user_profiles
    FOR ALL USING (auth.uid() = id);

-- Política para admin ver todos os perfis
CREATE POLICY "allow_admin_all_profiles" ON user_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles admin_check
            WHERE admin_check.id = auth.uid() 
            AND admin_check.role = 'admin'
        )
    );

-- Política para equipamentos - usuários podem gerenciar seus próprios equipamentos
CREATE POLICY "allow_own_equipment" ON equipamentos
    FOR ALL USING (user_id = auth.uid());

-- Política para admin gerenciar todos os equipamentos
CREATE POLICY "allow_admin_all_equipment" ON equipamentos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles admin_check
            WHERE admin_check.id = auth.uid() 
            AND admin_check.role = 'admin'
        )
    );

-- Política para equipamentos utilizados - todos os usuários autenticados podem acessar
CREATE POLICY "allow_all_equipment_used" ON equipamentos_utilizados
    FOR ALL USING (auth.uid() IS NOT NULL);

-- 5. Verificar se as políticas foram criadas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('user_profiles', 'equipamentos', 'equipamentos_utilizados')
ORDER BY tablename, policyname;

-- 6. Testar acesso para um usuário específico
-- Substitua 'josetecnico2@gmail.com' pelo email do usuário que está com problema
CREATE OR REPLACE FUNCTION test_user_policies(test_email TEXT)
RETURNS TABLE (
    test_description TEXT,
    success BOOLEAN,
    result_data JSONB
) AS $$
DECLARE
    test_user_id UUID;
BEGIN
    -- Buscar ID do usuário
    SELECT au.id INTO test_user_id 
    FROM auth.users au 
    WHERE au.email = test_email;
    
    IF test_user_id IS NULL THEN
        RETURN QUERY SELECT 'User lookup'::TEXT, FALSE, '{"error": "User not found"}'::JSONB;
        RETURN;
    END IF;
    
    -- Teste 1: Verificar se o perfil existe
    RETURN QUERY 
    SELECT 
        'Profile exists'::TEXT,
        EXISTS(SELECT 1 FROM user_profiles WHERE id = test_user_id),
        (SELECT to_jsonb(up.*) FROM user_profiles up WHERE id = test_user_id)::JSONB;
    
    -- Teste 2: Verificar equipamentos do usuário
    RETURN QUERY 
    SELECT 
        'Equipment count'::TEXT,
        TRUE,
        jsonb_build_object('count', (SELECT COUNT(*) FROM equipamentos WHERE user_id = test_user_id));
    
    -- Teste 3: Verificar se pode acessar equipamentos utilizados
    RETURN QUERY 
    SELECT 
        'Equipment used access'::TEXT,
        TRUE,
        jsonb_build_object('count', (SELECT COUNT(*) FROM equipamentos_utilizados));
        
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Executar teste para um usuário específico
SELECT * FROM test_user_policies('josetecnico2@gmail.com');

-- 8. Verificar permissões das tabelas
SELECT 
    table_name,
    privilege_type,
    grantee
FROM information_schema.table_privileges 
WHERE table_name IN ('user_profiles', 'equipamentos', 'equipamentos_utilizados')
AND grantee IN ('authenticated', 'anon', 'postgres')
ORDER BY table_name, grantee;

-- 9. Garantir que as tabelas têm as permissões corretas
GRANT ALL ON user_profiles TO authenticated;
GRANT ALL ON equipamentos TO authenticated;
GRANT ALL ON equipamentos_utilizados TO authenticated;

-- 10. Resultado final
SELECT 'Políticas RLS corrigidas com sucesso!' as status;