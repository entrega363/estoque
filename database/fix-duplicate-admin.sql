-- Script de correção rápida para restaurar o admin e corrigir problemas
-- Execute este script no Supabase SQL Editor

-- 1. Primeiro, vamos verificar se há usuários duplicados na tabela auth.users
SELECT 
    email,
    COUNT(*) as count,
    array_agg(id) as user_ids
FROM auth.users 
WHERE email = 'entregasobral@gmail.com'
GROUP BY email;

-- 2. Limpar possíveis duplicatas na tabela auth.users (se existirem)
DELETE FROM auth.users 
WHERE email = 'entregasobral@gmail.com' 
AND id NOT IN (
    SELECT MIN(id) 
    FROM auth.users 
    WHERE email = 'entregasobral@gmail.com'
);

-- 3. Garantir que o admin existe na tabela auth.users
DO $$
DECLARE
    admin_id UUID;
BEGIN
    -- Verificar se o admin existe
    SELECT id INTO admin_id FROM auth.users WHERE email = 'entregasobral@gmail.com';
    
    -- Se não existir, criar
    IF admin_id IS NULL THEN
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
        
        -- Pegar o ID do admin recém-criado
        SELECT id INTO admin_id FROM auth.users WHERE email = 'entregasobral@gmail.com';
        
        RAISE NOTICE 'Admin criado com ID: %', admin_id;
    ELSE
        RAISE NOTICE 'Admin já existe com ID: %', admin_id;
    END IF;
    
    -- Garantir que o perfil do admin existe
    INSERT INTO user_profiles (
        id, email, nome, status, role, created_at, approved_at
    ) VALUES (
        admin_id,
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
        
    RAISE NOTICE 'Perfil do admin criado/atualizado';
END $$;

-- 4. Verificar se tudo está correto
SELECT 
    au.id as auth_id,
    au.email as auth_email,
    up.id as profile_id,
    up.email as profile_email,
    up.nome,
    up.status,
    up.role
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE au.email = 'entregasobral@gmail.com';

-- 5. Garantir que as permissões estão corretas
GRANT ALL ON auth.users TO authenticated;
GRANT ALL ON user_profiles TO authenticated, anon;
GRANT ALL ON equipamentos TO authenticated, anon;
GRANT ALL ON equipamentos_utilizados TO authenticated, anon;

-- 6. Resultado
SELECT 'Admin restaurado com sucesso!' as status;