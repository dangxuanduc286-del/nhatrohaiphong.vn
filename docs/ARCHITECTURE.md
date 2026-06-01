# Architecture

## Production-grade SaaS foundation

Nhatrohaiphong.vn is prepared as a server-centric SaaS platform for rental-room discovery.

## Layering

- `src/app`: Next.js App Router routes, route groups, layouts, and route handlers.
- `src/components`: Shared UI, layout, and common presentation components.
- `src/features`: Future business feature modules.
- `src/server`: Server-only application services, repositories, auth, API orchestration, and validators.
- `src/lib`: Infrastructure clients and cross-cutting utilities.
- `src/config`: Application-level configuration.
- `src/constants`: Shared constants.
- `src/types`: Shared TypeScript types.
- `prisma`: Database schema and database bootstrap assets.
- `tests`: Unit, integration, and end-to-end test placeholders.

## Infrastructure

- PostgreSQL: primary relational datastore.
- Prisma: typed data-access foundation.
- Redis: caching, rate limiting, queue, and session-ready foundation.
- Docker Compose: local dependencies.
- Pino: structured logging.
- Zod/T3 Env: environment validation.
- ESLint/Prettier/Husky/lint-staged: quality gates.
