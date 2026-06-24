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
  client.on("connect", () => {
    logger.debug("redis: connect");
  });

  client.on("ready", () => {
    logger.debug("redis: ready");
  });

  client.on("error", (error) => {
    logger.debug(
      {
        err: {
          message: error.message,
          code: "code" in error ? String(error.code) : undefined,
        },
      },
      "redis: error",
    );
  });

  client.on("close", () => {
    logger.debug("redis: close");
  });

  client.on("reconnecting", (delay: number) => {
    logger.debug({ delay }, "redis: reconnecting");
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
