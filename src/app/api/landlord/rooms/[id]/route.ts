import { cookies } from "next/headers";

import { db } from "@/lib/db";
import { env } from "@/lib/env/index";
import { fail, ok } from "@/server/api/response";
import { landlordRoomInputSchema } from "@/server/landlord/room-validators";
import { assertLandlordBuildingAccess, assertLandlordRoomAccess, requireLandlordApi, toRoomData } from "@/server/landlord/rooms";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const auth = await requireLandlordApi(cookieStore.get(env.AUTH_COOKIE_NAME)?.value ?? null, "room.update");
    const { id } = await params;
    await assertLandlordRoomAccess(id, auth.payload.userId);

    const body = landlordRoomInputSchema.parse(await request.json());
    const building = await assertLandlordBuildingAccess(body.buildingId, auth.payload.userId);

    const room = await db.room.update({
      where: { id },
      data: toRoomData({ ...body, districtId: building.districtId, wardId: building.wardId }, auth.payload.userId),
      select: { id: true, roomCode: true, title: true, slug: true, latitude: true, longitude: true, updatedAt: true },
    });

    return ok({ room });
  } catch (error) {
    return fail(error);
  }
}
