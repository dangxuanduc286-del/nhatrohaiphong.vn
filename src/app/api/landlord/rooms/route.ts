import { cookies } from "next/headers";

import { db } from "@/lib/db";
import { env } from "@/lib/env/index";
import { fail, ok } from "@/server/api/response";
import { landlordRoomInputSchema } from "@/server/landlord/room-validators";
import { assertLandlordBuildingAccess, generateUniqueRoomCode, generateUniqueRoomSlug, requireLandlordApi, toRoomData } from "@/server/landlord/rooms";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const auth = await requireLandlordApi(cookieStore.get(env.AUTH_COOKIE_NAME)?.value ?? null, "room.create");
    const body = landlordRoomInputSchema.parse(await request.json());
    const building = await assertLandlordBuildingAccess(body.buildingId, auth.payload.userId);
    const slug = await generateUniqueRoomSlug(body.title);
    const roomCode = await generateUniqueRoomCode();

    const room = await db.room.create({
      data: {
        ...toRoomData({ ...body, districtId: building.districtId, wardId: building.wardId }, auth.payload.userId),
        roomCode,
        slug,
        creator: { connect: { id: auth.payload.userId } },
        status: "AVAILABLE",
      },
      select: { id: true, roomCode: true, title: true, slug: true, latitude: true, longitude: true },
    });

    return ok({ room }, { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
