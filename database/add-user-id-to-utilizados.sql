-- Adicionar campo user_id à tabela equipamentos_utilizados
-- para filtrar equipamentos por usuário

-- Adicionar coluna user_id
ALTER TABLE equipamentos_utilizados 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_equipamentos_utilizados_user_id 
ON equipamentos_utilizados(user_id);

-- Atualizar política RLS para filtrar por usuário
DROP POLICY IF EXISTS "allow_authenticated_equipment_used" ON equipamentos_utilizados;

-- Nova política: usuários só veem seus próprios equipamentos utilizados
CREATE POLICY "users_own_used_equipment" ON equipamentos_utilizados
  FOR ALL USING (auth.uid() = user_id);

-- Política para inserção
CREATE POLICY "users_insert_own_used_equipment" ON equipamentos_utilizados
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Comentário
COMMENT ON COLUMN equipamentos_utilizados.user_id IS 'ID do usuário que retirou o equipamento';