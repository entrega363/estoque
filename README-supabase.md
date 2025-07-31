# 🗄️ Configuração do Banco de Dados - Supabase

Este guia mostra como configurar o banco de dados Supabase para o Sistema de Controle de Estoque.

## 📋 Pré-requisitos

1. Conta no [Supabase](https://supabase.com) (gratuita)
2. Projeto Next.js funcionando

## 🚀 Passo a Passo

### 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Clique em "Start your project"
3. Faça login com GitHub, Google ou email
4. Clique em "New Project"
5. Escolha sua organização
6. Preencha:
   - **Name**: `sistema-estoque`
   - **Database Password**: Crie uma senha forte
   - **Region**: Escolha a mais próxima (ex: South America)
7. Clique em "Create new project"

### 2. Configurar Tabelas

1. No painel do Supabase, vá em **SQL Editor**
2. Clique em "New query"
3. Cole o conteúdo do arquivo `database/schema.sql`:

```sql
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
```

4. Clique em "Run" para executar

### 3. Obter Chaves de API

1. No painel do Supabase, vá em **Settings** > **API**
2. Copie as seguintes informações:
   - **Project URL** (ex: `https://xyzcompany.supabase.co`)
   - **anon public** key (chave longa que começa com `eyJ...`)

### 4. Configurar Variáveis de Ambiente

1. Abra o arquivo `.env.local` na raiz do projeto
2. Substitua pelos seus valores:

```env
# Configurações do Supabase
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.SUA-CHAVE-AQUI
```

### 5. Testar Conexão

1. Reinicie o servidor de desenvolvimento:
```bash
npm run dev
```

2. Acesse o sistema e tente adicionar um equipamento
3. Verifique no Supabase se os dados foram salvos:
   - Vá em **Table Editor**
   - Clique em `equipamentos`
   - Veja se o novo item aparece

## 🔧 Funcionalidades Implementadas

✅ **CRUD Completo**
- ✅ Create: Adicionar equipamentos
- ✅ Read: Listar equipamentos
- ✅ Update: Atualizar equipamentos (em desenvolvimento)
- ✅ Delete: Remover equipamentos (em desenvolvimento)

✅ **Recursos Avançados**
- ✅ Upload de fotos (Base64)
- ✅ Validação de códigos únicos
- ✅ Busca em tempo real
- ✅ Categorização
- ✅ Fallback para localStorage

## 🛡️ Segurança

O sistema usa **Row Level Security (RLS)** do Supabase com políticas que permitem acesso total por enquanto. Para produção, considere:

1. **Autenticação**: Implementar login de usuários
2. **Políticas mais restritivas**: Limitar acesso por usuário/role
3. **Validação**: Adicionar validações no servidor

## 🚨 Troubleshooting

### Erro de Conexão
- Verifique se as variáveis de ambiente estão corretas
- Confirme se o projeto Supabase está ativo
- Teste a conexão no SQL Editor

### Dados não aparecem
- Verifique se as tabelas foram criadas corretamente
- Confirme se as políticas RLS estão configuradas
- Veja o console do navegador para erros

### Fallback para localStorage
Se o Supabase falhar, o sistema automaticamente usa localStorage como backup.

## 📊 Estrutura do Banco

### Tabela: `equipamentos`
- `id` (UUID): Chave primária
- `codigo` (VARCHAR): Código único do equipamento
- `nome` (VARCHAR): Nome do equipamento
- `quantidade` (INTEGER): Quantidade em estoque
- `categoria` (VARCHAR): Categoria do equipamento
- `foto` (TEXT): Foto em Base64
- `created_at` (TIMESTAMP): Data de criação
- `updated_at` (TIMESTAMP): Data de atualização

### Tabela: `equipamentos_utilizados`
- `id` (UUID): Chave primária
- `codigo` (VARCHAR): Código do equipamento
- `nome` (VARCHAR): Nome do equipamento
- `quantidade` (INTEGER): Quantidade utilizada
- `local` (VARCHAR): Local de uso
- `responsavel` (VARCHAR): Responsável pelo uso
- `data_uso` (DATE): Data de uso
- `observacoes` (TEXT): Observações
- `created_at` (TIMESTAMP): Data de criação
- `updated_at` (TIMESTAMP): Data de atualização

## 🎯 Próximos Passos

1. **Implementar autenticação** de usuários
2. **Adicionar funcionalidades de edição** e exclusão
3. **Criar relatórios** e estatísticas
4. **Implementar notificações** em tempo real
5. **Adicionar backup** automático dos dados

---

💡 **Dica**: Mantenha suas chaves de API seguras e nunca as compartilhe publicamente!