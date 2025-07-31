-- Criar tabela de equipamentos
CREATE TABLE IF NOT EXISTS equipamentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  quantidade INTEGER NOT NULL DEFAULT 0,
  categoria VARCHAR(100) NOT NULL,
  foto TEXT, -- Base64 da imagem ou URL
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
CREATE INDEX IF NOT EXISTS idx_equipamentos_utilizados_codigo ON equipamentos_utilizados(codigo);
CREATE INDEX IF NOT EXISTS idx_equipamentos_utilizados_responsavel ON equipamentos_utilizados(responsavel);

-- Inserir dados de exemplo
INSERT INTO equipamentos (codigo, nome, quantidade, categoria) VALUES
  ('ATT-X200304', 'Notebook Dell Inspiron', 5, 'Informatica'),
  ('ATT-X200305', 'Monitor Samsung 24"', 8, 'Informatica'),
  ('ATT-X200306', 'Mouse Logitech', 12, 'Perifericos'),
  ('ATT-X200307', 'Teclado Mecânico', 7, 'Perifericos'),
  ('ATT-X200308', 'Impressora HP LaserJet', 3, 'Impressao')
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO equipamentos_utilizados (codigo, nome, quantidade, local, responsavel, data_uso, observacoes) VALUES
  ('ATT-X200301', 'Notebook Dell XPS', 1, 'Sala de Reunião A', 'João Silva', '2024-01-15', 'Para apresentação cliente'),
  ('ATT-X200302', 'Projetor Epson', 1, 'Auditório Principal', 'Maria Santos', '2024-01-14', 'Evento corporativo')
ON CONFLICT DO NOTHING;

-- Habilitar RLS (Row Level Security) - opcional, para segurança
ALTER TABLE equipamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipamentos_utilizados ENABLE ROW LEVEL SECURITY;

-- Criar políticas de acesso (permitir tudo por enquanto - ajuste conforme necessário)
CREATE POLICY "Permitir tudo em equipamentos" ON equipamentos FOR ALL USING (true);
CREATE POLICY "Permitir tudo em equipamentos_utilizados" ON equipamentos_utilizados FOR ALL USING (true);