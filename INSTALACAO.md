# 🛠️ Guia de Instalação - Sistema de Controle de Estoque

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js 18+** - [Download](https://nodejs.org/)
- **npm** ou **yarn** - Vem com Node.js
- **Git** - [Download](https://git-scm.com/)
- **Conta no Supabase** - [Criar conta](https://supabase.com/)
- **Conta no Vercel** - [Criar conta](https://vercel.com/) (opcional, para deploy)

## 🚀 Instalação Local

### 1. Clonar o Repositório

```bash
git clone https://github.com/entrega363/estoque.git
cd estoque
```

### 2. Instalar Dependências

```bash
npm install
```

### 3. Configurar Supabase

#### 3.1 Criar Projeto no Supabase
1. Acesse [supabase.com](https://supabase.com/)
2. Clique em "New Project"
3. Escolha organização e nome do projeto
4. Defina senha do banco de dados
5. Selecione região (preferencialmente próxima)
6. Clique em "Create new project"

#### 3.2 Obter Credenciais
1. No dashboard do Supabase, vá em **Settings → API**
2. Copie:
   - **Project URL**
   - **anon public key**

#### 3.3 Configurar Banco de Dados
1. Vá em **SQL Editor** no Supabase
2. Execute os scripts na ordem:

**Primeiro - Estrutura das tabelas:**
```sql
-- Cole o conteúdo de database/schema.sql
```

**Segundo - Criar usuário admin:**
```sql
-- Cole o conteúdo de database/approve-admin.sql
```

### 4. Configurar Variáveis de Ambiente

Crie o arquivo `.env.local` na raiz do projeto:

```bash
cp .env.example .env.local
```

Edite `.env.local` com suas credenciais:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
```

### 5. Executar o Projeto

```bash
npm run dev
```

Acesse: `http://localhost:3000`

## 🔐 Configuração de Autenticação

### Credenciais de Admin Padrão:
- **Email:** entregasobral@gmail.com
- **Senha:** tenderbr0

### Alterar Credenciais do Admin:

1. **Via SQL Editor no Supabase:**
```sql
-- Alterar email
UPDATE auth.users 
SET email = 'seu-novo-email@exemplo.com' 
WHERE email = 'entregasobral@gmail.com';

UPDATE user_profiles 
SET email = 'seu-novo-email@exemplo.com' 
WHERE email = 'entregasobral@gmail.com';

-- Alterar senha (via dashboard do Supabase)
-- Vá em Authentication → Users → Clique no usuário → Reset Password
```

## 🚀 Deploy no Vercel

### Opção 1: Deploy Automático (Recomendado)

1. **Conectar GitHub ao Vercel:**
   - Acesse [vercel.com](https://vercel.com/)
   - Faça login com GitHub
   - Clique em "New Project"
   - Selecione o repositório `estoque`

2. **Configurar Variáveis de Ambiente:**
   - Em **Environment Variables**, adicione:
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://seu-projeto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = sua_chave_anonima
   ```

3. **Deploy:**
   - Clique em "Deploy"
   - Aguarde o build (2-3 minutos)
   - Seu site estará disponível!

### Opção 2: Deploy via CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

## 🔧 Configurações Avançadas

### Configurar CORS (se necessário)

No `next.config.js`:
```javascript
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: '*' },
        { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
        { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
      ],
    },
  ]
}
```

### Configurar Domínio Personalizado

1. No Vercel, vá em **Settings → Domains**
2. Adicione seu domínio
3. Configure DNS conforme instruções
4. Aguarde propagação (até 24h)

## 🐛 Solução de Problemas

### Erro: "Module not found"
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Erro: "Supabase connection failed"
1. Verifique as variáveis de ambiente
2. Confirme se o projeto Supabase está ativo
3. Teste a conexão no SQL Editor

### Erro: "Build failed on Vercel"
1. Verifique logs de build no Vercel
2. Confirme se todas as variáveis estão configuradas
3. Teste build local: `npm run build`

### Usuário não consegue fazer login
1. Verifique se está na tabela `user_profiles`
2. Confirme se `status = 'approved'`
3. Execute script de correção se necessário

## 📊 Verificar Instalação

### Checklist de Verificação:

- [ ] ✅ Projeto clonado e dependências instaladas
- [ ] ✅ Supabase configurado e tabelas criadas
- [ ] ✅ Variáveis de ambiente configuradas
- [ ] ✅ Servidor local funcionando (`npm run dev`)
- [ ] ✅ Login com admin funcionando
- [ ] ✅ Cadastro de usuário funcionando
- [ ] ✅ Aprovação de usuário funcionando
- [ ] ✅ Deploy no Vercel realizado (opcional)

### Comandos de Teste:

```bash
# Testar build local
npm run build

# Testar conexão com Supabase
node test-supabase.js

# Verificar tipos TypeScript
npm run type-check
```

## 📞 Suporte

Se encontrar problemas durante a instalação:

1. **Verifique a documentação:** [DOCUMENTACAO-SISTEMA.md](./DOCUMENTACAO-SISTEMA.md)
2. **Consulte troubleshooting:** [Seção de problemas](./DOCUMENTACAO-SISTEMA.md#troubleshooting)
3. **Abra uma issue:** [GitHub Issues](https://github.com/entrega363/estoque/issues)
4. **Entre em contato:** entregasobral@gmail.com

## 🎯 Próximos Passos

Após a instalação bem-sucedida:

1. **Leia o guia do usuário:** [Guia do Usuário](./DOCUMENTACAO-SISTEMA.md#guia-do-usuário)
2. **Configure usuários:** Aprove cadastros pendentes
3. **Personalize o sistema:** Altere cores, logos, textos
4. **Configure backup:** Implemente rotina de backup
5. **Monitore logs:** Configure alertas de erro

---

**🎉 Parabéns! Seu Sistema de Controle de Estoque está pronto para uso!**