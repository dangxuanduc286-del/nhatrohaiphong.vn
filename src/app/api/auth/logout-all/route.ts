import { fail, ok } from "@/server/api/response";
import { clearRefreshCookie, getRequestMeta } from "@/server/auth/cookies";
import { logoutAll } from "@/server/auth/service";
import { getAuthFromAuthorizationHeader } from "@/server/auth/server";

export async function POST(request: Request) {
  try {
    const auth = await getAuthFromAuthorizationHeader(request.headers.get("authorization"));
    const meta = await getRequestMeta();
    const result = await logoutAll(auth.payload.userId, meta);
    await clearRefreshCookie();
    return ok({ success: true, revoked: result.revoked });
  } catch (error) {
    return fail(error);
  }
}
