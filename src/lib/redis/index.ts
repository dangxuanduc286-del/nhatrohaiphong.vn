import Redis, { type RedisOptions } from "ioredis";

import { env } from "@/lib/env/index";
import { logger } from "@/lib/logger/index";

const globalForRedis = globalThis as unknown as {
  redis?: Redis;
};

const MAX_RECONNECT_ATTEMPTS = 10;
const MAX_RECONNECT_DELAY_MS = 3_000;
const CONNECT_TIMEOUT_MS = 10_000;

function isTlsRedisUrl(url: string): boolean {
  try {
    return new URL(url).protocol === "rediss:";
  } catch {
    return url.startsWith("rediss://");
  }
}

function createRedisOptions(redisUrl: string): RedisOptions {
  const useTls = isTlsRedisUrl(redisUrl);

  return {
    lazyConnect: true,
    maxRetriesPerRequest: 3,
    enableReadyCheck: !useTls,
    enableOfflineQueue: true,
    connectTimeout: CONNECT_TIMEOUT_MS,
    ...(useTls ? { tls: {} } : {}),
    retryStrategy(attempt) {
      if (attempt > MAX_RECONNECT_ATTEMPTS) {
        return null;
      }

      return Math.min(attempt * 200, MAX_RECONNECT_DELAY_MS);
    },
    reconnectOnError(error) {
      const message = error.message.toLowerCase();
      return message.includes("econnreset") || message.includes("readonly");
    },
  };
}

function attachRedisListeners(client: Redis): void {
  // Error listener must remain attached to prevent unhandled Redis errors
  // from crashing the process. Logged at warn level for production visibility.
  client.on("error", (error) => {
    logger.warn(
      {
        err: {
          message: error.message,
          code: "code" in error ? String(error.code) : undefined,
        },
      },
      "redis: error",
    );
  });
}

function createRedisClient(): Redis {
  const client = new Redis(env.REDIS_URL, createRedisOptions(env.REDIS_URL));
  attachRedisListeners(client);
  return client;
}

export const redis = globalForRedis.redis ?? createRedisClient();

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}
