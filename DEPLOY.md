# EduHub — Deploy

## Variáveis obrigatórias (Railway / Render / VPS)

```env
NODE_ENV=production
DATABASE_URL=file:/data/prod.db
AUTH_SECRET=gere-um-segredo-longo-e-aleatorio
```

> **Railway:** monte um **Volume** em `/data` e use `DATABASE_URL=file:/data/prod.db`  
> **VPS:** use `DATABASE_URL=file:/var/www/eduhub/prisma/prod.db`

## Primeiro deploy

1. Conecte o repositório GitHub à plataforma
2. Configure as variáveis acima
3. Após o build, rode **uma vez**: `npm run db:seed` (terminal da plataforma)

## Contas demo (após seed)

| E-mail | Senha | Papel |
|--------|-------|-------|
| admin@eduhub.local | demo123 | Diretor |
| professor@eduhub.local | demo123 | Professor |
| mariana@responsavel.local | demo123 | Responsável |
| lucas@aluno.local | demo123 | Aluno |

## Comandos locais

```bash
npm install
npm run db:seed
npm run dev
```
