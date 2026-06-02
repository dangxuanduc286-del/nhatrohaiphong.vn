import { AppError } from "@/lib/errors";
import { redis } from "@/lib/redis";

import { LOGIN_MAX_ATTEMPTS } from "./constants";

const LOGIN_RATE_LIMIT_WINDOW_SECONDS = 15 * 60;
const AUTH_ACTION_RATE_LIMIT_WINDOW_SECONDS = 15 * 60;
const AUTH_ACTION_MAX_ATTEMPTS = 5;

const memoryStore = new Map<string, { count: number; expiresAt: number }>();

function rateLimitKey(identifier: string) {
  return `auth:login:${identifier}`;
}

function authActionRateLimitKey(action: string, identifier: string) {
  return `auth:${action}:${identifier}`;
}

async function incrementMemory(identifier: string, windowSeconds = LOGIN_RATE_LIMIT_WINDOW_SECONDS) {
  const now = Date.now();
  const current = memoryStore.get(identifier);

  if (!current || current.expiresAt <= now) {
    memoryStore.set(identifier, { count: 1, expiresAt: now + windowSeconds * 1000 });
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

export async function checkAuthActionRateLimit(action: string, identifier: string) {
  try {
    const key = authActionRateLimitKey(action, identifier);
    const count = await redis.incr(key);

    if (count === 1) {
      await redis.expire(key, AUTH_ACTION_RATE_LIMIT_WINDOW_SECONDS);
    }

    return count <= AUTH_ACTION_MAX_ATTEMPTS;
  } catch {
    const count = await incrementMemory(authActionRateLimitKey(action, identifier), AUTH_ACTION_RATE_LIMIT_WINDOW_SECONDS);
    return count <= AUTH_ACTION_MAX_ATTEMPTS;
  }
}

export async function enforceAuthActionRateLimit(action: string, identifier: string) {
  const allowed = await checkAuthActionRateLimit(action, identifier);

  if (!allowed) {
    throw new AppError("Too many authentication requests", 429, "AUTH_RATE_LIMITED");
  }
}
