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

  const hasBuildings = buildings.length > 0;

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Đăng phòng</p>
        <h2 className="mt-2 text-3xl font-bold">Tạo phòng mới</h2>
        <p className="mt-2 text-sm text-slate-600">Điền các thông tin bắt buộc trước: tiêu đề, giá thuê, diện tích, khu vực, nhà/tòa nhà và địa chỉ. Các khoản phí chi tiết có thể bổ sung sau khi tạo phòng.</p>
      </div>

      <div className="grid gap-3 rounded-2xl border bg-white p-5 text-sm shadow-sm md:grid-cols-3">
        <div className="rounded-2xl bg-blue-50 p-4 text-blue-800"><strong>Bước 1</strong><p className="mt-1">Nhập giá, diện tích và sức chứa.</p></div>
        <div className="rounded-2xl bg-blue-50 p-4 text-blue-800"><strong>Bước 2</strong><p className="mt-1">Chọn quận/huyện, phường/xã và nhà/tòa nhà.</p></div>
        <div className="rounded-2xl bg-blue-50 p-4 text-blue-800"><strong>Bước 3</strong><p className="mt-1">Xác nhận địa chỉ để người thuê dễ liên hệ.</p></div>
      </div>

      {!hasBuildings ? (
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5 text-sm text-orange-800 shadow-sm">
          <h3 className="font-semibold">Bạn chưa có nhà/tòa nhà để gắn phòng.</h3>
          <p className="mt-2">Room hiện tại cần chọn nhà/tòa nhà có sẵn. Vui lòng tạo hoặc liên hệ quản trị viên hỗ trợ thiết lập nhà/tòa nhà trước khi đăng phòng đầu tiên.</p>
        </div>
      ) : null}

      <LandlordRoomForm
        mode="create"
        districts={districts.map((district) => ({ id: district.id, label: district.name }))}
        wards={wards.map((ward) => ({ id: ward.id, label: `${ward.name} · ${ward.district.name}` }))}
        buildings={buildings.map((building) => ({ id: building.id, label: `${building.name} · ${building.address}` }))}
      />
    </section>
  );
}
