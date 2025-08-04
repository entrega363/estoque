-- Script para adicionar o status 'suspended' à tabela user_profiles
-- Executar este script no Supabase SQL Editor

-- Remover a constraint existente
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_status_check;

-- Adicionar nova constraint incluindo 'suspended'
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_status_check 
CHECK (status IN ('pending', 'approved', 'rejected', 'suspended'));

-- Verificar se a constraint foi criada corretamente
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name = 'user_profiles_status_check';

-- Comentário explicativo
COMMENT ON COLUMN user_profiles.status IS 'Status do usuário: pending (aguardando aprovação), approved (aprovado), rejected (rejeitado), suspended (suspenso pelo administrador)';