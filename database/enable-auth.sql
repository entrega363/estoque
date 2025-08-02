-- HABILITAR AUTENTICAÇÃO NO SUPABASE
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se as tabelas de autenticação existem
SELECT 'Verificando tabelas de autenticação...' as info;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'auth' 
ORDER BY table_name;

-- 2. Verificar configurações atuais
SELECT 'Configurações atuais:' as info;
SELECT * FROM auth.users LIMIT 1;

-- 3. Garantir que a função handle_new_user está funcionando
SELECT 'Testando função handle_new_user...' as info;
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'handle_new_user';

-- 4. Verificar triggers
SELECT 'Verificando triggers...' as info;
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
OR event_object_schema = 'auth';

-- 5. Verificar permissões nas tabelas
SELECT 'Verificando permissões...' as info;
SELECT grantee, table_name, privilege_type 
FROM information_schema.table_privileges 
WHERE table_schema = 'public' 
AND grantee IN ('anon', 'authenticated');

-- 6. Mensagem final
SELECT 'VERIFICAÇÃO COMPLETA!' as resultado;
SELECT 'Se houver problemas, verifique as configurações do Supabase Auth' as dica;