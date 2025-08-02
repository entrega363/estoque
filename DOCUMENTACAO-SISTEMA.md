# 📋 Documentação Completa - Sistema de Controle de Estoque

## 🌐 Informações Gerais

**Nome:** Sistema de Controle de Estoque  
**Versão:** 1.0.0  
**URL de Produção:** https://estoque-sistema-kapinfsjh-entregasobrals-projects.vercel.app  
**Tecnologias:** Next.js 15, React 19, TypeScript, Supabase, Tailwind CSS  
**Deploy:** Vercel  

---

## 📑 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura do Sistema](#arquitetura-do-sistema)
3. [Funcionalidades](#funcionalidades)
4. [Estrutura do Banco de Dados](#estrutura-do-banco-de-dados)
5. [Autenticação e Autorização](#autenticação-e-autorização)
6. [Interface do Usuário](#interface-do-usuário)
7. [API e Serviços](#api-e-serviços)
8. [Configuração e Deploy](#configuração-e-deploy)
9. [Guia do Usuário](#guia-do-usuário)
10. [Guia do Administrador](#guia-do-administrador)
11. [Troubleshooting](#troubleshooting)
12. [Manutenção](#manutenção)

---

## 🎯 Visão Geral

O Sistema de Controle de Estoque é uma aplicação web moderna desenvolvida para gerenciar inventários de equipamentos e produtos. O sistema oferece controle de acesso baseado em roles, aprovação de usuários e interface intuitiva para operações de estoque.

### Principais Características:
- ✅ Sistema de autenticação seguro
- ✅ Controle de acesso baseado em roles (Admin/Usuário)
- ✅ Aprovação manual de novos usuários
- ✅ Gerenciamento completo de estoque
- ✅ Interface responsiva e moderna
- ✅ Deploy automático na nuvem

---

## 🏗️ Arquitetura do Sistema

### Stack Tecnológico:

**Frontend:**
- Next.js 15 (React Framework)
- React 19 (UI Library)
- TypeScript (Type Safety)
- Tailwind CSS (Styling)
- Remix Icons (Iconografia)

**Backend:**
- Supabase (Backend as a Service)
- PostgreSQL (Database)
- Row Level Security (RLS)
- Real-time subscriptions

**Deploy:**
- Vercel (Hosting)
- GitHub (Version Control)
- Automatic deployments

### Estrutura de Pastas:
```
├── app/                    # Next.js App Router
│   ├── (auth)/            # Rotas de autenticação
│   ├── sistema/           # Dashboard principal
│   ├── gerenciar-usuarios/ # Painel admin
│   ├── adicionar/         # Adicionar produtos
│   └── api/               # API routes
├── components/            # Componentes reutilizáveis
├── lib/                   # Utilitários e configurações
├── database/              # Scripts SQL
└── public/                # Assets estáticos
```

---

## ⚙️ Funcionalidades

### 🔐 Autenticação
- **Cadastro de usuários** com validação de email
- **Login seguro** com sessão persistente
- **Logout** com limpeza de sessão
- **Recuperação de senha** (via Supabase)

### 👥 Gerenciamento de Usuários
- **Aprovação manual** de novos usuários
- **Sistema de roles** (Admin/Usuário)
- **Status de usuário** (Pending/Approved/Inactive)
- **Painel administrativo** para gerenciar usuários

### 📦 Controle de Estoque
- **Adicionar produtos** com código, nome, quantidade, categoria
- **Upload de fotos** dos produtos
- **Listagem de produtos** com filtros
- **Controle por usuário** (cada usuário vê seus produtos)
- **Relatórios** de estoque

### 🎨 Interface
- **Design responsivo** para desktop e mobile
- **Tema moderno** com gradientes e sombras
- **Feedback visual** para ações do usuário
- **Loading states** e animações suaves

---

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais:

#### `user_profiles`
```sql
- id (UUID, PK) - Referência ao auth.users
- email (VARCHAR) - Email do usuário
- nome (VARCHAR) - Nome completo
- status (ENUM) - pending, approved, inactive
- role (ENUM) - admin, user
- created_at (TIMESTAMP) - Data de criação
- approved_at (TIMESTAMP) - Data de aprovação
- approved_by (UUID) - Quem aprovou
```

#### `equipamentos`
```sql
- id (UUID, PK) - Identificador único
- codigo (VARCHAR) - Código do produto
- nome (VARCHAR) - Nome do produto
- quantidade (INTEGER) - Quantidade em estoque
- categoria (VARCHAR) - Categoria do produto
- foto (TEXT) - Base64 da imagem
- user_id (UUID, FK) - Proprietário do produto
- created_at (TIMESTAMP) - Data de criação
- updated_at (TIMESTAMP) - Última atualização
```

#### `equipamentos_utilizados`
```sql
- id (UUID, PK) - Identificador único
- codigo (VARCHAR) - Código do equipamento
- nome (VARCHAR) - Nome do equipamento
- quantidade (INTEGER) - Quantidade utilizada
- local (VARCHAR) - Local de uso
- responsavel (VARCHAR) - Responsável pelo uso
- data_uso (DATE) - Data de utilização
- observacoes (TEXT) - Observações
- created_at (TIMESTAMP) - Data de registro
```

### Políticas RLS (Row Level Security):

**user_profiles:**
- Usuários podem ver/editar apenas seu próprio perfil
- Admins podem ver/editar todos os perfis

**equipamentos:**
- Usuários podem ver/editar apenas seus próprios equipamentos
- Admins podem ver todos os equipamentos

**equipamentos_utilizados:**
- Todos os usuários autenticados podem acessar

---

## 🔒 Autenticação e Autorização

### Fluxo de Autenticação:

1. **Cadastro:**
   - Usuário preenche formulário (nome, email, senha)
   - Supabase cria conta na tabela `auth.users`
   - Trigger automático cria perfil em `user_profiles`
   - Status inicial: `pending`

2. **Aprovação:**
   - Admin acessa painel de gerenciamento
   - Aprova ou rejeita usuários pendentes
   - Status muda para `approved` ou `inactive`

3. **Login:**
   - Verificação de credenciais via Supabase Auth
   - Verificação de status `approved`
   - Redirecionamento baseado no role

### Roles e Permissões:

**Admin:**
- Acesso total ao sistema
- Pode aprovar/rejeitar usuários
- Pode alterar roles de outros usuários
- Vê todos os equipamentos (opcional)

**User:**
- Acesso ao sistema após aprovação
- Pode gerenciar apenas seus equipamentos
- Não pode acessar painel administrativo

---

## 🎨 Interface do Usuário

### Páginas Principais:

#### 🏠 Página Inicial (`/`)
- Landing page com informações do sistema
- Links para login e cadastro
- Design atrativo com call-to-action

#### 🔐 Login (`/login`)
- Formulário de autenticação
- Validação em tempo real
- Feedback de erros
- Botão vermelho personalizado
- Informações de acesso admin

#### 📝 Cadastro (`/cadastro`)
- Formulário de registro
- Validação de campos
- Confirmação de senha
- Termos de uso

#### ⏳ Aguardando Aprovação (`/aguardando-aprovacao`)
- Página de espera para usuários pendentes
- Informações sobre o processo de aprovação
- Opção de logout

#### 🏢 Sistema (`/sistema`)
- Dashboard principal
- Cards de navegação
- Status do sistema
- Informações do usuário logado
- Debug info (temporário)

#### 👥 Gerenciar Usuários (`/gerenciar-usuarios`)
- Lista de todos os usuários
- Estatísticas de usuários
- Ações de aprovação/rejeição
- Alteração de roles
- Filtros e busca

#### ➕ Adicionar Produto (`/adicionar`)
- Formulário de cadastro de produtos
- Upload de imagem
- Validação de código único
- Categorização

### Componentes Visuais:

**Design System:**
- **Cores:** Gradientes azul/índigo, verde, vermelho, laranja
- **Tipografia:** Inter font, hierarquia clara
- **Espaçamento:** Sistema baseado em 4px
- **Sombras:** Múltiplas camadas para profundidade
- **Bordas:** Arredondadas (8px, 12px, 16px)

**Componentes:**
- Cards com hover effects
- Botões com estados (normal, hover, disabled)
- Formulários com validação visual
- Loading spinners
- Toasts de feedback
- Modais responsivos

---

## 🔧 API e Serviços

### Serviços Principais:

#### `authService`
```typescript
- signIn(email, password) - Fazer login
- signUp(email, password, nome) - Cadastrar usuário
- signOut() - Fazer logout
- getCurrentUser() - Obter usuário atual
- getSession() - Obter sessão ativa
```

#### `userService`
```typescript
- getUserProfile(userId) - Buscar perfil
- getAllUsers() - Listar todos usuários (admin)
- updateUserStatus(userId, status) - Alterar status
- updateUserRole(userId, role) - Alterar role
- approveUser(userId, adminId) - Aprovar usuário
```

#### `equipmentService`
```typescript
- getAll() - Listar equipamentos
- create(equipment) - Criar equipamento
- update(id, updates) - Atualizar equipamento
- delete(id) - Deletar equipamento
- checkCodeExists(codigo) - Verificar código único
```

### Configuração Supabase:

**Variáveis de Ambiente:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://rtajuzunzkoamruejtim.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Configurações RLS:**
- Habilitado em todas as tabelas
- Políticas específicas por role
- Segurança a nível de linha

---

## 🚀 Configuração e Deploy

### Desenvolvimento Local:

1. **Clonar repositório:**
```bash
git clone https://github.com/entrega363/estoque.git
cd estoque
```

2. **Instalar dependências:**
```bash
npm install
```

3. **Configurar variáveis:**
```bash
cp .env.example .env.local
# Editar .env.local com suas credenciais
```

4. **Executar desenvolvimento:**
```bash
npm run dev
```

### Deploy Vercel:

**Automático via GitHub:**
- Push para branch `main` dispara deploy
- Build automático com Next.js
- Variáveis de ambiente configuradas no painel

**Manual via CLI:**
```bash
vercel login
vercel --prod
```

### Configurações de Build:

**next.config.js:**
```javascript
- ESLint desabilitado no build
- Headers CORS configurados
- Otimizações para Supabase
```

**vercel.json:**
```json
- Framework: Next.js
- Build command: npm run build
- Output directory: .next
- Variáveis de ambiente
```

---

## 👤 Guia do Usuário

### Como Começar:

1. **Acessar o sistema:**
   - Vá para: https://estoque-sistema-kapinfsjh-entregasobrals-projects.vercel.app

2. **Criar conta:**
   - Clique em "Cadastre-se"
   - Preencha: nome, email, senha
   - Confirme o cadastro

3. **Aguardar aprovação:**
   - Sua conta ficará pendente
   - Aguarde aprovação do administrador
   - Você receberá acesso após aprovação

4. **Fazer login:**
   - Use email e senha cadastrados
   - Acesse o dashboard principal

### Usando o Sistema:

**Dashboard Principal:**
- Visão geral do sistema
- Acesso rápido às funcionalidades
- Status do seu estoque

**Adicionar Produtos:**
- Clique em "Adicionar Produto"
- Preencha: código, nome, quantidade, categoria
- Adicione foto (opcional)
- Salve o produto

**Gerenciar Estoque:**
- Visualize seus produtos
- Edite informações
- Controle quantidades
- Organize por categorias

---

## 👨‍💼 Guia do Administrador

### Credenciais de Admin:
- **Email:** entregasobral@gmail.com
- **Senha:** tenderbr0

### Funcionalidades Administrativas:

**Gerenciar Usuários:**
1. Acesse "Gerenciar Usuários" no dashboard
2. Visualize lista de usuários pendentes
3. Aprove ou rejeite cadastros
4. Altere roles (admin/usuário)
5. Desative usuários se necessário

**Estatísticas:**
- Total de usuários
- Usuários aprovados/pendentes
- Administradores ativos
- Produtos no sistema

**Ações Disponíveis:**
- ✅ Aprovar usuário
- ❌ Rejeitar usuário
- 👑 Tornar administrador
- 👤 Remover privilégios admin
- 🔒 Desativar conta

### Páginas de Debug:

**Debug Usuários (`/debug-usuarios`):**
- Informações técnicas
- Estado da sessão
- Testes de funcionalidade
- Logs detalhados

**Test Admin (`/test-admin`):**
- Verificação de permissões
- Teste de acesso
- Diagnóstico de problemas

---

## 🔧 Troubleshooting

### Problemas Comuns:

**1. Usuário não consegue fazer login:**
- Verificar se está aprovado (status = approved)
- Confirmar credenciais corretas
- Limpar cache do navegador

**2. Card "Gerenciar Usuários" não aparece:**
- Verificar se role = admin
- Fazer logout e login novamente
- Verificar no /test-admin

**3. Erro de build no Vercel:**
- Verificar tipos TypeScript
- Confirmar variáveis de ambiente
- Revisar logs de build

**4. Problemas de permissão no banco:**
- Verificar políticas RLS
- Confirmar usuário na tabela user_profiles
- Executar scripts de correção

### Scripts de Correção:

**Aprovar admin:**
```sql
UPDATE user_profiles 
SET status = 'approved', role = 'admin' 
WHERE email = 'entregasobral@gmail.com';
```

**Verificar usuários:**
```sql
SELECT id, nome, email, role, status 
FROM user_profiles 
ORDER BY created_at;
```

**Recriar políticas RLS:**
```bash
# Execute: database/fix-rls-admin.sql
```

---

## 🛠️ Manutenção

### Tarefas Regulares:

**Diárias:**
- Monitorar logs de erro
- Verificar novos cadastros
- Aprovar usuários pendentes

**Semanais:**
- Backup do banco de dados
- Análise de performance
- Atualização de dependências

**Mensais:**
- Limpeza de dados antigos
- Revisão de segurança
- Otimização de queries

### Monitoramento:

**Métricas Importantes:**
- Tempo de resposta das páginas
- Taxa de erro de login
- Número de usuários ativos
- Uso de storage

**Logs Úteis:**
- Vercel Function Logs
- Supabase Dashboard
- Browser Console
- Network requests

### Backup e Recuperação:

**Backup Automático:**
- Supabase faz backup automático
- Retenção de 7 dias (plano gratuito)
- Backup manual via dashboard

**Recuperação:**
- Restore via Supabase dashboard
- Scripts SQL de emergência
- Redeployment via Vercel

---

## 📞 Suporte

### Contatos:
- **Desenvolvedor:** Kiro AI Assistant
- **Email de Suporte:** entregasobral@gmail.com
- **Repositório:** https://github.com/entrega363/estoque

### Recursos Úteis:
- **Next.js Docs:** https://nextjs.org/docs
- **Supabase Docs:** https://supabase.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **Tailwind CSS:** https://tailwindcss.com/docs

---

## 📝 Changelog

### v1.0.0 (02/08/2025)
- ✅ Sistema de autenticação completo
- ✅ Gerenciamento de usuários
- ✅ Controle de estoque básico
- ✅ Interface responsiva
- ✅ Deploy no Vercel
- ✅ Documentação completa

### Próximas Versões:
- 📋 Relatórios avançados
- 📊 Dashboard com gráficos
- 🔔 Sistema de notificações
- 📱 App mobile
- 🔍 Busca avançada
- 📤 Exportação de dados

---

**© 2025 Sistema de Controle de Estoque - Desenvolvido com ❤️ usando Next.js e Supabase**