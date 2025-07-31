-- Script para corrigir duplicação do perfil admin
-- Execute este script no SQL Editor do Supabase

-- 1. Remover o perfil duplicado com status 'pending'
DELETE FROM user_profiles 
WHERE email = 'entregasobral@gmail.com' 
AND status = 'pending' 
AND role = 'user';

-- 2. Verificar se ficou apenas o perfil correto
SELECT 
  id, 
  email, 
  nome, 
  status, 
  role, 
  created_at,
  approved_at
FROM user_profiles 
WHERE email = 'entregasobral@gmail.com';

-- 3. Garantir que o perfil restante está correto
UPDATE user_profiles 
SET 
  status = 'approved',
  role = 'admin',
  nome = 'Administrador',
  approved_at = NOW()
WHERE email = 'entregasobral@gmail.com';

-- 4. Verificar resultado final
SELECT 
  id, 
  email, 
  nome, 
  status, 
  role, 
  created_at,
  approved_at
FROM user_profiles 
WHERE email = 'entregasobral@gmail.com';