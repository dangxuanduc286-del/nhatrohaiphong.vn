import { redirect } from "next/navigation";

import { getRefreshCookie } from "@/server/auth/cookies";
import { requireRoleValue } from "@/server/auth/rbac";
import { getAuthFromRefreshToken } from "@/server/auth/service";

export async function requireUserAccountPage() {
  const refreshToken = await getRefreshCookie();
  if (!refreshToken) redirect("/login?next=/account");

  try {
    const auth = await getAuthFromRefreshToken(refreshToken);
    if (auth.payload.role === "LANDLORD") redirect("/landlord");
    if (auth.payload.role === "ADMIN" || auth.payload.role === "SUPER_ADMIN") redirect("/admin");
    requireRoleValue(auth.payload.role, ["USER"]);
    return auth;
  } catch {
    redirect("/login?next=/account");
  }
}
