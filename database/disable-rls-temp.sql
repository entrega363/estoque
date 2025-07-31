-- SOLUÇÃO TEMPORÁRIA: Desabilitar RLS completamente para testar
-- Execute este script se o anterior não resolver

-- Desabilitar RLS em todas as tabelas
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE equipamentos DISABLE ROW LEVEL SECURITY;
ALTER TABLE equipamentos_utilizados DISABLE ROW LEVEL SECURITY;

-- Garantir permissões completas
GRANT ALL ON user_profiles TO authenticated, anon;
GRANT ALL ON equipamentos TO authenticated, anon;
GRANT ALL ON equipamentos_utilizados TO authenticated, anon;

-- Verificar se funcionou
SELECT 
    'RLS desabilitado temporariamente' as status,
    'Teste agora com usuários aprovados' as instrucao;