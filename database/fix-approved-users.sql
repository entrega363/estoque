-- Script para corrigir problemas específicos com usuários aprovados
-- Execute este script no Supabase SQL Editor

-- 1. Verificar o estado atual dos usuários aprovados
SELECT 
    up.id,
    up.email,
    up.nome,
    up.status,
    up.role,
    up.created_at,
    up.approved_at,
    au.email as auth_email,
    au.email_confirmed_at,
    au.created_at as auth_created_at
FROM user_profiles up
LEFT JOIN auth.users au ON up.id = au.id
WHERE up.status = 'approved'
ORDER BY up.created_at DESC;

-- 2. Verificar se há usuários na tabela auth.users sem perfil
SELECT 
    au.id,
    au.email,
    au.created_at,
    'SEM PERFIL' as status
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE up.id IS NULL;

-- 3. Corrigir políticas RLS para usuários normais
-- Remover políticas existentes
DROP POLICY IF EXISTS "users_can_view_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "users_can_insert_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "users_can_update_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "admin_can_manage_all_profiles" ON user_profiles;

-- Criar políticas mais permissivas para usuários aprovados
CREATE POLICY "authenticated_users_can_view_own_profile" ON user_profiles
    FOR SELECT USING (
        auth.uid() = id 
        OR 
        EXISTS (
            SELECT 1 FROM user_profiles admin_profile 
            WHERE admin_profile.id = auth.uid() 
            AND admin_profile.role = 'admin' 
            AND admin_profile.status = 'approved'
        )
    );

CREATE POLICY "authenticated_users_can_insert_own_profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "authenticated_users_can_update_own_profile" ON user_profiles
    FOR UPDATE USING (
        auth.uid() = id 
        OR 
        EXISTS (
            SELECT 1 FROM user_profiles admin_profile 
            WHERE admin_profile.id = auth.uid() 
            AND admin_profile.role = 'admin' 
            AND admin_profile.status = 'approved'
        )
    );

-- 4. Corrigir políticas para equipamentos (usuários aprovados)
DROP POLICY IF EXISTS "allow_user_own_equipment" ON equipamentos;
DROP POLICY IF EXISTS "allow_admin_all_equipment" ON equipamentos;

CREATE POLICY "approved_users_can_manage_own_equipment" ON equipamentos
    FOR ALL USING (
        user_id = auth.uid() 
        AND EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND status = 'approved'
        )
    );

CREATE POLICY "admin_can_manage_all_equipment" ON equipamentos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role = 'admin' 
            AND status = 'approved'
        )
    );

-- 5. Corrigir políticas para equipamentos utilizados
DROP POLICY IF EXISTS "allow_authenticated_equipment_used" ON equipamentos_utilizados;

CREATE POLICY "approved_users_can_manage_equipment_used" ON equipamentos_utilizados
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND status = 'approved'
        )
    );

-- 6. Criar função para testar acesso de usuário específico
CREATE OR REPLACE FUNCTION test_user_access(user_email TEXT)
RETURNS TABLE (
    test_name TEXT,
    result BOOLEAN,
    details TEXT
) AS $$
DECLARE
    test_user_id UUID;
    profile_count INTEGER;
    equipment_count INTEGER;
BEGIN
    -- Buscar ID do usuário
    SELECT id INTO test_user_id FROM auth.users WHERE email = user_email;
    
    IF test_user_id IS NULL THEN
        RETURN QUERY SELECT 'User Exists'::TEXT, FALSE, 'Usuário não encontrado na tabela auth.users'::TEXT;
        RETURN;
    END IF;
    
    RETURN QUERY SELECT 'User Exists'::TEXT, TRUE, ('ID: ' || test_user_id::TEXT)::TEXT;
    
    -- Testar acesso ao perfil
    SELECT COUNT(*) INTO profile_count 
    FROM user_profiles 
    WHERE id = test_user_id;
    
    RETURN QUERY SELECT 'Profile Access'::TEXT, (profile_count > 0), ('Perfis encontrados: ' || profile_count::TEXT)::TEXT;
    
    -- Testar acesso aos equipamentos
    SELECT COUNT(*) INTO equipment_count 
    FROM equipamentos 
    WHERE user_id = test_user_id;
    
    RETURN QUERY SELECT 'Equipment Access'::TEXT, TRUE, ('Equipamentos do usuário: ' || equipment_count::TEXT)::TEXT;
    
    -- Testar se o usuário está aprovado
    RETURN QUERY 
    SELECT 'User Approved'::TEXT, 
           EXISTS(SELECT 1 FROM user_profiles WHERE id = test_user_id AND status = 'approved'),
           COALESCE((SELECT status FROM user_profiles WHERE id = test_user_id), 'no_profile')::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Garantir que todos os usuários aprovados tenham email confirmado
UPDATE auth.users 
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE id IN (
    SELECT id FROM user_profiles WHERE status = 'approved'
) AND email_confirmed_at IS NULL;

-- 8. Criar função para aprovar usuário com todas as verificações
CREATE OR REPLACE FUNCTION approve_user_complete(user_email TEXT, admin_id UUID DEFAULT NULL)
RETURNS TEXT AS $$
DECLARE
    target_user_id UUID;
    result_message TEXT;
BEGIN
    -- Buscar usuário
    SELECT id INTO target_user_id FROM auth.users WHERE email = user_email;
    
    IF target_user_id IS NULL THEN
        RETURN 'Erro: Usuário não encontrado';
    END IF;
    
    -- Confirmar email se necessário
    UPDATE auth.users 
    SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
    WHERE id = target_user_id;
    
    -- Aprovar usuário
    UPDATE user_profiles 
    SET 
        status = 'approved',
        approved_at = NOW(),
        approved_by = COALESCE(admin_id, (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1))
    WHERE id = target_user_id;
    
    -- Verificar se foi aprovado
    IF EXISTS (SELECT 1 FROM user_profiles WHERE id = target_user_id AND status = 'approved') THEN
        result_message := 'Usuário aprovado com sucesso: ' || user_email;
    ELSE
        result_message := 'Erro ao aprovar usuário: ' || user_email;
    END IF;
    
    RETURN result_message;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Verificar se há problemas de foreign key
SELECT 
    'Equipamentos órfãos' as problema,
    COUNT(*) as quantidade
FROM equipamentos e
LEFT JOIN user_profiles up ON e.user_id = up.id
WHERE up.id IS NULL

UNION ALL

SELECT 
    'Perfis órfãos' as problema,
    COUNT(*) as quantidade
FROM user_profiles up
LEFT JOIN auth.users au ON up.id = au.id
WHERE au.id IS NULL;

-- 10. Mensagem final com instruções
SELECT 
    'INSTRUÇÕES PARA TESTE:' as titulo,
    '1. Execute: SELECT * FROM test_user_access(''email_do_usuario@exemplo.com'');' as instrucao_1,
    '2. Para aprovar usuário: SELECT approve_user_complete(''email_do_usuario@exemplo.com'');' as instrucao_2,
    '3. Verifique os logs do navegador para erros específicos' as instrucao_3;