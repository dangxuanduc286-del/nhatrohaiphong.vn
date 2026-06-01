import { fail, ok } from "@/server/api/response";
import { getRequestMeta } from "@/server/auth/cookies";
import { changePassword } from "@/server/auth/service";
import { getAuthFromAuthorizationHeader } from "@/server/auth/server";
import { changePasswordSchema } from "@/server/auth/validators";

export async function POST(request: Request) {
  try {
    const auth = await getAuthFromAuthorizationHeader(request.headers.get("authorization"));
    const input = changePasswordSchema.parse(await request.json());
    const meta = await getRequestMeta();
    await changePassword(auth.payload.userId, input.currentPassword, input.password, meta);
    return ok({ success: true });
  } catch (error) {
    return fail(error);
  }
}
