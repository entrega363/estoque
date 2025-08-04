-- Script simples para adicionar status 'suspended'
-- Execute no Supabase SQL Editor

-- Remover constraint existente (se houver)
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_status_check;

-- Adicionar nova constraint
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_status_check 
CHECK (status IN ('pending', 'approved', 'rejected', 'suspended'));