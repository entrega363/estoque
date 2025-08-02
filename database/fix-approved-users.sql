-- SCRIPT SEGURO - APENAS APROVAR USUÁRIOS EXISTENTES
-- Execute este script no Supabase SQL Editor

-- 1. Aprovar todos os usuários que já existem na tabela
UPDATE user_profiles 
SET 
    status = 'approved', 
    approved_at = COALESCE(approved_at, NOW())
WHERE status != 'approved';

-- 2. Garantir que o admin está configurado corretamente
UPDATE user_profiles 
SET 
    status = 'approved',
    role = 'admin',
    nome = 'Administrador',
    approved_at = COALESCE(approved_at, NOW())
WHERE email = 'entregasobral@gmail.com';

-- 3. Verificar o resultado
SELECT 
    email,
    nome,
    status,
    role,
    CASE 
        WHEN status = 'approved' THEN '✅ APROVADO - PODE FAZER LOGIN'
        ELSE '❌ NÃO APROVADO'
    END as situacao
FROM user_profiles
ORDER BY 
    CASE WHEN role = 'admin' THEN 1 ELSE 2 END,
    email;

-- 4. Contar usuários aprovados
SELECT 
    COUNT(*) as total_usuarios,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) as usuarios_aprovados,
    COUNT(CASE WHEN role = 'admin' THEN 1 END) as administradores
FROM user_profiles;

-- 5. Mensagem de sucesso
SELECT 'TODOS OS USUÁRIOS EXISTENTES FORAM APROVADOS!' as resultado;