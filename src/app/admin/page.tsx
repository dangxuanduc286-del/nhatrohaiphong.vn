import { db } from "@/lib/db";

const numberFormatter = new Intl.NumberFormat("vi-VN");

function formatNumber(value: number) {
  return numberFormatter.format(value);
}

function formatDate(value: Date | null) {
  if (!value) return "Chưa có";
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(value);
}

const dashboardCards = [
  { label: "Tổng Users", key: "users", tone: "border-slate-200 bg-white text-slate-900" },
  { label: "Tổng Landlords", key: "landlords", tone: "border-emerald-200 bg-emerald-50 text-emerald-900" },
  { label: "Tổng Properties", key: "properties", tone: "border-blue-200 bg-blue-50 text-blue-900" },
  { label: "Tổng Rooms", key: "rooms", tone: "border-cyan-200 bg-cyan-50 text-cyan-900" },
  { label: "Tổng Contracts", key: "contracts", tone: "border-violet-200 bg-violet-50 text-violet-900" },
  { label: "Tổng Invoices", key: "invoices", tone: "border-amber-200 bg-amber-50 text-amber-900" },
  { label: "Tổng Subscriptions", key: "subscriptions", tone: "border-purple-200 bg-purple-50 text-purple-900" },
  { label: "Tổng POI", key: "poi", tone: "border-rose-200 bg-rose-50 text-rose-900" },
  { label: "Tổng Landing Pages", key: "landingPages", tone: "border-green-200 bg-green-50 text-green-900" },
] as const;

export default async function AdminDashboardPage() {
  const [users, landlords, properties, rooms, contracts, invoices, subscriptions, poi, landingPages, recentAuditLogs] = await Promise.all([
    db.user.count({ where: { deletedAt: null } }),
    db.user.count({ where: { deletedAt: null, roles: { some: { role: { slug: "landlord", deletedAt: null } } } } }),
    db.property.count({ where: { deletedAt: null } }),
    db.room.count({ where: { deletedAt: null } }),
    db.contract.count({ where: { deletedAt: null } }),
    db.invoice.count({ where: { deletedAt: null } }),
    db.subscription.count({ where: { deletedAt: null } }),
    db.pointOfInterest.count({ where: { deletedAt: null } }),
    db.landingPage.count({ where: { deletedAt: null } }),
    db.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 8, select: { id: true, action: true, entityType: true, entityId: true, createdAt: true, user: { select: { fullName: true, email: true } } } }),
  ]);

  const values = { users, landlords, properties, rooms, contracts, invoices, subscriptions, poi, landingPages };

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-slate-500">Admin Core Production</p>
          <h2 className="text-2xl font-bold text-slate-950 sm:text-3xl">Dashboard quản trị nền tảng</h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">Tổng quan dữ liệu quản trị cốt lõi. Không triển khai search/maps/landlord/payment features trong Prompt 04.</p>
        </div>
        <div className="rounded-full border bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">Cập nhật: {formatDate(new Date())}</div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {dashboardCards.map((item) => (
          <div key={item.key} className={`rounded-2xl border p-5 shadow-sm ${item.tone}`}>
            <div className="text-sm font-medium opacity-80">{item.label}</div>
            <div className="mt-3 text-3xl font-bold">{formatNumber(values[item.key])}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold">Audit logs gần đây</h3>
        <div className="mt-4 space-y-3">
          {recentAuditLogs.length ? recentAuditLogs.map((log) => (
            <div key={log.id} className="rounded-xl border p-3">
              <div className="flex flex-wrap items-center justify-between gap-2"><span className="font-medium text-slate-900">{log.action}</span><span className="text-xs text-slate-500">{formatDate(log.createdAt)}</span></div>
              <p className="mt-1 text-xs text-slate-500">{log.entityType}{log.entityId ? ` #${log.entityId}` : ""}</p>
              <p className="mt-1 text-xs text-slate-500">{log.user?.fullName ?? log.user?.email ?? "System"}</p>
            </div>
          )) : <p className="text-sm text-slate-500">Chưa có audit log.</p>}
        </div>
      </div>
    </section>
  );
}
