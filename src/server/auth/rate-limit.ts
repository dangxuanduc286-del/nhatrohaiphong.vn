import { redis } from "@/lib/redis";

import { LOGIN_MAX_ATTEMPTS } from "./constants";

const LOGIN_RATE_LIMIT_WINDOW_SECONDS = 15 * 60;

const memoryStore = new Map<string, { count: number; expiresAt: number }>();

function rateLimitKey(identifier: string) {
  return `auth:login:${identifier}`;
}

async function incrementMemory(identifier: string) {
  const now = Date.now();
  const current = memoryStore.get(identifier);

  if (!current || current.expiresAt <= now) {
    memoryStore.set(identifier, { count: 1, expiresAt: now + LOGIN_RATE_LIMIT_WINDOW_SECONDS * 1000 });
    return 1;
  }

  current.count += 1;
  memoryStore.set(identifier, current);
  return current.count;
}

export async function checkLoginRateLimit(identifier: string) {
  try {
    const key = rateLimitKey(identifier);
    const count = await redis.incr(key);

    if (count === 1) {
      await redis.expire(key, LOGIN_RATE_LIMIT_WINDOW_SECONDS);
    }

    return count <= LOGIN_MAX_ATTEMPTS;
  } catch {
    const count = await incrementMemory(identifier);
    return count <= LOGIN_MAX_ATTEMPTS;
  }
}
