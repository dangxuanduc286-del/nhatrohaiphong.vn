import { cookies, headers } from "next/headers";

import { env } from "@/lib/env/index";

import { AUTH_COOKIE_OPTIONS } from "./constants";

export async function getRequestMeta() {
  const headerStore = await headers();
  return {
    ipAddress: headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ?? headerStore.get("x-real-ip") ?? null,
    userAgent: headerStore.get("user-agent") ?? null,
  };
}

export async function getRefreshCookie() {
  const cookieStore = await cookies();
  return cookieStore.get(env.AUTH_COOKIE_NAME)?.value ?? null;
}

export async function setRefreshCookie(token: string, expiresAt: Date) {
  const cookieStore = await cookies();
  cookieStore.set(env.AUTH_COOKIE_NAME, token, {
    ...AUTH_COOKIE_OPTIONS,
    expires: expiresAt,
  });
}

export async function clearRefreshCookie() {
  const cookieStore = await cookies();
  cookieStore.set(env.AUTH_COOKIE_NAME, "", {
    ...AUTH_COOKIE_OPTIONS,
    expires: new Date(0),
  });
}
