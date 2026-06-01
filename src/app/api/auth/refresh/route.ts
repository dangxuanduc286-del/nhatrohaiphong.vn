import { fail, ok } from "@/server/api/response";
import { getRefreshCookie, getRequestMeta, setRefreshCookie } from "@/server/auth/cookies";
import { refresh } from "@/server/auth/service";
import { AppError } from "@/lib/errors";

export async function POST() {
  try {
    const refreshToken = await getRefreshCookie();
    if (!refreshToken) {
      throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
    }
    const meta = await getRequestMeta();
    const result = await refresh(refreshToken, meta);
    await setRefreshCookie(result.refreshToken, result.expiresAt);
    return ok({ user: result.user, accessToken: result.accessToken });
  } catch (error) {
    return fail(error);
  }
}
