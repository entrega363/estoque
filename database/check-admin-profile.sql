-- Script para verificar se o perfil do admin existe e está correto
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se o usuário admin existe na tabela auth.users
SELECT 
  id, 
  email, 
  created_at,
  email_confirmed_at
FROM auth.users 
WHERE email = 'entregasobral@gmail.com';

-- 2. Verificar se o perfil do admin existe na tabela user_profiles
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

-- 3. Se não existir perfil, criar manualmente
INSERT INTO user_profiles (id, email, nome, status, role, created_at, approved_at)
SELECT 
  u.id,
  u.email,
  'Administrador',
  'approved',
  'admin',
  NOW(),
  NOW()
FROM auth.users u
WHERE u.email = 'entregasobral@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM user_profiles p WHERE p.id = u.id
);

-- 4. Verificar novamente
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