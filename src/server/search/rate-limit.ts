import { AppError } from "@/lib/errors";
import { redis } from "@/lib/redis";
import { verifyAccessToken } from "@/server/auth/jwt";

const SEARCH_RATE_LIMIT_WINDOW_SECONDS = 60;
const ANONYMOUS_SEARCH_LIMIT = 60;
const AUTHENTICATED_SEARCH_LIMIT = 300;

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwardedFor || request.headers.get("x-real-ip") || "unknown";
}

function extractOptionalBearerToken(request: Request) {
  const authorization = request.headers.get("authorization");

  if (!authorization) {
    return null;
  }

  const [scheme, token] = authorization.split(" ");
  return scheme === "Bearer" && token ? token : null;
}

async function getRateLimitIdentity(request: Request) {
  const token = extractOptionalBearerToken(request);

  if (!token) {
    return { key: `anonymous:${getClientIp(request)}`, limit: ANONYMOUS_SEARCH_LIMIT };
  }

  try {
    const payload = await verifyAccessToken(token);
    return { key: `authenticated:${payload.userId}`, limit: AUTHENTICATED_SEARCH_LIMIT };
  } catch {
    return { key: `anonymous:${getClientIp(request)}`, limit: ANONYMOUS_SEARCH_LIMIT };
  }
}

export async function enforceSearchRateLimit(request: Request, scope: string) {
  const identity = await getRateLimitIdentity(request);
  const key = `rate-limit:search:${scope}:${identity.key}`;
  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, SEARCH_RATE_LIMIT_WINDOW_SECONDS);
  }

  if (count > identity.limit) {
    throw new AppError("Too many search requests", 429, "SEARCH_RATE_LIMITED");
  }

  return { limit: identity.limit, remaining: Math.max(identity.limit - count, 0), windowSeconds: SEARCH_RATE_LIMIT_WINDOW_SECONDS };
}
