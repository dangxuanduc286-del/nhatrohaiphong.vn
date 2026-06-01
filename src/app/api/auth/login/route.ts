import { fail, ok } from "@/server/api/response";
import { getRequestMeta, setRefreshCookie } from "@/server/auth/cookies";
import { login } from "@/server/auth/service";
import { loginSchema } from "@/server/auth/validators";

export async function POST(request: Request) {
  try {
    const input = loginSchema.parse(await request.json());
    const meta = await getRequestMeta();
    const result = await login(input, meta);
    await setRefreshCookie(result.refreshToken, result.expiresAt);
    return ok({ user: result.user, accessToken: result.accessToken });
  } catch (error) {
    return fail(error);
  }
}
