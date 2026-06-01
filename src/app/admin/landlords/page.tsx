import { db } from "@/lib/db";

function formatNumber(value: number) {
  return value.toLocaleString("vi-VN");
}

export default async function AdminLandlordsPage({ searchParams }: { searchParams?: Promise<{ status?: string }> }) {
  const params = await searchParams;
  const status = params?.status ?? "active";
  const where = status === "deleted" ? { deletedAt: { not: null } } : { deletedAt: null, status: status === "suspended" ? "BANNED" as const : "ACTIVE" as const, roles: { some: { role: { slug: "landlord" } } } };
  const landlords = await db.user.findMany({ where, orderBy: { createdAt: "desc" }, take: 50, select: { id: true, fullName: true, email: true, phone: true, status: true, deletedAt: true, properties: { where: { deletedAt: null }, select: { id: true, buildings: { where: { deletedAt: null }, select: { rooms: { where: { deletedAt: null }, select: { id: true, status: true, recentlyViewed: { select: { id: true } } } } } } } } } });

  return (
    <section className="space-y-6">
      <div><p className="text-sm font-medium uppercase tracking-wide text-slate-500">Landlord Management</p><h2 className="text-2xl font-bold">Quản lý chủ trọ</h2><p className="mt-2 max-w-3xl text-sm text-slate-600">Danh sách chủ trọ từ role landlord, thống kê phòng/view/tin đang hoạt động theo schema hiện có.</p></div>
      <form className="rounded-2xl border bg-white p-4 shadow-sm"><select name="status" defaultValue={status} className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-slate-900 sm:w-64"><option value="active">Active</option><option value="suspended">Suspended</option><option value="deleted">Deleted</option></select><button className="mt-3 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white sm:ml-3 sm:mt-0">Lọc</button></form>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{landlords.map((landlord) => { const rooms = landlord.properties.flatMap((property) => property.buildings.flatMap((building) => building.rooms)); const views = rooms.reduce((sum, room) => sum + room.recentlyViewed.length, 0); const active = rooms.filter((room) => room.status === "AVAILABLE").length; return <article key={landlord.id} className="rounded-2xl border bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><h3 className="font-bold">{landlord.fullName}</h3><p className="text-sm text-slate-500">{landlord.email}</p><p className="text-sm text-slate-500">{landlord.phone ?? "Chưa có phone"}</p></div><span className="rounded-full bg-slate-900 px-2 py-1 text-xs text-white">{landlord.deletedAt ? "DELETED" : landlord.status}</span></div><div className="mt-5 grid grid-cols-3 gap-2 text-center text-sm"><div className="rounded-xl bg-slate-50 p-3"><strong>{formatNumber(rooms.length)}</strong><p className="text-xs text-slate-500">Phòng</p></div><div className="rounded-xl bg-slate-50 p-3"><strong>{formatNumber(views)}</strong><p className="text-xs text-slate-500">Views</p></div><div className="rounded-xl bg-slate-50 p-3"><strong>{formatNumber(active)}</strong><p className="text-xs text-slate-500">Active</p></div></div></article>; })}</div>
    </section>
  );
}
