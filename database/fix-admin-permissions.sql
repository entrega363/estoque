-- Script para diagnosticar e corrigir problemas de permissão do admin

-- 1. Verificar se o usuário admin existe na tabela auth.users
SELECT 'Usuários na tabela auth.users:' as info;
SELECT id, email, created_at, email_confirmed_at 
FROM auth.users 
WHERE email = 'entregasobral@gmail.com';

-- 2. Verificar se o perfil admin existe
SELECT 'Perfis na tabela user_profiles:' as info;
SELECT id, nome, email, role, status, created_at, approved_at 
FROM user_profiles 
WHERE email = 'entregasobral@gmail.com';

-- 3. Verificar todos os usuários
SELECT 'Todos os perfis:' as info;
SELECT id, nome, email, role, status, created_at 
FROM user_profiles 
ORDER BY created_at;

-- 4. Corrigir o usuário admin se necessário
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Buscar o ID do usuário admin
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'entregasobral@gmail.com';
    
    IF admin_user_id IS NOT NULL THEN
        -- Atualizar ou inserir o perfil admin
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
        )
        ON CONFLICT (id) DO UPDATE SET
            status = 'approved',
            role = 'admin',
            approved_at = NOW(),
            nome = 'Administrador';
            
        RAISE NOTICE 'Perfil admin atualizado com sucesso para ID: %', admin_user_id;
    ELSE
        RAISE NOTICE 'Usuário admin não encontrado na tabela auth.users';
    END IF;
END $$;

-- 5. Verificar as políticas RLS
SELECT 'Políticas RLS para user_profiles:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- 6. Testar se as políticas estão funcionando
SELECT 'Teste de acesso aos perfis:' as info;
SELECT COUNT(*) as total_profiles FROM user_profiles;

-- 7. Verificar resultado final
SELECT 'Verificação final do admin:' as info;
SELECT id, nome, email, role, status, created_at, approved_at 
FROM user_profiles 
WHERE email = 'entregasobral@gmail.com';