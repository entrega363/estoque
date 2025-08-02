# 📦 Sistema de Controle de Estoque

> Sistema web moderno para gerenciamento de inventário com controle de acesso e aprovação de usuários.

[![Deploy](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://estoque-sistema-kapinfsjh-entregasobrals-projects.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-green?logo=supabase)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)

## 🚀 Demo

**🌐 Acesse o sistema:** [estoque-sistema.vercel.app](https://estoque-sistema-kapinfsjh-entregasobrals-projects.vercel.app)

**🔑 Credenciais de Admin:**
- Email: `entregasobral@gmail.com`
- Senha: `tenderbr0`

## ✨ Funcionalidades

- 🔐 **Autenticação segura** com Supabase Auth
- 👥 **Sistema de aprovação** de usuários
- 🎭 **Controle de acesso** baseado em roles (Admin/User)
- 📦 **Gerenciamento de estoque** completo
- 📱 **Interface responsiva** e moderna
- 🚀 **Deploy automático** no Vercel
- 🔒 **Row Level Security** no banco de dados

## 🛠️ Tecnologias

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Deploy:** Vercel com CI/CD automático
- **Styling:** Tailwind CSS + Remix Icons

## 📋 Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta no Supabase
- Conta no Vercel (para deploy)

## 🚀 Instalação

1. **Clone o repositório:**
```bash
git clone https://github.com/entrega363/estoque.git
cd estoque
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure as variáveis de ambiente:**
```bash
cp .env.example .env.local
```

Edite `.env.local` com suas credenciais do Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
```

4. **Execute o projeto:**
```bash
npm run dev
```

Acesse: `http://localhost:3000`

## 🗄️ Banco de Dados

Execute os scripts SQL na seguinte ordem:

1. `database/schema.sql` - Estrutura das tabelas
2. `database/approve-admin.sql` - Criar usuário admin

## 📖 Documentação

📚 **[Documentação Completa](./DOCUMENTACAO-SISTEMA.md)** - Guia detalhado do sistema

### Guias Rápidos:
- 👤 **[Guia do Usuário](./DOCUMENTACAO-SISTEMA.md#guia-do-usuário)** - Como usar o sistema
- 👨‍💼 **[Guia do Admin](./DOCUMENTACAO-SISTEMA.md#guia-do-administrador)** - Funcionalidades administrativas
- 🔧 **[Troubleshooting](./DOCUMENTACAO-SISTEMA.md#troubleshooting)** - Solução de problemas

## 🏗️ Estrutura do Projeto

```
├── app/                    # Next.js App Router
│   ├── sistema/           # Dashboard principal
│   ├── login/             # Página de login
│   ├── cadastro/          # Página de cadastro
│   ├── gerenciar-usuarios/ # Painel administrativo
│   └── adicionar/         # Adicionar produtos
├── components/            # Componentes reutilizáveis
├── lib/                   # Configurações e utilitários
│   └── supabase.ts       # Cliente Supabase
├── database/              # Scripts SQL
└── public/                # Assets estáticos
```

## 🔐 Autenticação

O sistema possui dois tipos de usuários:

### 👤 Usuário Regular
- Precisa ser aprovado pelo admin
- Pode gerenciar apenas seus produtos
- Acesso limitado ao sistema

### 👨‍💼 Administrador
- Acesso total ao sistema
- Pode aprovar/rejeitar usuários
- Gerencia roles e permissões

## 🚀 Deploy

### Deploy Automático (Recomendado)
1. Faça push para a branch `main`
2. Vercel fará deploy automaticamente
3. Configure as variáveis de ambiente no painel do Vercel

### Deploy Manual
```bash
npm run build
vercel --prod
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

- 📧 Email: entregasobral@gmail.com
- 🐛 Issues: [GitHub Issues](https://github.com/entrega363/estoque/issues)
- 📖 Docs: [Documentação Completa](./DOCUMENTACAO-SISTEMA.md)

## 🎯 Roadmap

- [ ] 📊 Dashboard com gráficos
- [ ] 📋 Relatórios avançados
- [ ] 🔔 Sistema de notificações
- [ ] 📱 Progressive Web App (PWA)
- [ ] 🔍 Busca avançada com filtros
- [ ] 📤 Exportação de dados (CSV/PDF)
- [ ] 🌙 Modo escuro
- [ ] 🌍 Internacionalização (i18n)

---

**Desenvolvido com ❤️ usando Next.js e Supabase**