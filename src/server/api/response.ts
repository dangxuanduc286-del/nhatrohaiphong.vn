import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { AppError, toError } from "@/lib/errors";
import { logger } from "@/lib/logger";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ data }, init);
}

export function fail(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid request payload", issues: error.issues } }, { status: 400 });
  }

  if (error instanceof AppError) {
    return NextResponse.json({ error: { code: error.code, message: error.message } }, { status: error.statusCode });
  }

  const normalized = toError(error);
  logger.error({ error: normalized }, "Unhandled API error");
  return NextResponse.json({ error: { code: "INTERNAL_SERVER_ERROR", message: "Internal server error" } }, { status: 500 });
}
