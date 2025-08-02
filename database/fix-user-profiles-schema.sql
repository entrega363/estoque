-- Verificar a estrutura atual da tabela
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;

-- Adicionar a coluna approved se não existir
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT false;

-- Adicionar a coluna role se não existir
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';

-- Verificar a estrutura após as alterações
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;