import { fail, ok } from "@/server/api/response";
import { getRequestMeta } from "@/server/auth/cookies";
import { resetPassword } from "@/server/auth/service";
import { resetPasswordSchema } from "@/server/auth/validators";

export async function POST(request: Request) {
  try {
    const input = resetPasswordSchema.parse(await request.json());
    const meta = await getRequestMeta();
    await resetPassword(input.token, input.password, meta);
    return ok({ success: true });
  } catch (error) {
    return fail(error);
  }
}
