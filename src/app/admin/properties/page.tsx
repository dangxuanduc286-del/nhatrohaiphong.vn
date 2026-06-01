import Link from "next/link";

import { AdminActionButton } from "@/components/ui/admin-action-button";
import type { RoomStatus } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { moderateRoomAction } from "@/server/admin/actions";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(value);
}

function formatMoney(value: unknown) {
  return `${Number(value).toLocaleString("vi-VN")}đ`;
}

export default async function AdminPropertiesPage({ searchParams }: { searchParams?: Promise<{ search?: string; status?: string }> }) {
  const params = await searchParams;
  const search = params?.search?.trim() ?? "";
  const status = params?.status;
  const normalizedStatus: RoomStatus | undefined = status === "AVAILABLE" || status === "OCCUPIED" || status === "RESERVED" || status === "MAINTENANCE" || status === "HIDDEN" ? status : undefined;
  const rooms = await db.room.findMany({
    where: {
      deletedAt: null,
      ...(normalizedStatus ? { status: normalizedStatus } : {}),
      ...(search ? { OR: [{ title: { contains: search, mode: "insensitive" as const } }, { roomCode: { contains: search, mode: "insensitive" as const } }, { address: { contains: search, mode: "insensitive" as const } }] } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 80,
    select: { id: true, roomCode: true, title: true, status: true, price: true, createdAt: true, address: true, building: { select: { property: { select: { name: true, owner: { select: { fullName: true, email: true } } } } } }, reports: { where: { deletedAt: null }, select: { id: true } } },
  });
  const auditLogs = await db.auditLog.findMany({ where: { entityType: "Room", entityId: { in: rooms.map((room) => room.id) } }, orderBy: { createdAt: "desc" }, take: 20 });

  return (
    <section className="space-y-6">
      <div><p className="text-sm font-medium uppercase tracking-wide text-slate-500">Property Management</p><h2 className="text-2xl font-bold">Quản lý tài sản/phòng trọ</h2><p className="mt-2 max-w-3xl text-sm text-slate-600">Search/filter/status/owner/date, action view/moderate/audit history. Không xóa dữ liệu.</p></div>
      <form className="grid gap-3 rounded-2xl border bg-white p-4 shadow-sm sm:grid-cols-[1fr_180px_auto]"><input name="search" defaultValue={search} placeholder="Tìm phòng, mã, địa chỉ" className="min-w-0 rounded-xl border px-3 py-2 text-sm outline-none focus:border-slate-900" /><select name="status" defaultValue={status ?? ""} className="rounded-xl border px-3 py-2 text-sm outline-none focus:border-slate-900"><option value="">Tất cả trạng thái</option><option value="AVAILABLE">AVAILABLE</option><option value="OCCUPIED">OCCUPIED</option><option value="RESERVED">RESERVED</option><option value="MAINTENANCE">MAINTENANCE</option><option value="HIDDEN">HIDDEN</option></select><button className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Lọc</button></form>
      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm"><div className="overflow-x-auto"><table className="min-w-[1080px] divide-y divide-slate-200 text-sm"><thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Phòng</th><th className="px-4 py-3">Chủ sở hữu</th><th className="px-4 py-3">Giá</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Ngày tạo</th><th className="px-4 py-3">Reports</th><th className="px-4 py-3">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{rooms.map((room) => <tr key={room.id} className="align-top"><td className="px-4 py-3"><div className="font-medium">{room.title}</div><div className="text-xs text-slate-500">{room.roomCode}</div><div className="text-xs text-slate-500">{room.address}</div></td><td className="px-4 py-3"><div>{room.building.property.owner.fullName}</div><div className="text-xs text-slate-500">{room.building.property.owner.email}</div><div className="text-xs text-slate-500">{room.building.property.name}</div></td><td className="px-4 py-3">{formatMoney(room.price)}</td><td className="px-4 py-3"><span className="rounded-full bg-slate-900 px-2 py-1 text-xs text-white">{room.status}</span></td><td className="px-4 py-3 text-slate-600">{formatDate(room.createdAt)}</td><td className="px-4 py-3">{room.reports.length}</td><td className="px-4 py-3"><div className="flex flex-wrap gap-2"><Link className="rounded-lg border px-2 py-1 text-xs font-semibold" href={`/admin/rooms?search=${room.roomCode}`}>View</Link><form action={moderateRoomAction}><input type="hidden" name="id" value={room.id} /><input type="hidden" name="action" value="HIDE" /><input type="hidden" name="reason" value="Moderate from property management" /><AdminActionButton label="Moderate" message={`Ẩn phòng ${room.roomCode}?`} /></form></div></td></tr>)}</tbody></table></div></div>
      <div className="rounded-2xl border bg-white p-5 shadow-sm"><h3 className="font-semibold">Audit history gần đây</h3><div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">{auditLogs.map((log) => <div key={log.id} className="rounded-xl border p-3 text-sm"><div className="font-medium">{log.action}</div><div className="text-xs text-slate-500">{log.entityId}</div><div className="text-xs text-slate-500">{formatDate(log.createdAt)}</div></div>)}</div></div>
    </section>
  );
}
