import { fail, ok } from "@/server/api/response";
import { requireAuth } from "@/server/auth/server";
import { createLandlordCheckoutIntent } from "@/server/landlord/checkout";

export async function POST(request: Request) {
  try {
    const auth = await requireAuth(request.headers.get("authorization"));
    const result = await createLandlordCheckoutIntent({ ...(await request.json()), userId: auth.payload.userId });
    return ok(result, { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
