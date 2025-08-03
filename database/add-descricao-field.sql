-- Adicionar campo descrição à tabela equipamentos
ALTER TABLE equipamentos 
ADD COLUMN IF NOT EXISTS descricao TEXT;

-- Verificar se o campo foi adicionado
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'equipamentos' 
AND column_name = 'descricao';