-- Adicionar status 'suspended' à tabela user_profiles
-- Este status será usado quando o administrador suspender uma conta

-- Primeiro, vamos verificar se o status já existe
DO $$
BEGIN
    -- Adicionar o status 'suspended' se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'user_profiles_status_check'
        AND check_clause LIKE '%suspended%'
    ) THEN
        -- Remover a constraint existente
        ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_status_check;
        
        -- Adicionar nova constraint com o status 'suspended'
        ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_status_check 
        CHECK (status IN ('pending', 'approved', 'rejected', 'suspended'));
    END IF;
END $$;

-- Comentário explicativo
COMMENT ON COLUMN user_profiles.status IS 'Status do usuário: pending (aguardando aprovação), approved (aprovado), rejected (rejeitado), suspended (suspenso pelo administrador)';