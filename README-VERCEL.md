# Deploy no Vercel - Sistema de Estoque

## 🚀 Passo a passo para configurar o Vercel

### 1. Remover GitHub Actions (✅ Feito)
- Removido o arquivo `.github/workflows/deploy.yml`
- Agora o Vercel pode controlar os deploys

### 2. Configurar o projeto no Vercel

#### Opção A: Conectar repositório existente
1. Acesse [vercel.com](https://vercel.com)
2. Faça login com sua conta GitHub
3. Clique em "New Project"
4. Selecione o repositório `estoque`
5. Configure as variáveis de ambiente (veja abaixo)
6. Clique em "Deploy"

#### Opção B: Reconectar se já existe
1. Vá para o dashboard do Vercel
2. Encontre o projeto `estoque`
3. Vá em Settings → Git
4. Verifique se está conectado ao repositório correto
5. Force um novo deploy em Deployments → "Redeploy"

### 3. Configurar variáveis de ambiente no Vercel

No painel do Vercel (Settings → Environment Variables):

```
NEXT_PUBLIC_SUPABASE_URL=https://rtajuzunzkoamruejtim.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0YWp1enVuemtvYW1ydWVqdGltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDA0MTMsImV4cCI6MjA2OTcxNjQxM30.dlestmqzHPy-zMeJubohj13dvPaZ7MEUeoRti5OF0uU
```

**⚠️ IMPORTANTE:** Adicione essas variáveis para todos os ambientes:
- Production
- Preview  
- Development

### 4. Verificar configurações

#### vercel.json (✅ Configurado)
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next"
}
```

#### next.config.js (✅ Otimizado)
- Configurado para Supabase
- Headers CORS incluídos

### 5. Forçar novo deploy

Após as configurações:
```bash
git add .
git commit -m "Configurar Vercel - remover GitHub Actions"
git push
```

Ou no painel do Vercel:
- Vá em "Deployments"
- Clique em "Redeploy" no último deploy

## 🔧 Troubleshooting

### Se ainda não atualizar:
1. **Verifique no Vercel Dashboard:**
   - Vá em "Deployments"
   - Veja se há novos builds sendo executados
   - Verifique os logs de build

2. **Force um redeploy:**
   - No Vercel, vá em Deployments
   - Clique nos 3 pontos do último deploy
   - Selecione "Redeploy"

3. **Verifique as variáveis de ambiente:**
   - Settings → Environment Variables
   - Certifique-se que estão definidas para Production

4. **Verifique a conexão Git:**
   - Settings → Git
   - Confirme que está conectado ao repositório correto

### Logs úteis:
- **Build logs:** Vercel Dashboard → Deployments → Clique no deploy
- **Function logs:** Vercel Dashboard → Functions
- **Runtime logs:** Vercel Dashboard → Functions → View Function Logs

## ✅ Após configurar corretamente:

- ✅ Deploy automático a cada push
- ✅ Variáveis de ambiente seguras  
- ✅ Build otimizado para Next.js
- ✅ Supabase funcionando corretamente
- ✅ HTTPS automático

O sistema deve atualizar automaticamente no Vercel a cada push! 🎉