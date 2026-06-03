import Link from "next/link";

import { db } from "@/lib/db";
import { requireLandlordPage } from "@/server/landlord/utils";

const roomStatusLabels: Record<string, string> = {
  AVAILABLE: "Đang hiển thị",
  OCCUPIED: "Đã thuê",
  MAINTENANCE: "Bảo trì",
  HIDDEN: "Đã ẩn",
};

export default async function LandlordDashboardPage() {
  const auth = await requireLandlordPage();
  const userId = auth.payload.userId;

  const [totalRooms, activeRooms, pendingRooms, recentRooms] = await Promise.all([
    db.room.count({ where: { createdBy: userId, deletedAt: null } }),
    db.room.count({ where: { createdBy: userId, deletedAt: null, status: "AVAILABLE" } }),
    db.room.count({ where: { createdBy: userId, deletedAt: null, status: { not: "AVAILABLE" } } }),
    db.room.findMany({
      where: { createdBy: userId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: { id: true, roomCode: true, title: true, status: true, createdAt: true },
    }),
  ]);

  const onboardingSteps = [
    { label: "Tạo tài khoản", done: true },
    { label: "Đăng phòng đầu tiên", done: totalRooms > 0 },
    { label: "Hoàn thiện tin đăng", done: activeRooms > 0 },
    { label: "Nhận liên hệ", done: false },
  ];

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">
        <div className="bg-gradient-to-r from-blue-700 to-blue-500 p-6 text-white">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-100">Đăng phòng miễn phí</p>
          <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-3xl font-bold">Hoàn thành phòng đầu tiên trong vài phút</h2>
              <p className="mt-2 max-w-3xl text-sm text-blue-50">Chuẩn bị giá thuê, diện tích, địa chỉ và chọn nhà/tòa nhà đã có để phòng xuất hiện nhanh hơn với người thuê.</p>
            </div>
            <Link href="/landlord/rooms/new" data-analytics-event="landlord_room_create_start" data-analytics-location="landlord_dashboard_hero" data-analytics-label="Đăng phòng mới" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-white px-5 text-sm font-bold text-blue-700 shadow-sm hover:bg-blue-50">Đăng phòng mới</Link>
          </div>
        </div>
        <div className="grid gap-3 p-4 text-sm font-semibold text-slate-600 sm:grid-cols-3">
          <span className="rounded-2xl bg-blue-50 px-4 py-3 text-blue-700">✓ Đăng tin miễn phí</span>
          <span className="rounded-2xl bg-slate-50 px-4 py-3">✓ Cập nhật trạng thái phòng</span>
          <span className="rounded-2xl bg-orange-50 px-4 py-3 text-orange-700">✓ Tăng khả năng được liên hệ</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border bg-white p-5 shadow-sm"><div className="text-sm text-slate-500">Tổng phòng</div><div className="mt-2 text-2xl font-bold">{totalRooms.toLocaleString("vi-VN")}</div><div className="text-xs text-slate-500">Tin đăng của bạn</div></div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm"><div className="text-sm text-slate-500">Phòng active</div><div className="mt-2 text-2xl font-bold">{activeRooms.toLocaleString("vi-VN")}</div><div className="text-xs text-slate-500">Đang hiển thị công khai</div></div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm"><div className="text-sm text-slate-500">Cần cập nhật</div><div className="mt-2 text-2xl font-bold">{pendingRooms.toLocaleString("vi-VN")}</div><div className="text-xs text-slate-500">Tin chưa active hoặc cần chỉnh sửa</div></div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm"><div className="text-sm text-slate-500">Bước tiếp theo</div><div className="mt-2 text-base font-bold text-blue-700">{totalRooms === 0 ? "Đăng phòng đầu tiên" : activeRooms === 0 ? "Hoàn thiện tin" : "Cập nhật tin thường xuyên"}</div><div className="text-xs text-slate-500">Tăng khả năng nhận liên hệ</div></div>
      </div>

      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h3 className="font-semibold">Checklist đăng phòng hiệu quả</h3>
            <p className="mt-1 text-sm text-slate-500">Làm theo 4 bước để tăng tỷ lệ hoàn thành phòng đầu tiên và nhận liên hệ.</p>
          </div>
          <Link href="/landlord/rooms/new" data-analytics-event="landlord_room_create_start" data-analytics-location="landlord_dashboard_checklist" data-analytics-label="Bắt đầu đăng phòng" className="rounded-xl bg-blue-700 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-blue-800">Bắt đầu đăng phòng</Link>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          {onboardingSteps.map((step, index) => (
            <div key={step.label} className={`rounded-2xl border p-4 text-sm ${step.done ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "bg-slate-50 text-slate-600"}`}>
              <div className="font-semibold">Bước {index + 1}</div>
              <div className="mt-1">{step.done ? "✓ " : "○ "}{step.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b p-4 sm:flex-row sm:items-center">
          <div>
            <h3 className="font-semibold">Phòng đăng gần đây</h3>
            <p className="text-sm text-slate-500">Ưu tiên sửa tin thiếu giá, diện tích, vị trí hoặc trạng thái để tăng tỷ lệ được gọi.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link href="/phong-tro-hai-phong" data-analytics-event="cta_find_room_click" data-analytics-location="landlord_dashboard_recent_rooms" data-analytics-label="Xem trang tìm phòng" className="rounded-xl border px-4 py-2 text-center text-sm font-semibold hover:border-blue-300 hover:text-blue-700">Xem trang tìm phòng</Link>
            <Link href="/landlord/rooms/new" data-analytics-event="landlord_room_create_start" data-analytics-location="landlord_dashboard_recent_rooms" data-analytics-label="Thêm phòng" className="rounded-xl bg-blue-700 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-blue-800">Thêm phòng</Link>
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {recentRooms.length ? recentRooms.map((room) => (
            <div key={room.id} className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center">
              <div>
                <div className="font-medium text-slate-950">{room.title}</div>
                <div className="mt-1 text-xs text-slate-500">{room.roomCode} · {roomStatusLabels[room.status] ?? room.status}</div>
              </div>
              <Link href={`/landlord/rooms/${room.id}/edit`} data-analytics-event="landlord_room_edit_start" data-analytics-location="landlord_dashboard_recent_rooms" data-analytics-label={room.status} className="inline-flex rounded-lg border bg-white px-3 py-1.5 text-xs font-semibold hover:border-blue-300 hover:text-blue-700">Sửa tin</Link>
            </div>
          )) : <div className="p-8 text-center text-sm text-slate-500"><p className="font-semibold text-slate-700">Bạn chưa có phòng nào.</p><p className="mt-2">Hãy đăng phòng đầu tiên miễn phí. Chuẩn bị giá thuê, diện tích, địa chỉ và chọn nhà/tòa nhà để hoàn thành nhanh hơn.</p><Link href="/landlord/rooms/new" data-analytics-event="landlord_room_create_start" data-analytics-location="landlord_dashboard_empty_state" data-analytics-label="Đăng phòng đầu tiên" className="mt-4 inline-flex rounded-xl bg-blue-700 px-4 py-2 font-semibold text-white hover:bg-blue-800">Đăng phòng đầu tiên</Link></div>}
        </div>
      </div>
    </section>
  );
}
