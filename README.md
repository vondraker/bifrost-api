# bifrost-api

Backend de Bifrost en NestJS (Fastify), con Prisma para PostgreSQL y Redis para cache.

## Stack
- NestJS 11
- Fastify
- Prisma + PostgreSQL
- ioredis
- TypeScript

## Estructura

```
src/
  main.ts
  app.module.ts
  health.controller.ts
  auth/
  items/
  minecraft/
  infrastructure/
    database/
    redis/
  config/
  types/
```

## Requisitos
- Node.js 20+
- Docker (opcional para levantar PostgreSQL y Redis)

## Configuracion
Copiar variables de entorno de `.env.example` a `.env`.

Variables requeridas:
- PORT
- NODE_ENV
- JWT_SECRET
- GOOGLE_CLIENT_ID
- DATABASE_URL
- REDIS_URL

## Desarrollo

Instalar dependencias:

```bash
npm install
```

Bootstrap recomendado (un comando):

```bash
npm run dev:bootstrap
```

Este comando:
- Crea `.env` desde `.env.example` si no existe.
- Levanta PostgreSQL y Redis con Docker Compose.
- Genera Prisma Client.
- Inicia la API en modo desarrollo.

Flujo manual (si prefieres pasos separados):

```bash
npm run infra:up
npm run prisma:generate
npm run dev
```

Ejecutar en modo desarrollo:

```bash
npm run dev
```

Compilar:

```bash
npm run build
```

Iniciar compilado:

```bash
npm start
```

## Endpoints
- `GET /` health check
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/items`
- `GET /api/items`
- `GET /api/items/:id`
- `PUT /api/items/:id`
- `DELETE /api/items/:id`
- `GET /api/minecraft/profile/:username`

## Tests
Se usan tests con `node:test` en dos niveles:
- Unitarios de servicios y validacion de entorno.
- E2E HTTP sobre la app Nest (Fastify inject).

Ejecutar toda la suite (unit + e2e):

```bash
npm test
```

Solo unitarios:

```bash
npm run test:unit
```

Solo E2E:

```bash
npm run test:e2e
```

Modo watch:

```bash
npm run test:watch
```

Archivos de test:
- `tests/env.validation.test.cjs`
- `tests/auth.service.test.cjs`
- `tests/minecraft.service.test.cjs`
- `tests/e2e/api.e2e.test.cjs`

## Scripts utiles
- `npm run dev`
- `npm run dev:bootstrap`
- `npm run infra:up`
- `npm run infra:down`
- `npm run prisma:generate`
- `npm run build`
- `npm start`
- `npm test`
- `npm run test:unit`
- `npm run test:e2e`
- `npm run smoke:items`
- `npm run smoke:db`

## Troubleshooting
- Si falta `.env`, ejecuta `npm run dev:bootstrap` para regenerarlo.
- Si Docker no esta disponible, instala Docker Desktop/Engine y verifica `docker compose version`.
- Si hay conflicto de puertos (`5433`, `6379`), detiene el proceso que los usa o cambia los puertos en `docker-compose.yml`.
