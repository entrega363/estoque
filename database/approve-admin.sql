-- Aprovar o usuário admin
UPDATE user_profiles 
SET approved = true, 
    role = 'admin',
    updated_at = NOW()
WHERE email = 'entregasobral@gmail.com';

-- Verificar se foi atualizado
SELECT id, name, email, role, approved, created_at, updated_at 
FROM user_profiles 
WHERE email = 'entregasobral@gmail.com';