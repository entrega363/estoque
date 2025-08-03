-- Script para corrigir a tabela equipamentos e adicionar campo descrição

-- 1. Verificar estrutura atual da tabela
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'equipamentos' 
ORDER BY ordinal_position;

-- 2. Adicionar campo descrição se não existir
ALTER TABLE equipamentos 
ADD COLUMN IF NOT EXISTS descricao TEXT;

-- 3. Verificar se o campo foi adicionado
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'equipamentos' 
AND column_name = 'descricao';

-- 4. Verificar dados existentes
SELECT COUNT(*) as total_equipamentos FROM equipamentos;

-- 5. Mostrar alguns registros para teste
SELECT id, codigo, nome, descricao, quantidade, categoria, user_id, created_at 
FROM equipamentos 
ORDER BY created_at DESC 
LIMIT 5;