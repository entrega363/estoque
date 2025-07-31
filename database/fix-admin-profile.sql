-- Script para garantir que o admin sempre funcione
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se o admin existe na tabela auth.users
DO $$
DECLARE
    admin_user_id UUID;
    admin_exists BOOLEAN := FALSE;
BEGIN
    -- Verificar se o usuário admin existe
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'entregasobral@gmail.com';
    
    IF admin_user_id IS NOT NULL THEN
        admin_exists := TRUE;
        RAISE NOTICE 'Admin encontrado na auth.users: %', admin_user_id;
    ELSE
        RAISE NOTICE 'Admin NÃO encontrado na auth.users';
    END IF;
    
    -- Se o admin existe, garantir que o perfil esteja correto
    IF admin_exists THEN
        -- Inserir ou atualizar o perfil do admin
        INSERT INTO user_profiles (
            id, email, nome, status, role, created_at, approved_at
        ) VALUES (
            admin_user_id,
            'entregasobral@gmail.com',
            'Administrador',
            'approved',
            'admin',
            NOW(),
            NOW()
        ) ON CONFLICT (id) DO UPDATE SET
            email = 'entregasobral@gmail.com',
            nome = 'Administrador',
            status = 'approved',
            role = 'admin',
            approved_at = NOW();
            
        RAISE NOTICE 'Perfil do admin criado/atualizado com sucesso';
    END IF;
END $$;

-- 2. Criar política especial para o admin que sempre funciona
DROP POLICY IF EXISTS "admin_always_access" ON user_profiles;
CREATE POLICY "admin_always_access" ON user_profiles
    FOR ALL USING (
        auth.jwt() ->> 'email' = 'entregasobral@gmail.com'
        OR 
        (auth.uid() IS NOT NULL AND EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND email = 'entregasobral@gmail.com'
        ))
    );

-- 3. Garantir que o admin tenha acesso a todos os equipamentos
DROP POLICY IF EXISTS "admin_equipment_access" ON equipamentos;
CREATE POLICY "admin_equipment_access" ON equipamentos
    FOR ALL USING (
        auth.jwt() ->> 'email' = 'entregasobral@gmail.com'
        OR 
        (auth.uid() IS NOT NULL AND EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND email = 'entregasobral@gmail.com'
        ))
    );

-- 4. Garantir que o admin tenha acesso aos equipamentos utilizados
DROP POLICY IF EXISTS "admin_equipment_used_access" ON equipamentos_utilizados;
CREATE POLICY "admin_equipment_used_access" ON equipamentos_utilizados
    FOR ALL USING (
        auth.jwt() ->> 'email' = 'entregasobral@gmail.com'
        OR 
        (auth.uid() IS NOT NULL AND EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND email = 'entregasobral@gmail.com'
        ))
    );

-- 5. Verificar se o admin pode acessar seu perfil
SELECT 
    'Teste de acesso do admin' as teste,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM user_profiles up
            JOIN auth.users au ON up.id = au.id
            WHERE au.email = 'entregasobral@gmail.com'
            AND up.status = 'approved'
            AND up.role = 'admin'
        ) THEN 'SUCESSO: Admin pode acessar'
        ELSE 'ERRO: Admin não pode acessar'
    END as resultado;

-- 6. Mostrar informações do admin
SELECT 
    au.id as auth_id,
    au.email as auth_email,
    au.created_at as auth_created,
    up.id as profile_id,
    up.email as profile_email,
    up.nome,
    up.status,
    up.role,
    up.created_at as profile_created
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE au.email = 'entregasobral@gmail.com';

-- 7. Resultado final
SELECT 'Admin corrigido com sucesso!' as status;