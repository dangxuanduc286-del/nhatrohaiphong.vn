import { fail, ok } from "@/server/api/response";
import { requireAdmin } from "@/server/admin/utils";
import { getSystemSettings } from "@/server/admin/settings";

export async function GET(request: Request) {
  try {
    await requireAdmin(request.headers.get("authorization"), "settings.manage");
    const { searchParams } = new URL(request.url);
    const data = await getSystemSettings(searchParams);
    return ok({ ...data, writable: true });
  } catch (error) {
    return fail(error);
  }
}
