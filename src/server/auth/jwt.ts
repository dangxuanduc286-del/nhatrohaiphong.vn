import { jwtVerify, SignJWT } from "jose";

import { env } from "@/lib/env";

import { ACCESS_TOKEN_TTL_SECONDS, type SystemRole } from "./constants";

export type AccessTokenPayload = {
  userId: string;
  role: SystemRole;
  sessionId: string;
};

const secret = new TextEncoder().encode(env.JWT_SECRET);

export async function signAccessToken(payload: AccessTokenPayload) {
  return new SignJWT({ role: payload.role, sessionId: payload.sessionId })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TOKEN_TTL_SECONDS}s`)
    .sign(secret);
}

export async function verifyAccessToken(token: string): Promise<AccessTokenPayload> {
  const { payload } = await jwtVerify(token, secret);

  if (!payload.sub || typeof payload.role !== "string" || typeof payload.sessionId !== "string") {
    throw new Error("Invalid token payload");
  }

  return {
    userId: payload.sub,
    role: payload.role as SystemRole,
    sessionId: payload.sessionId,
  };
}
