import { fail, ok } from "@/server/api/response";
import { clearRefreshCookie, getRefreshCookie, getRequestMeta } from "@/server/auth/cookies";
import { logout } from "@/server/auth/service";

export async function POST() {
  try {
    const meta = await getRequestMeta();
    const refreshToken = await getRefreshCookie();
    await logout(refreshToken, meta);
    await clearRefreshCookie();
    return ok({ success: true });
  } catch (error) {
    return fail(error);
  }
}
