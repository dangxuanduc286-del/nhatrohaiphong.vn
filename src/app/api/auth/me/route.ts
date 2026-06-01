import { fail, ok } from "@/server/api/response";
import { getAuthFromAuthorizationHeader } from "@/server/auth/server";

export async function GET(request: Request) {
  try {
    const auth = await getAuthFromAuthorizationHeader(request.headers.get("authorization"));
    return ok({ user: auth.user });
  } catch (error) {
    return fail(error);
  }
}
