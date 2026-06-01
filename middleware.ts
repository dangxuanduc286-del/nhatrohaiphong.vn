import { NextResponse, type NextRequest } from "next/server";

import type { SystemRole } from "@/server/auth/constants";

const ROUTE_RULES: Array<{ prefix: string; roles: SystemRole[]; permission?: string }> = [
  { prefix: "/admin", roles: ["ADMIN"], permission: "system.manage" },
  { prefix: "/api/admin", roles: ["ADMIN"], permission: "system.manage" },
  { prefix: "/landlord", roles: ["LANDLORD", "ADMIN"], permission: "room.create" },
  { prefix: "/api/landlord", roles: ["LANDLORD", "ADMIN"], permission: "room.create" },
];

function getRule(pathname: string) {
  return ROUTE_RULES.find((rule) => pathname === rule.prefix || pathname.startsWith(`${rule.prefix}/`));
}

function unauthorized() {
  return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Unauthorized" } }, { status: 401 });
}

function forbidden() {
  return NextResponse.json({ error: { code: "FORBIDDEN", message: "Forbidden" } }, { status: 403 });
}

export async function middleware(request: NextRequest) {
  const rule = getRule(request.nextUrl.pathname);

  if (!rule) {
    return NextResponse.next();
  }

  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return unauthorized();
  }

  const authorizeUrl = new URL("/api/internal/auth/authorize", request.url);
  const response = await fetch(authorizeUrl, {
    method: "POST",
    headers: {
      authorization,
      "content-type": "application/json",
    },
    body: JSON.stringify({ roles: rule.roles, permission: rule.permission }),
  });

  if (response.status === 401) {
    return unauthorized();
  }

  if (response.status === 403) {
    return forbidden();
  }

  if (!response.ok) {
    return unauthorized();
  }

  const data = (await response.json()) as { data?: { userId?: string; role?: string; sessionId?: string } };
  const nextResponse = NextResponse.next();

  if (data.data?.userId) {
    nextResponse.headers.set("x-auth-user-id", data.data.userId);
  }
  if (data.data?.role) {
    nextResponse.headers.set("x-auth-role", data.data.role);
  }
  if (data.data?.sessionId) {
    nextResponse.headers.set("x-auth-session-id", data.data.sessionId);
  }

  return nextResponse;
}

export const config = {
  matcher: ["/admin/:path*", "/landlord/:path*", "/api/admin/:path*", "/api/landlord/:path*"],
};
