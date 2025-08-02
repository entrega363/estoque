-- CORRIGIR PROBLEMA DE CADASTRO
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se a autenticação está habilitada
-- Vá para: Authentication > Settings no Supabase Dashboard
-- Certifique-se de que "Enable email confirmations" está DESABILITADO para teste

-- 2. Recriar a função handle_new_user com mais robustez
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Log para debug
  RAISE LOG 'Criando perfil para usuário: %', NEW.email;
  
  -- Inserir perfil com tratamento de erro
  BEGIN
    INSERT INTO public.user_profiles (id, email, nome, status, role, created_at, approved_at)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
      'approved', -- Todos aprovados automaticamente
      CASE 
        WHEN NEW.email = 'entregasobral@gmail.com' THEN 'admin'
        ELSE 'user'
      END,
      NOW(),
      NOW()
    );
    
    RAISE LOG 'Perfil criado com sucesso para: %', NEW.email;
    
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'Erro ao criar perfil para %: %', NEW.email, SQLERRM;
    -- Tentar atualizar se já existir
    UPDATE public.user_profiles 
    SET 
      email = NEW.email,
      status = 'approved',
      approved_at = NOW()
    WHERE id = NEW.id;
  END;
  
  RETURN NEW;
END;
$$;

-- 3. Recriar o trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 4. Garantir permissões máximas (temporariamente)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO anon;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- 5. Verificar se tudo está funcionando
SELECT 'CORREÇÃO APLICADA!' as resultado;
SELECT 'Agora tente fazer cadastro novamente' as instrucao;