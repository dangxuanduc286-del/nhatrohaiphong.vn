import { fail, ok } from "@/server/api/response";
import { requireAuth } from "@/server/auth/server";
import { getLandlordPaymentStatus } from "@/server/landlord/checkout";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(request.headers.get("authorization"));
    const { id } = await params;
    const intent = await getLandlordPaymentStatus(auth.payload.userId, id);
    return ok({ intent });
  } catch (error) {
    return fail(error);
  }
}
