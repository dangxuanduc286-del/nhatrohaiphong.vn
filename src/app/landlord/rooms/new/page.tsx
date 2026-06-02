import { LandlordRoomForm } from "@/components/rooms/landlord-room-form";
import { db } from "@/lib/db";
import { requireLandlordPage } from "@/server/landlord/utils";

export default async function CreateLandlordRoomPage() {
  const auth = await requireLandlordPage("room.create");
  const userId = auth.payload.userId;

  const [districts, wards, buildings] = await Promise.all([
    db.district.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    db.ward.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" }, select: { id: true, name: true, district: { select: { name: true } } } }),
    db.building.findMany({ where: { deletedAt: null, property: { ownerId: userId, deletedAt: null } }, orderBy: { name: "asc" }, select: { id: true, name: true, address: true } }),
  ]);

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Đăng phòng</p>
        <h2 className="mt-2 text-3xl font-bold">Tạo phòng mới</h2>
        <p className="mt-2 text-sm text-slate-600">Form lưu trực tiếp vào Room hiện có, bao gồm latitude/longitude từ bộ chọn vị trí.</p>
      </div>

      <LandlordRoomForm
        mode="create"
        districts={districts.map((district) => ({ id: district.id, label: district.name }))}
        wards={wards.map((ward) => ({ id: ward.id, label: `${ward.name} · ${ward.district.name}` }))}
        buildings={buildings.map((building) => ({ id: building.id, label: `${building.name} · ${building.address}` }))}
      />
    </section>
  );
}
