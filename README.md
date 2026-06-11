# Creator Finance

Plataforma financeira para criadores de conteúdo e infoprodutores brasileiros. Integra com **Kiwify** e **Stripe** para importar receitas automaticamente, calcular impostos e dar visibilidade financeira completa do negócio digital.

## Features

- **Dashboard financeiro** — Receita, despesas e saldo em tempo real
- **Calendário de recebimentos** — Visão de entradas por período
- **Cálculo de impostos** — Estimativa automática para MEI e Simples Nacional
- **Produtos** — Cadastro e acompanhamento de produtos digitais
- **Integrações** — Kiwify (webhook) e Stripe (checkout + portal)
- **Demo** — Ambiente de demonstração sem necessidade de conta
- **Onboarding** — Setup guiado para novos usuários
- **Pricing** — Planos e assinatura via Stripe

## Tech Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | [Next.js 15](https://nextjs.org) (App Router) |
| Linguagem | TypeScript |
| Backend/Auth | [Supabase](https://supabase.com) |
| Pagamentos | [Stripe](https://stripe.com) |
| Estilização | [Tailwind CSS](https://tailwindcss.com) |
| Gráficos | Recharts |

## Pré-requisitos

- Node.js 20+
- Conta no [Supabase](https://supabase.com)
- Conta no [Stripe](https://stripe.com) (para pagamentos)

## Setup Local

### 1. Instalar dependências

```bash
npm install
```

### 2. Variáveis de ambiente

Crie um arquivo `.env.local` na raiz:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Banco de dados

Execute as migrations no Supabase:

```bash
# Via Supabase Dashboard > SQL Editor
# Cole o conteúdo de supabase/migration.sql
```

### 4. Rodar em desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Estrutura do Projeto

```
app/
├── (auth)/              # Login e cadastro
├── (dashboard)/         # Área autenticada
│   ├── dashboard/       # Visão geral
│   ├── receita/         # Transações e receitas
│   ├── impostos/        # Cálculo de impostos
│   ├── produtos/        # Gerenciamento de produtos
│   ├── calendario/      # Calendário financeiro
│   ├── integracoes/     # Configurar Kiwify/Stripe
│   └── configuracoes/   # Configurações da conta
├── api/
│   ├── auth/            # Callbacks de autenticação
│   ├── stripe/          # Checkout, portal e webhooks
│   └── webhooks/kiwify/ # Webhook de vendas Kiwify
├── demo/                # Dashboard demo (sem auth)
├── onboarding/          # Setup inicial
└── pricing/             # Página de planos
```

## Integrações

### Kiwify
Configure o webhook na plataforma Kiwify apontando para:
```
POST https://seu-dominio/api/webhooks/kiwify
```

### Stripe
Webhooks Stripe devem apontar para:
```
POST https://seu-dominio/api/stripe/webhook
```

## Deploy

O projeto está configurado para deploy no [Vercel](https://vercel.com). Conecte o repositório e configure as variáveis de ambiente no painel.

## CI/CD

GitHub Actions roda TypeScript check, lint e build em cada push.
