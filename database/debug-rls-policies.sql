-- Debug das políticas RLS para user_profiles

-- 1. Verificar se RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'user_profiles';

-- 2. Listar todas as políticas da tabela user_profiles
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- 3. Verificar se o usuário admin existe e tem as permissões corretas
SELECT 
    id,
    email,
    nome,
    status,
    role,
    created_at
FROM user_profiles 
WHERE email = 'entregasobral@gmail.com';

-- 4. Contar total de usuários (deve funcionar para admin)
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
    COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive,
    COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins
FROM user_profiles;

-- 5. Listar todos os usuários (teste de permissão)
SELECT 
    id,
    email,
    nome,
    status,
    role,
    created_at
FROM user_profiles 
ORDER BY created_at DESC;

-- 6. Verificar se a política de admin está funcionando
-- (Execute este comando logado como entregasobral@gmail.com)
SELECT current_setting('request.jwt.claims', true);