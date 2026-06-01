import { db } from "@/lib/db";

const numberFormatter = new Intl.NumberFormat("vi-VN");

function formatNumber(value: number) {
  return numberFormatter.format(value);
}

function formatDate(value: Date | null) {
  if (!value) {
    return "Chưa có";
  }

  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(value);
}

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

const overviewCards = [
  { label: "Tổng số phòng trọ", key: "rooms", tone: "border-blue-200 bg-blue-50 text-blue-900" },
  { label: "Tổng số chủ trọ", key: "landlords", tone: "border-emerald-200 bg-emerald-50 text-emerald-900" },
  { label: "Tổng số người dùng", key: "users", tone: "border-slate-200 bg-white text-slate-900" },
  { label: "Tin đang hoạt động", key: "activeListings", tone: "border-green-200 bg-green-50 text-green-900" },
  { label: "Tin chờ xử lý", key: "pendingSignals", tone: "border-amber-200 bg-amber-50 text-amber-900" },
  { label: "Tin bị ẩn", key: "hiddenListings", tone: "border-orange-200 bg-orange-50 text-orange-900" },
  { label: "Tin bảo trì", key: "lockedListings", tone: "border-red-200 bg-red-50 text-red-900" },
  { label: "Báo cáo vi phạm", key: "openReports", tone: "border-rose-200 bg-rose-50 text-rose-900" },
] as const;

export default async function AdminDashboardPage() {
  const today = startOfDay(new Date());
  const last7Days = addDays(today, -6);
  const last30Days = addDays(today, -29);

  const [
    users,
    landlords,
    rooms,
    activeListings,
    hiddenListings,
    lockedListings,
    openReports,
    reviewingReports,
    newUsers30d,
    newLandlords30d,
    newRooms30d,
    recentlyViewed30d,
    popularDistricts,
    recentAuditLogs,
  ] = await Promise.all([
    db.user.count({ where: { deletedAt: null } }),
    db.user.count({ where: { deletedAt: null, roles: { some: { role: { slug: "landlord", deletedAt: null } } } } }),
    db.room.count({ where: { deletedAt: null } }),
    db.room.count({ where: { deletedAt: null, status: "AVAILABLE" } }),
    db.room.count({ where: { deletedAt: null, status: "HIDDEN" } }),
    db.room.count({ where: { deletedAt: null, status: "MAINTENANCE" } }),
    db.report.count({ where: { deletedAt: null, status: "OPEN" } }),
    db.report.count({ where: { deletedAt: null, status: "REVIEWING" } }),
    db.user.count({ where: { deletedAt: null, createdAt: { gte: last30Days } } }),
    db.user.count({ where: { deletedAt: null, createdAt: { gte: last30Days }, roles: { some: { role: { slug: "landlord", deletedAt: null } } } } }),
    db.room.count({ where: { deletedAt: null, createdAt: { gte: last30Days } } }),
    db.recentlyViewed.count({ where: { viewedAt: { gte: last30Days } } }),
    db.room.groupBy({
      by: ["districtId"],
      where: { deletedAt: null },
      _count: { _all: true },
      orderBy: { _count: { districtId: "desc" } },
      take: 5,
    }),
    db.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: { id: true, action: true, entityType: true, entityId: true, createdAt: true, user: { select: { fullName: true, email: true } } },
    }),
  ]);

  const districtIds = popularDistricts.map((item) => item.districtId);
  const districts = districtIds.length
    ? await db.district.findMany({ where: { id: { in: districtIds } }, select: { id: true, name: true } })
    : [];
  const districtNameById = new Map(districts.map((district) => [district.id, district.name]));

  const dailyGrowth = await Promise.all(
    Array.from({ length: 7 }, async (_, index) => {
      const day = addDays(last7Days, index);
      const nextDay = addDays(day, 1);
      const [dayUsers, dayRooms] = await Promise.all([
        db.user.count({ where: { deletedAt: null, createdAt: { gte: day, lt: nextDay } } }),
        db.room.count({ where: { deletedAt: null, createdAt: { gte: day, lt: nextDay } } }),
      ]);

      return {
        label: new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit" }).format(day),
        users: dayUsers,
        rooms: dayRooms,
      };
    }),
  );

  const values = {
    users,
    landlords,
    rooms,
    activeListings,
    pendingSignals: openReports + reviewingReports,
    hiddenListings,
    lockedListings,
    openReports,
  };
  const maxGrowth = Math.max(1, ...dailyGrowth.map((item) => Math.max(item.users, item.rooms)));

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-slate-500">Production Admin</p>
          <h2 className="text-2xl font-bold text-slate-950 sm:text-3xl">Dashboard vận hành</h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">Theo dõi dữ liệu phòng trọ, người dùng, moderation, báo cáo vi phạm và tăng trưởng dựa trên dữ liệu hiện có.</p>
        </div>
        <div className="rounded-full border bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">Cập nhật: {formatDate(new Date())}</div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {overviewCards.map((item) => (
          <div key={item.key} className={`rounded-2xl border p-5 shadow-sm ${item.tone}`}>
            <div className="text-sm font-medium opacity-80">{item.label}</div>
            <div className="mt-3 text-3xl font-bold">{formatNumber(values[item.key])}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5 shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">Tăng trưởng 7 ngày</h3>
              <p className="text-sm text-slate-500">User mới và tin đăng mới theo ngày.</p>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-7 gap-2 sm:gap-4">
            {dailyGrowth.map((item) => (
              <div key={item.label} className="flex min-h-44 flex-col justify-end gap-2 rounded-xl bg-slate-50 p-2 text-center">
                <div className="flex flex-1 items-end justify-center gap-1">
                  <div className="w-3 rounded-t bg-blue-500" style={{ height: `${Math.max(8, (item.users / maxGrowth) * 120)}px` }} title={`${item.users} user mới`} />
                  <div className="w-3 rounded-t bg-emerald-500" style={{ height: `${Math.max(8, (item.rooms / maxGrowth) * 120)}px` }} title={`${item.rooms} tin mới`} />
                </div>
                <div className="text-[11px] text-slate-500">{item.label}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-600">
            <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-blue-500" />User mới</span>
            <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" />Tin đăng mới</span>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold">Analytics 30 ngày</h3>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3"><span>User mới</span><strong>{formatNumber(newUsers30d)}</strong></div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3"><span>Chủ trọ mới</span><strong>{formatNumber(newLandlords30d)}</strong></div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3"><span>Tin đăng mới</span><strong>{formatNumber(newRooms30d)}</strong></div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3"><span>Lượt xem phòng</span><strong>{formatNumber(recentlyViewed30d)}</strong></div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold">Khu vực phổ biến</h3>
          <div className="mt-4 space-y-3">
            {popularDistricts.length ? popularDistricts.map((item) => (
              <div key={item.districtId} className="flex items-center justify-between gap-4 rounded-xl border p-3">
                <span className="truncate text-sm font-medium">{districtNameById.get(item.districtId) ?? item.districtId}</span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold">{formatNumber(item._count._all)} tin</span>
              </div>
            )) : <p className="text-sm text-slate-500">Chưa có dữ liệu khu vực.</p>}
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold">Audit logs gần đây</h3>
          <div className="mt-4 space-y-3">
            {recentAuditLogs.length ? recentAuditLogs.map((log) => (
              <div key={log.id} className="rounded-xl border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium text-slate-900">{log.action}</span>
                  <span className="text-xs text-slate-500">{formatDate(log.createdAt)}</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">{log.entityType}{log.entityId ? ` #${log.entityId}` : ""}</p>
                <p className="mt-1 text-xs text-slate-500">{log.user?.fullName ?? log.user?.email ?? "System"}</p>
              </div>
            )) : <p className="text-sm text-slate-500">Chưa có audit log.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
