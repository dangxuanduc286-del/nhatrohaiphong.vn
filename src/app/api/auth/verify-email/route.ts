import { fail, ok } from "@/server/api/response";
import { getRequestMeta } from "@/server/auth/cookies";
import { verifyEmail } from "@/server/auth/service";
import { verifyEmailSchema } from "@/server/auth/validators";

export async function POST(request: Request) {
  try {
    const input = verifyEmailSchema.parse(await request.json());
    const meta = await getRequestMeta();
    await verifyEmail(input.token, meta);
    return ok({ success: true });
  } catch (error) {
    return fail(error);
  }
}
