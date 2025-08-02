-- CORREÇÃO PARA ERRO DE CHAVE DUPLICADA
-- Execute este script no Supabase SQL Editor

-- 1. Primeiro, vamos ver o que está acontecendo
SELECT 'Verificando usuários duplicados:' as info;
SELECT email, COUNT(*) as quantidade
FROM user_profiles 
GROUP BY email 
HAVING COUNT(*) > 1;

-- 2. Verificar todos os usuários
SELECT 
    up.email,
    up.status,
    up.role,
    up.created_at,
    au.id as auth_id
FROM user_profiles up
LEFT JOIN auth.users au ON up.id = au.id
ORDER BY up.email;

-- 3. Aprovar APENAS os usuários existentes (sem inserir novos)
UPDATE user_profiles 
SET status = 'approved', approved_at = NOW()
WHERE status != 'approved';

-- 4. Garantir que o admin principal está correto
UPDATE user_profiles 
SET 
    status = 'approved',
    role = 'admin',
    nome = 'Administrador'
WHERE email = 'entregasobral@gmail.com';

-- 5. Verificar se há usuários do auth sem perfil (sem tentar inserir)
SELECT 'Usuários do auth sem perfil:' as info;
SELECT 
    au.email,
    au.id
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE up.id IS NULL;

-- 6. Resultado final - mostrar todos os usuários
SELECT 
    COALESCE(au.email, up.email) as email,
    up.status,
    up.role,
    CASE 
        WHEN up.status = 'approved' THEN '✅ PODE FAZER LOGIN'
        WHEN up.status IS NULL THEN '❌ SEM PERFIL'
        ELSE '⏳ PENDENTE'
    END as situacao
FROM auth.users au
FULL OUTER JOIN user_profiles up ON au.id = up.id
ORDER BY email;

-- 7. Mensagem final
SELECT 'USUÁRIOS EXISTENTES FORAM APROVADOS!' as resultado;