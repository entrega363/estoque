-- Script para aplicar a migração do campo descrição
-- Execute este script no seu banco de dados Supabase

-- Adicionar campo descrição à tabela equipamentos se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'equipamentos' 
        AND column_name = 'descricao'
    ) THEN
        ALTER TABLE equipamentos ADD COLUMN descricao TEXT;
        RAISE NOTICE 'Campo descrição adicionado com sucesso!';
    ELSE
        RAISE NOTICE 'Campo descrição já existe na tabela equipamentos.';
    END IF;
END $$;

-- Verificar se o campo foi adicionado corretamente
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'equipamentos' 
AND column_name = 'descricao';