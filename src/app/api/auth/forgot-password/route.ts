import { fail, ok } from "@/server/api/response";
import { getRequestMeta } from "@/server/auth/cookies";
import { requestPasswordReset } from "@/server/auth/service";
import { enforceAuthActionRateLimit } from "@/server/auth/rate-limit";
import { forgotPasswordSchema } from "@/server/auth/validators";

export async function POST(request: Request) {
  try {
    const input = forgotPasswordSchema.parse(await request.json());
    const meta = await getRequestMeta();
    await enforceAuthActionRateLimit("forgot-password", `${meta.ipAddress ?? "unknown"}:${input.email}`);
    await requestPasswordReset(input.email, meta);
    return ok({ success: true });
  } catch (error) {
    return fail(error);
  }
}
