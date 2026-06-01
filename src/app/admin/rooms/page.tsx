import { AdminActionButton } from "@/components/ui/admin-action-button";
import { db } from "@/lib/db";
import { moderateRoomAction } from "@/server/admin/actions";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(value);
}

function formatMoney(value: unknown) {
  return `${Number(value).toLocaleString("vi-VN")}đ`;
}

const moderationActions = [
  { label: "Duyệt tin", action: "APPROVE" },
  { label: "Từ chối", action: "REJECT" },
  { label: "Ẩn tin", action: "HIDE" },
  { label: "Mở lại", action: "REOPEN" },
  { label: "Bảo trì", action: "MAINTENANCE" },
] as const;

export default async function AdminRoomsPage() {
  const [rooms, reports, auditLogs, counts] = await Promise.all([
    db.room.findMany({
      where: { deletedAt: null },
      orderBy: { updatedAt: "desc" },
      take: 50,
      select: { id: true, roomCode: true, title: true, status: true, price: true, updatedAt: true, district: { select: { name: true } }, ward: { select: { name: true } }, reports: { where: { deletedAt: null }, select: { id: true, status: true } } },
    }),
    db.report.findMany({ where: { deletedAt: null, status: { in: ["OPEN", "REVIEWING"] } }, orderBy: { createdAt: "desc" }, take: 20, include: { room: { select: { title: true, roomCode: true } }, user: { select: { fullName: true, email: true } } } }),
    db.auditLog.findMany({ where: { entityType: "Room" }, orderBy: { createdAt: "desc" }, take: 8, include: { user: { select: { fullName: true, email: true } } } }),
    Promise.all([
      db.room.count({ where: { deletedAt: null } }),
      db.room.count({ where: { deletedAt: null, status: "AVAILABLE" } }),
      db.room.count({ where: { deletedAt: null, status: "HIDDEN" } }),
      db.room.count({ where: { deletedAt: null, status: "MAINTENANCE" } }),
    ]),
  ]);

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">Listing Moderation</p>
        <h2 className="text-2xl font-bold">Quản lý và kiểm duyệt tin đăng</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">Action dùng server action có permission room.moderate, confirmation trình duyệt, trạng thái submit/loading native và audit log. Không xóa dữ liệu phòng.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        {[{ label: "Tổng tin", value: counts[0] }, { label: "Đang hoạt động", value: counts[1] }, { label: "Đã ẩn/từ chối", value: counts[2] }, { label: "Bảo trì", value: counts[3] }].map((item) => <div key={item.label} className="rounded-2xl border bg-white p-4 shadow-sm"><p className="text-xs text-slate-500">{item.label}</p><strong className="text-2xl">{item.value.toLocaleString("vi-VN")}</strong></div>)}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm xl:col-span-2">
          <div className="border-b p-4 font-semibold">Tin đăng gần đây</div>
          <div className="overflow-x-auto">
            <table className="min-w-[980px] divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Tin</th><th className="px-4 py-3">Khu vực</th><th className="px-4 py-3">Giá</th><th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3">Reports</th><th className="px-4 py-3">Cập nhật</th><th className="px-4 py-3">Actions</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {rooms.map((room) => <tr key={room.id} className="align-top"><td className="px-4 py-3"><div className="font-medium">{room.title}</div><div className="text-xs text-slate-500">{room.roomCode}</div></td><td className="px-4 py-3">{room.district.name} / {room.ward.name}</td><td className="px-4 py-3">{formatMoney(room.price)}</td><td className="px-4 py-3"><span className="rounded-full bg-slate-900 px-2 py-1 text-xs text-white">{room.status}</span></td><td className="px-4 py-3">{room.reports.length}</td><td className="px-4 py-3 text-slate-500">{formatDate(room.updatedAt)}</td><td className="px-4 py-3"><div className="flex flex-wrap gap-2">{moderationActions.map((item) => <form key={item.action} action={moderateRoomAction}><input type="hidden" name="id" value={room.id} /><input type="hidden" name="action" value={item.action} /><input type="hidden" name="reason" value={`Admin ${item.label}`} /><AdminActionButton label={item.label} message={`${item.label} tin ${room.roomCode}?`} /></form>)}</div></td></tr>)}
              </tbody>
            </table>
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-2xl border bg-white p-5 shadow-sm"><h3 className="font-semibold">Báo cáo cần xử lý</h3><div className="mt-4 space-y-3">{reports.length ? reports.map((report) => <div key={report.id} className="rounded-xl border p-3 text-sm"><div className="font-medium">{report.reason}</div><div className="mt-1 text-xs text-slate-500">{report.room?.title ?? "Không gắn phòng"}</div><div className="mt-2 inline-flex rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-900">{report.status}</div></div>) : <p className="text-sm text-slate-500">Không có report mở.</p>}</div></div>
          <div className="rounded-2xl border bg-white p-5 shadow-sm"><h3 className="font-semibold">Trạng thái action</h3><p className="mt-2 text-sm text-slate-600">Khi submit, browser hiển thị pending theo form native; lỗi server hiển thị qua error boundary/response, thành công revalidate danh sách và ghi audit log.</p></div>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-5 shadow-sm"><h3 className="font-semibold">Room audit trail gần đây</h3><div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">{auditLogs.length ? auditLogs.map((log) => <div key={log.id} className="rounded-xl border p-3 text-sm"><div className="font-medium">{log.action}</div><div className="mt-1 text-xs text-slate-500">{log.entityId}</div><div className="mt-1 text-xs text-slate-500">{formatDate(log.createdAt)}</div></div>) : <p className="text-sm text-slate-500">Chưa có audit log phòng.</p>}</div></div>
    </section>
  );
}
