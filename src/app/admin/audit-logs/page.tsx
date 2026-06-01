import { db } from "@/lib/db";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(value);
}

export default async function AdminAuditLogsPage({ searchParams }: { searchParams?: Promise<{ entity?: string }> }) {
  const params = await searchParams;
  const entity = params?.entity?.trim();
  const logs = await db.auditLog.findMany({ where: entity ? { entityType: entity } : undefined, orderBy: { createdAt: "desc" }, take: 100, include: { user: { select: { fullName: true, email: true } } } });
  const entities = await db.auditLog.groupBy({ by: ["entityType"], _count: { _all: true }, orderBy: { _count: { entityType: "desc" } }, take: 10 });

  return (
    <section className="space-y-6">
      <div><p className="text-sm font-medium uppercase tracking-wide text-slate-500">Logs</p><h2 className="text-2xl font-bold">Audit logs</h2><p className="mt-2 max-w-3xl text-sm text-slate-600">Theo dõi action logs và audit trail để phục vụ truy vết vận hành, moderation và user management.</p></div>
      <form className="grid gap-3 rounded-2xl border bg-white p-4 shadow-sm sm:grid-cols-[1fr_auto]"><input name="entity" defaultValue={entity ?? ""} placeholder="Filter entity type, ví dụ: User, Room" className="min-w-0 rounded-xl border px-3 py-2 text-sm outline-none focus:border-slate-900" /><button className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Lọc logs</button></form>
      <div className="grid gap-6 xl:grid-cols-4">
        <div className="rounded-2xl border bg-white p-5 shadow-sm"><h3 className="font-semibold">Entity phổ biến</h3><div className="mt-4 space-y-2">{entities.map((item) => <div key={item.entityType} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-sm"><span>{item.entityType}</span><strong>{item._count._all}</strong></div>)}</div></div>
        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm xl:col-span-3"><div className="overflow-x-auto"><table className="min-w-[760px] divide-y divide-slate-200 text-sm"><thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Action</th><th className="px-4 py-3">Entity</th><th className="px-4 py-3">User</th><th className="px-4 py-3">Time</th></tr></thead><tbody className="divide-y divide-slate-100">{logs.map((log) => <tr key={log.id}><td className="px-4 py-3 font-medium">{log.action}</td><td className="px-4 py-3">{log.entityType}{log.entityId ? ` #${log.entityId}` : ""}</td><td className="px-4 py-3">{log.user?.fullName ?? log.user?.email ?? "System"}</td><td className="px-4 py-3 text-slate-500">{formatDate(log.createdAt)}</td></tr>)}</tbody></table></div></div>
      </div>
    </section>
  );
}
