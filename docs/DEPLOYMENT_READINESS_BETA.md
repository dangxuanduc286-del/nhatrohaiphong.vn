# Closed Beta Deployment Readiness

## Deployment Readiness Score

**78/100 — conditionally ready after resolving blockers below.**

Scoring basis:

- Docker image: 15/15
- Docker Compose dependencies: 12/15
- Environment validation: 18/20
- Health checks: 15/15
- Logging safety: 10/15
- Backup/restore readiness: 8/20

## Deployment Blockers

1. **Production secrets must be provided by runtime secret manager.** Do not use sample/default values for `JWT_SECRET`, `AUTH_COOKIE_NAME`, `DATABASE_URL`, `DIRECT_URL`, `REDIS_URL`, or `NEXT_PUBLIC_APP_URL`.
2. **PostgreSQL backup job is not implemented in infrastructure.** A scheduled `pg_dump`/managed snapshot policy must exist before Closed Beta traffic.
3. **Restore procedure is documented but not rehearsed.** Perform one restore drill against a staging database before launch.
4. **Docker Compose is dependency-only.** It starts PostgreSQL and Redis, but does not define the production app service; deploy platform must build/run the `Dockerfile` image separately or extend Compose.
5. **Email provider defaults to console.** Acceptable only for internal Closed Beta with secure operator workflow; public beta should configure Resend, Brevo, or SMTP.

## Deployment Audit

### Docker

- `Dockerfile` uses multi-stage build and `next.config.ts` standalone output.
- Runtime runs as non-root `nextjs` user.
- `NEXT_TELEMETRY_DISABLED=1` is set.
- Blocker: build requires all validated environment variables at build/runtime if imported during static build.

### Docker Compose

- `docker-compose.yml` defines PostgreSQL 17 and Redis 8.
- PostgreSQL healthcheck uses `pg_isready`.
- Redis healthcheck uses `redis-cli ping`.
- Redis AOF persistence is enabled.
- Blocker: default PostgreSQL password `postgres` is development-only; production must use secret injection and not expose `5432`/`6379` publicly.

### Environment Variables

Required for Closed Beta:

- `JWT_SECRET`: at least 32 characters, unique, high entropy.
- `AUTH_COOKIE_NAME`: project-specific, not default/placeholder in production.
- `DATABASE_URL`: pooled/runtime PostgreSQL URL.
- `DIRECT_URL`: direct PostgreSQL URL for migrations/tooling.
- `REDIS_URL`: Redis URL, preferably private network/TLS where supported.
- `NEXT_PUBLIC_APP_URL`: canonical public HTTPS origin.

Startup validation exists in `src/lib/env/index.ts` and rejects placeholder/default-like values.

### Prisma Migration

- Migrations are present under `prisma/migrations`.
- Use `npx prisma migrate deploy` during deployment, not `prisma migrate dev`.
- `npx prisma validate` is required in final verification.

### Redis

- Client configured through `REDIS_URL`.
- Redis health check is exposed through `/api/health`.
- Redis AOF is enabled in local Compose.

### PostgreSQL

- Runtime uses Prisma with PostgreSQL adapter and `DATABASE_URL`.
- Database health check is exposed through `/api/health`.
- Production must use managed PostgreSQL or hardened self-hosted PostgreSQL with backups.

### Build Pipeline

Minimum pipeline steps:

1. Install dependencies with `npm ci`.
2. Validate Prisma schema with `npx prisma validate`.
3. Generate Prisma client if needed with `npx prisma generate`.
4. Run `npm run lint`.
5. Run `npx tsc --noEmit` or `npm run typecheck`.
6. Run `npm run build`.
7. Apply migrations with `npx prisma migrate deploy` after backup/snapshot.
8. Start app and verify `/api/health`.

## Environment Checklist

- [ ] `NODE_ENV=production`.
- [ ] `JWT_SECRET` is at least 32 chars and generated from a secure random source.
- [ ] `JWT_SECRET` is not committed to git and not reused from staging/dev.
- [ ] `AUTH_COOKIE_NAME` is explicit and not placeholder.
- [ ] `DATABASE_URL` points to production runtime database.
- [ ] `DIRECT_URL` points to production direct database connection for migrations.
- [ ] `REDIS_URL` points to production Redis.
- [ ] `NEXT_PUBLIC_APP_URL` is HTTPS production/beta domain.
- [ ] `LOG_LEVEL=info` or `warn` in production.
- [ ] `AUTH_DEBUG_TOKENS=false` in production.
- [ ] Real email provider configured or console-provider exception approved for internal Closed Beta.

## Health Check Contract

Endpoint: `/api/health`

Statuses:

- `healthy`: app, database, Redis are reachable.
- `degraded`: one dependency is down.
- `unhealthy`: both database and Redis are down.

Expected response shape:

```json
{
  "status": "healthy",
  "timestamp": "2026-06-02T00:00:00.000Z",
  "checks": {
    "app": "healthy",
    "database": "healthy",
    "redis": "healthy"
  }
}
```

## Logging Audit

- App/API error logging exists through central response handler.
- Auth audit events are persisted to `AuditLog`.
- Admin actions are persisted to `AuditLog`.
- Logger redaction covers `password`, `passwordHash`, `token`, `refreshToken`, `accessToken`, and `authorization` keys, including one-level wildcard variants.
- Known risk: console email provider logs verification/reset URL containing token; use only for internal Closed Beta and secure server logs.
- No direct password/JWT/refresh-token logging found in API routes during audit.

## Backup Checklist

### PostgreSQL

- [ ] Enable managed automated backups or scheduled `pg_dump`.
- [ ] Keep at least daily backups for Closed Beta.
- [ ] Keep pre-deploy snapshot before every migration.
- [ ] Encrypt backups at rest.
- [ ] Restrict backup access to operators only.
- [ ] Store restore command/runbook in operator docs.
- [ ] Rehearse restore to staging before launch.

Example logical backup command:

```bash
pg_dump "$DATABASE_URL" --format=custom --file=backup-$(date +%Y%m%d%H%M%S).dump
```

Example restore command:

```bash
pg_restore --clean --if-exists --no-owner --dbname="$RESTORE_DATABASE_URL" backup.dump
```

### Redis

- [ ] AOF enabled for self-hosted Redis.
- [ ] Managed Redis persistence/snapshot policy enabled where available.
- [ ] Redis data classified as cache/session/rate-limit data; confirm acceptable loss window.
- [ ] Restore procedure documented for Redis AOF/RDB or managed snapshot.

## Rollback Checklist

- [ ] Identify last known-good git commit/image tag.
- [ ] Confirm pre-deploy PostgreSQL backup/snapshot exists.
- [ ] Stop traffic or enable maintenance mode at load balancer/platform.
- [ ] Roll back app image to last known-good version.
- [ ] If migration is backward-compatible, do not restore DB; verify app health.
- [ ] If migration broke production data/schema, restore pre-deploy DB snapshot to a new database, verify, then promote.
- [ ] Clear or isolate Redis cache if stale data causes errors.
- [ ] Verify `/api/health` returns `healthy`.
- [ ] Run smoke tests: register, login, search, room detail, admin moderation.
- [ ] Record incident notes and beta-user impact.

## Beta Test Checklist

- [ ] User can register with email, phone, full name, password, and role.
- [ ] Verification email/reset email workflow is operational for selected provider.
- [ ] User can log in and receives access token plus secure refresh cookie.
- [ ] User can refresh session and log out.
- [ ] Landlord can create a room listing.
- [ ] Room form validates price, address, district/ward, GPS coordinates, and amenities.
- [ ] GPS/location picker works on supported browsers.
- [ ] Room detail page displays map and nearby POI distances.
- [ ] Search returns relevant rooms by location/filter.
- [ ] Nearby/GPS search works with browser permission granted and denied.
- [ ] Directions/chỉ đường link opens expected map/navigation target.
- [ ] Admin can view pending room moderation queue.
- [ ] Admin can approve/reject/hide room and audit log is recorded.
- [ ] Admin can review users, landlords, settings, cities, districts, wards, and POI screens.
- [ ] `/api/health` returns `healthy` after deployment.

## Current Decision

**NOT READY FOR DEPLOY** until production secrets are configured, PostgreSQL backup/restore is rehearsed, and the production app service/runtime is wired to the selected deployment platform.
