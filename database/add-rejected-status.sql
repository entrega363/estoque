-- Adicionar o status 'rejected' ao CHECK constraint da tabela user_profiles

-- Primeiro, remover o constraint existente
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_status_check;

-- Adicionar o novo constraint com 'rejected' incluído
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_status_check 
  CHECK (status IN ('pending', 'approved', 'inactive', 'rejected'));

-- Verificar se a alteração foi aplicada
SELECT 
  conname as constraint_name,
  consrc as constraint_definition
FROM pg_constraint 
WHERE conname = 'user_profiles_status_check';