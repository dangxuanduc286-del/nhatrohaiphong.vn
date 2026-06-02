import { fail, ok } from "@/server/api/response";
import { getRequestMeta, setRefreshCookie } from "@/server/auth/cookies";
import { shouldExposeAuthDebugTokens } from "@/server/auth/email";
import { register } from "@/server/auth/service";
import { registerSchema } from "@/server/auth/validators";

export async function POST(request: Request) {
  try {
    const input = registerSchema.parse(await request.json());
    const meta = await getRequestMeta();
    const result = await register(input, meta);
    await setRefreshCookie(result.refreshToken, result.expiresAt);
    return ok(
      {
        user: result.user,
        accessToken: result.accessToken,
        debug: shouldExposeAuthDebugTokens() ? { verificationToken: result.verificationToken } : undefined,
      },
      { status: 201 },
    );
  } catch (error) {
    return fail(error);
  }
}
