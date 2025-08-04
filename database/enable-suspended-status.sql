-- Script para habilitar o status 'suspended' na tabela user_profiles
-- Execute este script no Supabase SQL Editor

-- Primeiro, vamos ver as constraints atuais
SELECT 
    tc.constraint_name, 
    cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'user_profiles' 
    AND tc.constraint_type = 'CHECK';

-- Remover todas as constraints de check na coluna status
DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    FOR constraint_record IN 
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE table_name = 'user_profiles' 
        AND constraint_type = 'CHECK'
    LOOP
        EXECUTE 'ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS ' || constraint_record.constraint_name;
    END LOOP;
END $$;

-- Adicionar a nova constraint com todos os status incluindo 'suspended'
ALTER TABLE user_profiles 
ADD CONSTRAINT user_profiles_status_check 
CHECK (status IN ('pending', 'approved', 'rejected', 'suspended'));

-- Verificar se funcionou
SELECT 
    tc.constraint_name, 
    cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'user_profiles' 
    AND tc.constraint_type = 'CHECK';