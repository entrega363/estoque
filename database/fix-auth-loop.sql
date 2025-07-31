-- Script para corrigir problemas de loop de autenticação
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se o usuário admin existe e está configurado corretamente
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Buscar o ID do usuário admin
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'entregasobral@gmail.com';
    
    IF admin_user_id IS NULL THEN
        RAISE NOTICE 'Usuário admin não encontrado na tabela auth.users';
    ELSE
        RAISE NOTICE 'Usuário admin encontrado: %', admin_user_id;
        
        -- Verificar se o perfil existe
        IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE id = admin_user_id) THEN
            RAISE NOTICE 'Criando perfil para usuário admin...';
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
            );
        ELSE
            RAISE NOTICE 'Atualizando perfil do usuário admin...';
            UPDATE user_profiles 
            SET 
                status = 'approved',
                role = 'admin',
                approved_at = COALESCE(approved_at, NOW())
            WHERE id = admin_user_id;
        END IF;
    END IF;
END $$;

-- 2. Verificar e corrigir políticas RLS
-- Remover políticas existentes que podem estar causando problemas
DROP POLICY IF EXISTS "allow_select_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "allow_insert_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "allow_update_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "allow_admin_all_profiles" ON user_profiles;

-- Criar políticas mais simples e robustas
CREATE POLICY "users_can_view_own_profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_can_insert_own_profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "users_can_update_own_profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Política especial para admin ver todos os perfis
CREATE POLICY "admin_can_manage_all_profiles" ON user_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role = 'admin' 
            AND status = 'approved'
        )
    );

-- 3. Verificar se há usuários com status inconsistente
UPDATE user_profiles 
SET status = 'approved' 
WHERE email = 'entregasobral@gmail.com' AND status != 'approved';

-- 4. Criar função para debug de autenticação
CREATE OR REPLACE FUNCTION debug_auth_status()
RETURNS TABLE (
    user_id UUID,
    email TEXT,
    auth_user_exists BOOLEAN,
    profile_exists BOOLEAN,
    profile_status TEXT,
    profile_role TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        au.id as user_id,
        au.email::TEXT,
        TRUE as auth_user_exists,
        (up.id IS NOT NULL) as profile_exists,
        COALESCE(up.status, 'no_profile')::TEXT as profile_status,
        COALESCE(up.role, 'no_profile')::TEXT as profile_role
    FROM auth.users au
    LEFT JOIN user_profiles up ON au.id = up.id
    WHERE au.email = 'entregasobral@gmail.com'
    
    UNION ALL
    
    SELECT 
        up.id as user_id,
        up.email::TEXT,
        (au.id IS NOT NULL) as auth_user_exists,
        TRUE as profile_exists,
        up.status::TEXT,
        up.role::TEXT
    FROM user_profiles up
    LEFT JOIN auth.users au ON up.id = au.id
    WHERE up.email = 'entregasobral@gmail.com'
    AND au.id IS NULL; -- Perfis órfãos
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Executar debug para verificar o estado atual
SELECT * FROM debug_auth_status();

-- 6. Garantir que o trigger está funcionando
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO user_profiles (id, email, nome, status, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'nome', 'Usuário'),
        CASE 
            WHEN NEW.email = 'entregasobral@gmail.com' THEN 'approved'
            ELSE 'pending'
        END,
        CASE 
            WHEN NEW.email = 'entregasobral@gmail.com' THEN 'admin'
            ELSE 'user'
        END
    ) ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        status = CASE 
            WHEN NEW.email = 'entregasobral@gmail.com' THEN 'approved'
            ELSE user_profiles.status
        END,
        role = CASE 
            WHEN NEW.email = 'entregasobral@gmail.com' THEN 'admin'
            ELSE user_profiles.role
        END;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recriar o trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 7. Verificar se as tabelas têm as permissões corretas
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON user_profiles TO authenticated;
GRANT ALL ON equipamentos TO authenticated;
GRANT ALL ON equipamentos_utilizados TO authenticated;

-- Mensagem final
SELECT 'Script de correção executado com sucesso!' as resultado;