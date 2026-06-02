import { notFound } from "next/navigation";

import { LandlordRoomForm } from "@/components/rooms/landlord-room-form";
import { db } from "@/lib/db";
import { requireLandlordPage } from "@/server/landlord/utils";

function toNumber(value: { toString(): string } | number | null | undefined) {
  if (value === null || typeof value === "undefined") return null;
  return Number(value.toString());
}

export default async function EditLandlordRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const auth = await requireLandlordPage("room.update");
  const { id } = await params;
  const userId = auth.payload.userId;

  const [room, districts, wards, buildings] = await Promise.all([
    db.room.findFirst({
      where: { id, deletedAt: null, createdBy: userId },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        deposit: true,
        area: true,
        floor: true,
        capacity: true,
        electricPrice: true,
        waterPrice: true,
        internetFee: true,
        serviceFee: true,
        parkingFee: true,
        address: true,
        districtId: true,
        wardId: true,
        buildingId: true,
        availableFrom: true,
        latitude: true,
        longitude: true,
      },
    }),
    db.district.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    db.ward.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" }, select: { id: true, name: true, district: { select: { name: true } } } }),
    db.building.findMany({ where: { deletedAt: null, property: { ownerId: userId, deletedAt: null } }, orderBy: { name: "asc" }, select: { id: true, name: true, address: true } }),
  ]);

  if (!room) {
    notFound();
  }

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Chỉnh sửa phòng</p>
        <h2 className="mt-2 text-3xl font-bold">{room.title}</h2>
        <p className="mt-2 text-sm text-slate-600">Cập nhật thông tin phòng và vị trí latitude/longitude hiện có.</p>
      </div>

      <LandlordRoomForm
        mode="edit"
        room={{
          ...room,
          price: toNumber(room.price) ?? "",
          deposit: toNumber(room.deposit),
          area: toNumber(room.area) ?? "",
          electricPrice: toNumber(room.electricPrice),
          waterPrice: toNumber(room.waterPrice),
          internetFee: toNumber(room.internetFee),
          serviceFee: toNumber(room.serviceFee),
          parkingFee: toNumber(room.parkingFee),
          latitude: toNumber(room.latitude),
          longitude: toNumber(room.longitude),
        }}
        districts={districts.map((district) => ({ id: district.id, label: district.name }))}
        wards={wards.map((ward) => ({ id: ward.id, label: `${ward.name} · ${ward.district.name}` }))}
        buildings={buildings.map((building) => ({ id: building.id, label: `${building.name} · ${building.address}` }))}
      />
    </section>
  );
}
