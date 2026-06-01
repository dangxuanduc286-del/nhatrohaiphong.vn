import { fail, ok } from "@/server/api/response";
import { getRequestMeta } from "@/server/auth/cookies";
import { requestPasswordReset } from "@/server/auth/service";
import { forgotPasswordSchema } from "@/server/auth/validators";

export async function POST(request: Request) {
  try {
    const input = forgotPasswordSchema.parse(await request.json());
    const meta = await getRequestMeta();
    const result = await requestPasswordReset(input.email, meta);
    return ok({ success: true, resetToken: result.resetToken });
  } catch (error) {
    return fail(error);
  }
}
