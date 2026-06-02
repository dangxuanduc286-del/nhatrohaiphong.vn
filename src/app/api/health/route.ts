import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { redis } from "@/lib/redis";

type ComponentStatus = "healthy" | "unhealthy";
type HealthStatus = "healthy" | "degraded" | "unhealthy";

async function checkDatabase(): Promise<ComponentStatus> {
  try {
    await db.$queryRaw`SELECT 1`;
    return "healthy";
  } catch {
    return "unhealthy";
  }
}

async function checkRedis(): Promise<ComponentStatus> {
  try {
    const response = await redis.ping();
    return response === "PONG" ? "healthy" : "unhealthy";
  } catch {
    return "unhealthy";
  }
}

function resolveStatus(database: ComponentStatus, redisStatus: ComponentStatus): HealthStatus {
  if (database === "healthy" && redisStatus === "healthy") {
    return "healthy";
  }

  if (database === "unhealthy" && redisStatus === "unhealthy") {
    return "unhealthy";
  }

  return "degraded";
}

export async function GET() {
  const [database, redisStatus] = await Promise.all([checkDatabase(), checkRedis()]);
  const status = resolveStatus(database, redisStatus);

  return NextResponse.json(
    {
      status,
      timestamp: new Date().toISOString(),
      checks: {
        app: "healthy",
        database,
        redis: redisStatus,
      },
    },
    { status: status === "healthy" ? 200 : status === "degraded" ? 207 : 503 },
  );
}
