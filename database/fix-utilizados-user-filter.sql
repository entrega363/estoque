-- Script para corrigir filtro de equipamentos utilizados por usuário
-- Execute este script no SQL Editor do Supabase

-- Adicionar coluna user_id se não existir
ALTER TABLE equipamentos_utilizados 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_equipamentos_utilizados_user_id 
ON equipamentos_utilizados(user_id);

-- Remover políticas antigas
DROP POLICY IF EXISTS "allow_authenticated_equipment_used" ON equipamentos_utilizados;
DROP POLICY IF EXISTS "users_own_used_equipment" ON equipamentos_utilizados;
DROP POLICY IF EXISTS "users_insert_own_used_equipment" ON equipamentos_utilizados;

-- Nova política: usuários só veem seus próprios equipamentos utilizados
CREATE POLICY "users_own_used_equipment" ON equipamentos_utilizados
  FOR ALL USING (auth.uid() = user_id);

-- Política para inserção
CREATE POLICY "users_insert_own_used_equipment" ON equipamentos_utilizados
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Comentário na coluna
COMMENT ON COLUMN equipamentos_utilizados.user_id IS 'ID do usuário que retirou o equipamento';

-- Verificar se a tabela existe e mostrar estrutura
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'equipamentos_utilizados' 
ORDER BY ordinal_position;