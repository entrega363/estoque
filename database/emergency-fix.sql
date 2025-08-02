-- CORREÇÃO EMERGENCIAL - SCRIPT SUPER SIMPLES
-- Execute este script no Supabase SQL Editor

-- 1. Aprovar todos os usuários existentes
UPDATE user_profiles 
SET status = 'approved', approved_at = NOW()
WHERE status != 'approved';

-- 2. Garantir que o admin está correto
UPDATE user_profiles 
SET 
    status = 'approved',
    role = 'admin',
    nome = 'Administrador'
WHERE email = 'entregasobral@gmail.com';

-- 3. Criar perfis para usuários que não têm
INSERT INTO user_profiles (id, email, nome, status, role, created_at)
SELECT 
    au.id,
    au.email,
    split_part(au.email, '@', 1) as nome,
    'approved' as status,
    CASE 
        WHEN au.email = 'entregasobral@gmail.com' THEN 'admin'
        ELSE 'user'
    END as role,
    NOW() as created_at
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM user_profiles up WHERE up.id = au.id
);

-- 4. Verificar resultado
SELECT 
    au.email,
    up.status,
    up.role,
    CASE 
        WHEN up.status = 'approved' THEN 'PODE FAZER LOGIN'
        ELSE 'NÃO PODE FAZER LOGIN'
    END as situacao
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
ORDER BY au.created_at DESC;

-- 5. Mensagem final
SELECT 'TODOS OS USUÁRIOS FORAM APROVADOS!' as resultado;