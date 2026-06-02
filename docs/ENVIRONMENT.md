# Runtime environment

Copy `.env.example` to `.env.local` for local development.

## Required variables

- `DATABASE_URL`: PostgreSQL connection string used by Prisma runtime.
- `DIRECT_URL`: Direct PostgreSQL connection string used by Prisma tooling/migrations.
- `REDIS_URL`: Redis connection string for rate limit and search cache.
- `NEXT_PUBLIC_APP_URL`: Public application URL used for auth email links and client-facing absolute URLs.
- `NODE_ENV`: `development`, `test`, or `production`.
- `LOG_LEVEL`: `fatal`, `error`, `warn`, `info`, `debug`, `trace`, or `silent`.
- `JWT_SECRET`: Minimum 32-character secret for access token signing.

## Optional auth variables

- `AUTH_COOKIE_NAME`: Refresh cookie name. Defaults to `nht_auth_refresh`.
- `ACCESS_TOKEN_EXPIRES_IN`: Access-token duration label. Defaults to `15m`.
- `REFRESH_TOKEN_EXPIRES_IN_DAYS`: Refresh-token duration in days. Defaults to `30`.
- `AUTH_DEBUG_TOKENS`: Set to `true` only in non-production development if API responses should include verification/reset debug tokens.

## Optional email variables

- `EMAIL_PROVIDER`: `console`, `resend`, `brevo`, or `smtp`. Defaults to `console`.
- `EMAIL_FROM`: Sender email address for real providers.
- `RESEND_API_KEY`: Required when enabling Resend transport.
- `BREVO_API_KEY`: Required when enabling Brevo transport.
- `SMTP_HOST`: SMTP host when enabling SMTP transport.
- `SMTP_PORT`: SMTP port when enabling SMTP transport.
- `SMTP_USER`: SMTP username when enabling SMTP transport.
- `SMTP_PASSWORD`: SMTP password when enabling SMTP transport.

## Closed Beta deployment notes

- Database, Redis, `JWT_SECRET`, and secure auth cookies are true blockers.
- Email provider can remain `console` for internal Closed Beta only if operators manually deliver verification/reset links from secure server logs.
- Do not enable `AUTH_DEBUG_TOKENS` in production.
