import { fail, ok } from "@/server/api/response";
import { getRequestMeta } from "@/server/auth/cookies";
import { shouldExposeAuthDebugTokens } from "@/server/auth/email";
import { requestPasswordReset } from "@/server/auth/service";
import { enforceAuthActionRateLimit } from "@/server/auth/rate-limit";
import { forgotPasswordSchema } from "@/server/auth/validators";

export async function POST(request: Request) {
  try {
    const input = forgotPasswordSchema.parse(await request.json());
    const meta = await getRequestMeta();
    await enforceAuthActionRateLimit("forgot-password", `${meta.ipAddress ?? "unknown"}:${input.identifier}`);
    const result = await requestPasswordReset(input.identifier, meta);
    return ok({ success: true, debug: shouldExposeAuthDebugTokens() ? { resetToken: result.resetToken } : undefined });
  } catch (error) {
    return fail(error);
  }
}
