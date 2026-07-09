import { NextResponse, type NextRequest } from "next/server";

import { getAdminRouteRule } from "@/server/admin/rbac";

function getRule(pathname: string) {
  if (!pathname.startsWith("/api/admin")) return null;
  const adminPathname = pathname
    .replace(/^\/api\/admin\/poi(?=\/|$)/, "/admin/points-of-interest")
    .replace(/^\/api\/admin/, "/admin");
  return getAdminRouteRule(adminPathname);
}

function unauthorized() {
  return NextResponse.json(
    { error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
    { status: 401 },
  );
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

  const data = (await response.json()) as {
    data?: { userId?: string; role?: string; sessionId?: string };
  };
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
  matcher: ["/api/admin/:path*"],
};
