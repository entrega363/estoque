-- Aprovar o usuário admin
UPDATE user_profiles 
SET status = 'approved', 
    role = 'admin',
    approved_at = NOW()
WHERE email = 'entregasobral@gmail.com';

-- Verificar se foi atualizado
SELECT id, nome, email, role, status, created_at, approved_at 
FROM user_profiles 
WHERE email = 'entregasobral@gmail.com';