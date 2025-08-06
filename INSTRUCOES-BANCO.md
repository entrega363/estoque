# 🗄️ INSTRUÇÕES PARA ATUALIZAR O BANCO DE DADOS

## ⚠️ IMPORTANTE: Execute este script SQL no Supabase

Para corrigir o problema dos equipamentos utilizados aparecerem para todos os usuários, você precisa executar o script SQL no banco de dados.

### 📋 PASSOS:

1. **Acesse o Supabase Dashboard:**
   - Vá para: https://supabase.com
   - Faça login na sua conta
   - Selecione o projeto do sistema de estoque

2. **Abra o SQL Editor:**
   - No menu lateral, clique em "SQL Editor"
   - Clique em "New Query"

3. **Execute este script SQL:**

```sql
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
```

4. **Clique em "Run" para executar**

### ✅ RESULTADO ESPERADO:

Após executar o script:
- Cada usuário verá apenas os equipamentos que ele próprio retirou
- A página "Equipamentos Utilizados" será individual por usuário
- Maior privacidade e segurança dos dados

### 🔍 COMO TESTAR:

1. Faça login com um usuário
2. Retire alguns equipamentos do estoque
3. Vá para "Equipamentos Utilizados"
4. Deve ver apenas os equipamentos que você retirou
5. Faça login com outro usuário - não deve ver os equipamentos do primeiro usuário

---

**EXECUTE O SCRIPT SQL ACIMA NO SUPABASE PARA CORRIGIR O PROBLEMA!**