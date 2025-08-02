# Deploy no Vercel - Sistema de Estoque

## 🚀 Como fazer deploy no Vercel

### 1. Preparar o repositório
```bash
git add .
git commit -m "Configurar para deploy no Vercel"
git push
```

### 2. Acessar o Vercel
1. Acesse [vercel.com](https://vercel.com)
2. Faça login com sua conta GitHub
3. Clique em "New Project"
4. Selecione o repositório `estoque`

### 3. Configurar variáveis de ambiente
No painel do Vercel, adicione as seguintes variáveis:

```
NEXT_PUBLIC_SUPABASE_URL=https://rtajuzunzkoamruejtim.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0YWp1enVuemtvYW1ydWVqdGltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDA0MTMsImV4cCI6MjA2OTcxNjQxM30.dlestmqzHPy-zMeJubohj13dvPaZ7MEUeoRti5OF0uU
```

### 4. Deploy
1. Clique em "Deploy"
2. Aguarde o build terminar
3. Acesse o link gerado pelo Vercel

## ✅ Vantagens do Vercel

- ✅ Suporte completo ao Next.js
- ✅ APIs funcionam perfeitamente
- ✅ Deploy automático a cada push
- ✅ Variáveis de ambiente seguras
- ✅ HTTPS automático
- ✅ CDN global

## 🔧 Configurações incluídas

- `vercel.json` - Configuração específica do Vercel
- `next.config.js` - Otimizado para Vercel
- Headers CORS configurados
- Runtime Node.js 18.x

## 🐛 Troubleshooting

Se houver problemas:
1. Verifique as variáveis de ambiente no painel Vercel
2. Veja os logs de build no Vercel
3. Teste localmente com `npm run dev`

## 📱 Após o deploy

1. Teste o cadastro de usuários
2. Verifique se o banco Supabase está funcionando
3. Confirme que o admin pode aprovar usuários

O sistema deve funcionar perfeitamente no Vercel! 🎉