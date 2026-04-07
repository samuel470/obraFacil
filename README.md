# FitPen

App web mobile-first para acompanhar aplicações de canetas de emagrecimento (Mounjaro, Ozempic, Wegovy e similares).

## Stack
- Next.js (App Router) + TypeScript
- Tailwind CSS
- shadcn/ui (componentes base no estilo)
- Supabase (auth + banco)
- React Hook Form + Zod
- Recharts + date-fns

## Funcionalidades
- Autenticação (login, cadastro, logout, sessão persistida)
- Onboarding inicial
- Dashboard com cards, alertas, gráfico e CTA
- Registro de aplicação
- Registro de peso e medidas
- Histórico com filtros e exclusão
- Relatórios/progresso com métricas
- Perfil/configurações
- Navegação inferior mobile + FAB de registro

## Como rodar
1. Instale dependências:
   ```bash
   npm install
   ```
2. Configure variáveis:
   ```bash
   cp .env.example .env.local
   ```
   Preencha `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Execute SQL em `db/supabase.sql` no SQL Editor do Supabase.
4. Rode em desenvolvimento:
   ```bash
   npm run dev
   ```
5. Abra `http://localhost:3000`.

## Estrutura
- `app/(auth)` páginas públicas
- `app/(protected)` área autenticada
- `components/features` componentes por feature
- `components/layout` navegação mobile
- `lib/supabase` clientes e queries
- `lib/utils` helpers de progresso
- `db/supabase.sql` schema + RLS

## Próximos passos sugeridos
- Notificações push
- Gamificação por streak
- Edição completa no histórico
