import { cookies } from "next/headers";

import { env } from "@/lib/env/index";
import { fail, ok } from "@/server/api/response";
import { getLandlordPaymentStatus } from "@/server/landlord/checkout";
import { requireLandlordApi } from "@/server/landlord/rooms";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const auth = await requireLandlordApi(cookieStore.get(env.AUTH_COOKIE_NAME)?.value ?? null, "room.create");
    const { id } = await params;
    const intent = await getLandlordPaymentStatus(auth.payload.userId, id);
    return ok({ intent });
  } catch (error) {
    return fail(error);
  }
}
