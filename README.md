# Assis

Aplicativo pessoal de gestão financeira focado em **sobrevivência diária** e disciplina de caixa. O Assis acompanha o saldo consolidado entre PicPay e carteira física, calcula quanto você pode gastar por dia e mostra o status da operação em três níveis de meta.

## ✨ Principais recursos

- **Métrica de Sobrevivência por Níveis**
  - 🥉 **Bronze** — saldo dividido pelos dias até o dia 20 (alvo: R$ 20/dia)
  - 🥈 **Prata** — saldo dividido pelos dias até o dia 23
  - 🥇 **Ouro** — saldo dividido pelos dias até o dia 26
- **Card dinâmico** que muda de cor conforme o nível atingido (Ouro → Prata → Bronze → Crítico/Vermelho).
- **Ciclo mensal** iniciando todo dia 20 (ex.: 20/04 a 19/05).
- **Baldes de saldo**: PicPay (principal), Carteira Física (reserva) e Nubank, com alertas visuais quando a reserva está baixa.
- **Registro de movimentações**: entradas (faturamento) e saídas (estruturais e variáveis).
- **Acesso privado por whitelist** — apenas e-mails autorizados conseguem entrar; cadastro público desativado.

## 🛠 Stack

- **TanStack Start** (React 19 + Vite 7) com SSR em edge runtime
- **Tailwind CSS v4** com design tokens semânticos
- **shadcn/ui** para componentes
- **Lovable Cloud** (Supabase) para autenticação e persistência

## 🚀 Desenvolvimento

```bash
bun install
bun run dev
```

A aplicação roda no preview da Lovable e usa o backend gerenciado via Lovable Cloud — não é necessário configurar credenciais manualmente.

## 🔐 Autenticação

O acesso é restrito a uma whitelist definida em `src/components/auth/Login.tsx`. Para liberar novos usuários, adicione o e-mail à constante `ALLOWED_EMAILS` e crie a conta correspondente no backend.
