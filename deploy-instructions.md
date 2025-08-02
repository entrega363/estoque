# 🚀 Instruções para Deploy no Vercel

Como o CLI está com problemas de nome, vamos fazer pelo site:

## Passo 1: Acesse o Vercel
1. Vá para [vercel.com](https://vercel.com)
2. Faça login com a conta `entregasobral@gmail.com`

## Passo 2: Criar Novo Projeto
1. Clique em **"New Project"**
2. Conecte sua conta do GitHub se necessário
3. Procure pelo repositório **"estoque"**
4. Clique em **"Import"**

## Passo 3: Configurar o Projeto
1. **Project Name**: `estoque-sistema`
2. **Framework Preset**: Next.js (deve detectar automaticamente)
3. **Root Directory**: `.` (deixe como está)
4. **Build Command**: `npm run build` (já configurado)
5. **Output Directory**: `.next` (já configurado)

## Passo 4: Adicionar Variáveis de Ambiente
Clique em **"Environment Variables"** e adicione:

```
NEXT_PUBLIC_SUPABASE_URL = https://rtajuzunzkoamruejtim.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0YWp1enVuemtvYW1ydWVqdGltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDA0MTMsImV4cCI6MjA2OTcxNjQxM30.dlestmqzHPy-zMeJubohj13dvPaZ7MEUeoRti5OF0uU
```

## Passo 5: Deploy
1. Clique em **"Deploy"**
2. Aguarde o build terminar (2-3 minutos)
3. Seu site estará disponível em uma URL como: `https://estoque-sistema.vercel.app`

## ✅ Pronto!
Depois do deploy, o site será atualizado automaticamente a cada push no GitHub.

---

**Credenciais do Admin para testar:**
- Email: `entregasobral@gmail.com`
- Senha: `tenderbr0`