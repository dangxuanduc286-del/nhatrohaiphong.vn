import { redis } from "@/lib/redis";

const DEFAULT_TTL_SECONDS = 60;

export async function getCachedJson<T>(key: string): Promise<T | null> {
  try {
    const value = await redis.get(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}

export async function setCachedJson(key: string, value: unknown, ttlSeconds = DEFAULT_TTL_SECONDS) {
  try {
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch {
    // Cache failures must not block public search APIs.
  }
}

export function createCacheKey(scope: string, input: unknown) {
  return `search:${scope}:${Buffer.from(JSON.stringify(input)).toString("base64url")}`;
}
