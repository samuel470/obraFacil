# ObraFácil SaaS (MVP produção-ready)

## 1) Escolha do Front-end e justificativa
**Escolha:** React + Vite + PWA (mobile-first).

**Prós:**
- Entrega rápida para Web + instalação como app (PWA) em Android/desktop.
- Ecossistema maduro para offline (cache/local queue), websockets, autenticação e design system.
- Menor custo de operação para MVP SaaS.

**Contras:**
- UX nativa mobile não tão profunda quanto Flutter/React Native.
- Algumas APIs nativas avançadas exigem wrapper (Capacitor) no futuro.

## 2) Estrutura do repositório
Monorepo:
- `backend/` Spring Boot 3 + Java 21 (Clean-ish por camadas: domain/application/infrastructure)
- `frontend/` React PWA (camadas app/features/shared)
- `docker-compose.yml` infraestrutura local

## 3) Modelo de banco (DDL) e diagrama simples
DDL principal em `backend/src/main/resources/db/migration/V1__init.sql`.

Diagrama simplificado:
- `usuarios (1) -> (N) projects` por `client_id` e `responsible_id`
- `projects (1) -> (N) stages`
- `stages (1) -> (N) checklist_items`
- `projects (1) -> (N) diaries -> (N) diary_photos`
- `projects (1) -> (N) nonconformities | payments | documents | messages`
- `usuarios (1) -> (N) notifications | refresh_tokens | ai_usage`

## 4) Lista priorizada de tarefas
1. Base de segurança (JWT access/refresh + RBAC)
2. CRUD de projetos/etapas/checklist com recálculo de progresso
3. Diário + fotos com idempotência/offline sync
4. Chat REST + WebSocket
5. IA Gemini (resumo executivo + limite por plano)
6. UI premium mobile-first com tabs e bottom nav
7. Docker/seed/docs/testes

---

## Funcionalidades implementadas (MVP)
- Auth: register/login/refresh/logout
- RBAC e ownership por projeto (RESPONSAVEL/CLIENTE)
- Projetos, Etapas, Checklist, Diários, Fotos, RNC, Pagamentos, Documentos
- Chat REST + broadcast WS em `/ws/chat`
- Notificações básicas
- IA Gemini com fallback e rate-limit por plano
- OpenAPI Swagger (`/swagger-ui.html`)
- Flyway + seed local
- Frontend com telas: Auth, Dashboard, Projeto (tabs), Diário offline, Chat, Perfil, Notificações
- Tema Slate-900/Amber-500/Slate-50, cards 24px, header sticky, bottom navigation

## O que fica para próxima fase
- Upload real com presigned URL MinIO/S3
- Redis cache/rate-limiter distribuído
- Push notifications e WebSocket full duplex no client
- Testes E2E e cobertura expandida
- Modo multi-tenant com billing real

## Rodando localmente (Linux/Windows)
### Pré-requisitos
- Docker + Docker Compose
- Node 20+

### Subir infraestrutura + backend
```bash
docker compose up -d --build
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Acessos
- API: http://localhost:8080
- Swagger: http://localhost:8080/swagger-ui.html
- Front: http://localhost:5173
- MinIO console: http://localhost:9001

### Usuários seed
- Responsável: `responsavel@obrafacil.app` / `123456`
- Cliente: `cliente@obrafacil.app` / `123456`

