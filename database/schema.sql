-- Criar tabela de perfis de usuário
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  nome VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'inactive')),
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES user_profiles(id)
);

-- Criar tabela de equipamentos (com user_id)
CREATE TABLE IF NOT EXISTS equipamentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo VARCHAR(50) NOT NULL,
  nome VARCHAR(255) NOT NULL,
  quantidade INTEGER NOT NULL DEFAULT 0,
  categoria VARCHAR(100) NOT NULL,
  foto TEXT, -- Base64 da imagem ou URL
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(codigo, user_id) -- Código único por usuário
);

-- Criar tabela de equipamentos utilizados
CREATE TABLE IF NOT EXISTS equipamentos_utilizados (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo VARCHAR(50) NOT NULL,
  nome VARCHAR(255) NOT NULL,
  quantidade INTEGER NOT NULL DEFAULT 1,
  local VARCHAR(255) NOT NULL,
  responsavel VARCHAR(255) NOT NULL,
  data_uso DATE NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_equipamentos_codigo ON equipamentos(codigo);
CREATE INDEX IF NOT EXISTS idx_equipamentos_categoria ON equipamentos(categoria);
CREATE INDEX IF NOT EXISTS idx_equipamentos_user_id ON equipamentos(user_id);
CREATE INDEX IF NOT EXISTS idx_equipamentos_utilizados_codigo ON equipamentos_utilizados(codigo);
CREATE INDEX IF NOT EXISTS idx_equipamentos_utilizados_responsavel ON equipamentos_utilizados(responsavel);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON user_profiles(status);

-- Habilitar RLS (Row Level Security)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipamentos_utilizados ENABLE ROW LEVEL SECURITY;

-- Políticas para user_profiles
CREATE POLICY "Usuários podem ver seu próprio perfil" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins podem ver todos os perfis" ON user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role = 'admin' 
      AND status = 'approved'
    )
  );

CREATE POLICY "Admins podem atualizar todos os perfis" ON user_profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role = 'admin' 
      AND status = 'approved'
    )
  );

CREATE POLICY "Permitir inserção de novos perfis" ON user_profiles
  FOR INSERT WITH CHECK (true);

-- Políticas para equipamentos
CREATE POLICY "Usuários podem ver seus próprios equipamentos" ON equipamentos
  FOR SELECT USING (
    user_id = auth.uid() AND 
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND status = 'approved'
    )
  );

CREATE POLICY "Usuários podem inserir seus próprios equipamentos" ON equipamentos
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND 
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND status = 'approved'
    )
  );

CREATE POLICY "Usuários podem atualizar seus próprios equipamentos" ON equipamentos
  FOR UPDATE USING (
    user_id = auth.uid() AND 
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND status = 'approved'
    )
  );

CREATE POLICY "Usuários podem deletar seus próprios equipamentos" ON equipamentos
  FOR DELETE USING (
    user_id = auth.uid() AND 
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND status = 'approved'
    )
  );

CREATE POLICY "Admins podem ver todos os equipamentos" ON equipamentos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role = 'admin' 
      AND status = 'approved'
    )
  );

-- Políticas para equipamentos_utilizados
CREATE POLICY "Usuários aprovados podem gerenciar equipamentos utilizados" ON equipamentos_utilizados
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND status = 'approved'
    )
  );

-- Função para criar usuário admin automaticamente
CREATE OR REPLACE FUNCTION create_admin_user()
RETURNS void AS $$
BEGIN
  -- Inserir o usuário admin se não existir
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'entregasobral@gmail.com',
    crypt('tenderbr0', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  ) ON CONFLICT (email) DO NOTHING;

  -- Inserir perfil admin
  INSERT INTO user_profiles (
    id,
    email,
    nome,
    status,
    role,
    created_at,
    approved_at
  ) 
  SELECT 
    id,
    'entregasobral@gmail.com',
    'Administrador',
    'approved',
    'admin',
    NOW(),
    NOW()
  FROM auth.users 
  WHERE email = 'entregasobral@gmail.com'
  ON CONFLICT (id) DO UPDATE SET
    status = 'approved',
    role = 'admin',
    approved_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Executar a função para criar o admin
SELECT create_admin_user();

-- Trigger para criar perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO user_profiles (id, email, nome, status, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', 'Usuário'),
    CASE 
      WHEN NEW.email = 'entregasobral@gmail.com' THEN 'approved'
      ELSE 'pending'
    END,
    CASE 
      WHEN NEW.email = 'entregasobral@gmail.com' THEN 'admin'
      ELSE 'user'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();