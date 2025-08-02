-- CRIAR USUÁRIO ADMIN DIRETAMENTE NO BANCO
-- Execute este script no Supabase SQL Editor

-- 1. Primeiro, vamos criar o perfil admin diretamente
-- (Isso vai permitir testar o login sem depender do cadastro)

-- Gerar um UUID para o admin (você pode usar qualquer UUID válido)
-- Vamos usar um UUID fixo para o admin
DO $$
DECLARE
    admin_uuid UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
    -- Inserir perfil admin diretamente
    INSERT INTO user_profiles (id, email, nome, status, role, created_at, approved_at)
    VALUES (
        admin_uuid,
        'entregasobral@gmail.com',
        'Administrador',
        'approved',
        'admin',
        NOW(),
        NOW()
    ) ON CONFLICT (email) DO UPDATE SET
        status = 'approved',
        role = 'admin',
        approved_at = NOW();
    
    RAISE NOTICE 'Perfil admin criado/atualizado com sucesso!';
END $$;

-- 2. Verificar se foi criado
SELECT 'Verificando perfil admin:' as info;
SELECT id, email, nome, status, role 
FROM user_profiles 
WHERE email = 'entregasobral@gmail.com';

-- 3. Criar alguns dados de exemplo para testar
INSERT INTO equipamentos (codigo, nome, quantidade, categoria, user_id) 
SELECT 
    'EQ001',
    'Notebook Dell',
    5,
    'Informática',
    up.id
FROM user_profiles up 
WHERE up.email = 'entregasobral@gmail.com'
ON CONFLICT DO NOTHING;

INSERT INTO equipamentos (codigo, nome, quantidade, categoria, user_id) 
SELECT 
    'EQ002',
    'Projetor Epson',
    2,
    'Audiovisual',
    up.id
FROM user_profiles up 
WHERE up.email = 'entregasobral@gmail.com'
ON CONFLICT DO NOTHING;

-- 4. Verificar dados criados
SELECT 'Equipamentos de exemplo:' as info;
SELECT codigo, nome, quantidade, categoria 
FROM equipamentos 
LIMIT 5;

-- 5. Mensagem final
SELECT 'ADMIN CRIADO DIRETAMENTE!' as resultado;
SELECT 'Agora tente fazer LOGIN (não cadastro) com:' as instrucao;
SELECT 'Email: entregasobral@gmail.com' as email;
SELECT 'Senha: tenderbr0' as senha;