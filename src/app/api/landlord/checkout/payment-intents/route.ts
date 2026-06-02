import { cookies } from "next/headers";

import { env } from "@/lib/env/index";
import { fail, ok } from "@/server/api/response";
import { createLandlordCheckoutIntent } from "@/server/landlord/checkout";
import { requireLandlordApi } from "@/server/landlord/rooms";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const auth = await requireLandlordApi(cookieStore.get(env.AUTH_COOKIE_NAME)?.value ?? null, "room.create");
    const result = await createLandlordCheckoutIntent({ ...(await request.json()), userId: auth.payload.userId });
    return ok(result, { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
