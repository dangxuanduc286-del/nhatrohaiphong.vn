# Nhatrohaiphong.vn

Production-grade SaaS foundation for a rental-room discovery platform built with Next.js 16, TypeScript, Tailwind CSS, Shadcn UI, Prisma, PostgreSQL, Redis, and Docker.

## Architecture

- App Router-first Next.js application with server-centric boundaries.
- Domain-oriented source layout for future SaaS modules.
- Infrastructure layer isolated under `src/lib` and `src/server`.
- Prisma prepared for PostgreSQL with generated client isolated under `src/generated`.
- Redis prepared for caching, queues, rate limits, and sessions.
- Docker Compose supplies local PostgreSQL and Redis dependencies.

## Quality gates

```bash
npm run lint
npm run typecheck
npm run build
```
