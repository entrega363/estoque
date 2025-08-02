-- Remover todas as políticas existentes para user_profiles
DROP POLICY IF EXISTS "allow_select_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "allow_insert_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "allow_update_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "allow_admin_all_profiles" ON user_profiles;

-- Criar políticas mais simples e funcionais
-- Política para usuários verem seu próprio perfil
CREATE POLICY "users_can_view_own_profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Política para usuários criarem seu próprio perfil
CREATE POLICY "users_can_insert_own_profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Política para usuários atualizarem seu próprio perfil
CREATE POLICY "users_can_update_own_profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Política especial para o admin específico (usando email diretamente)
CREATE POLICY "admin_can_do_everything" ON user_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'entregasobral@gmail.com'
    )
  );

-- Garantir que o usuário admin existe e está configurado corretamente
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Buscar o ID do usuário admin
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'entregasobral@gmail.com';
    
    IF admin_user_id IS NOT NULL THEN
        -- Inserir ou atualizar o perfil admin
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
            
        RAISE NOTICE 'Perfil admin configurado com ID: %', admin_user_id;
    ELSE
        RAISE NOTICE 'ERRO: Usuário admin não encontrado na tabela auth.users';
    END IF;
END $$;

-- Verificar o resultado
SELECT 'Admin configurado:' as status;
SELECT id, nome, email, role, status, created_at, approved_at 
FROM user_profiles 
WHERE email = 'entregasobral@gmail.com';