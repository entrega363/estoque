# 🚀 Guia Rápido - Configurar Supabase em 5 Minutos

## 📋 Passo 1: Criar Projeto no Supabase

1. **Acesse**: https://supabase.com
2. **Clique**: "Start your project"
3. **Login**: Use GitHub (mais fácil)
4. **Clique**: "New Project"
5. **Preencha**:
   ```
   Name: sistema-estoque
   Database Password: [crie uma senha forte]
   Region: South America (São Paulo)
   ```
6. **Clique**: "Create new project"
7. **Aguarde**: 2-3 minutos para criar

---

## 🔑 Passo 2: Obter Chaves de API

1. **No painel do Supabase**, clique em **"Settings"** (⚙️)
2. **Clique em "API"** na barra lateral
3. **Copie estas informações**:
   - **Project URL** (ex: `https://abcdefghijk.supabase.co`)
   - **anon public** (chave longa que começa com `eyJ...`)

---

## ⚡ Passo 3: Configuração Automática

**Execute este comando no terminal:**
```bash
node setup-supabase.js
```

**Cole as informações quando solicitado:**
- URL do projeto
- Chave anon public

---

## 📊 Passo 4: Criar Tabelas no Banco

1. **No Supabase**, vá em **"SQL Editor"**
2. **Clique**: "New query"
3. **Cole este SQL**:

```sql
-- Criar tabela de equipamentos
CREATE TABLE IF NOT EXISTS equipamentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  quantidade INTEGER NOT NULL DEFAULT 0,
  categoria VARCHAR(100) NOT NULL,
  foto TEXT,
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

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_equipamentos_codigo ON equipamentos(codigo);
CREATE INDEX IF NOT EXISTS idx_equipamentos_categoria ON equipamentos(categoria);

-- Dados de exemplo
INSERT INTO equipamentos (codigo, nome, quantidade, categoria) VALUES
  ('ATT-X200304', 'Notebook Dell Inspiron', 5, 'Informatica'),
  ('ATT-X200305', 'Monitor Samsung 24"', 8, 'Informatica'),
  ('ATT-X200306', 'Mouse Logitech', 12, 'Perifericos'),
  ('ATT-X200307', 'Teclado Mecânico', 7, 'Perifericos'),
  ('ATT-X200308', 'Impressora HP LaserJet', 3, 'Impressao')
ON CONFLICT (codigo) DO NOTHING;

-- Configurar segurança
ALTER TABLE equipamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipamentos_utilizados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir tudo em equipamentos" ON equipamentos FOR ALL USING (true);
CREATE POLICY "Permitir tudo em equipamentos_utilizados" ON equipamentos_utilizados FOR ALL USING (true);
```

4. **Clique**: "Run"

---

## 🎯 Passo 5: Testar

1. **Reinicie o servidor**:
   ```bash
   npm run dev
   ```

2. **Acesse**: http://localhost:3000

3. **Teste**: Adicione um equipamento

4. **Verifique**: No Supabase > Table Editor > equipamentos

---

## ✅ Pronto!

Seu sistema agora está conectado ao banco de dados na nuvem!

### 🔧 Se algo der errado:

- **Erro de conexão**: Verifique as chaves no `.env.local`
- **Tabelas não criadas**: Execute o SQL novamente
- **Dados não aparecem**: Verifique o console do navegador

### 📞 Precisa de ajuda?

Me chame que eu te ajudo a resolver qualquer problema!