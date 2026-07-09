import { db } from "@/lib/db";
import { requireAdminPage } from "@/server/admin/utils";

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

function StatCard({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-2 text-3xl font-bold">{value.toLocaleString("vi-VN")}</div>
      {hint ? <div className="mt-1 text-xs text-emerald-700">{hint}</div> : null}
    </div>
  );
}

function Placeholder({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-dashed bg-slate-50 p-4 text-sm text-slate-500">
      <div className="font-medium text-slate-700">{title}</div>
      <p className="mt-1">{description}</p>
    </div>
  );
}

export default async function AdminAnalyticsPage() {
  await requireAdminPage("analytics.view");
  const today = startOfDay(new Date());
  const last7Days = addDays(today, -6);
  const last30Days = addDays(today, -29);
  const [
    views,
    totalRooms,
    activeRooms,
    newRooms,
    totalUsers,
    newUsers,
    totalLandlords,
    newLandlords,
    pendingLandlordRequests,
    topDistricts,
    popularLandingPages,
  ] = await Promise.all([
    db.recentlyViewed.count({ where: { viewedAt: { gte: last30Days } } }),
    db.room.count({ where: { deletedAt: null } }),
    db.room.count({ where: { deletedAt: null, status: "AVAILABLE" } }),
    db.room.count({ where: { deletedAt: null, createdAt: { gte: last30Days } } }),
    db.user.count({ where: { deletedAt: null } }),
    db.user.count({ where: { deletedAt: null, createdAt: { gte: last30Days } } }),
    db.user.count({
      where: { deletedAt: null, roles: { some: { role: { slug: "landlord", deletedAt: null } } } },
    }),
    db.user.count({
      where: {
        deletedAt: null,
        createdAt: { gte: last30Days },
        roles: { some: { role: { slug: "landlord", deletedAt: null } } },
      },
    }),
    db.landlordApprovalRequest.count({ where: { status: "PENDING" } }),
    db.room.groupBy({
      by: ["districtId"],
      where: { deletedAt: null, status: "AVAILABLE" },
      _count: { _all: true },
      orderBy: { _count: { districtId: "desc" } },
      take: 8,
    }),
    db.landingPage.findMany({
      where: { deletedAt: null, isPublished: true },
      select: { id: true, path: true, title: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 6,
    }),
  ]);
  const districts = topDistricts.length
    ? await db.district.findMany({
        where: { id: { in: topDistricts.map((item) => item.districtId) } },
        select: { id: true, name: true },
      })
    : [];
  const districtNameById = new Map(districts.map((district) => [district.id, district.name]));
  const dailyGrowth = await Promise.all(
    Array.from({ length: 7 }, async (_, index) => {
      const day = addDays(last7Days, index);
      const nextDay = addDays(day, 1);
      const [dayUsers, dayRooms, dayViews] = await Promise.all([
        db.user.count({ where: { deletedAt: null, createdAt: { gte: day, lt: nextDay } } }),
        db.room.count({ where: { deletedAt: null, createdAt: { gte: day, lt: nextDay } } }),
        db.recentlyViewed.count({ where: { viewedAt: { gte: day, lt: nextDay } } }),
      ]);
      return {
        label: new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit" }).format(day),
        users: dayUsers,
        rooms: dayRooms,
        views: dayViews,
      };
    }),
  );
  const maxGrowth = Math.max(
    1,
    ...dailyGrowth.map((item) => Math.max(item.users, item.rooms, item.views)),
  );
  const hasTrafficData = views > 0;

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">Analytics</p>
        <h2 className="text-2xl font-bold">Admin analytics</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          Production dashboard cho người dùng, chủ trọ, phòng, yêu cầu nâng cấp và traffic khả dụng.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Tổng Users"
          value={totalUsers}
          hint={`+${newUsers.toLocaleString("vi-VN")} trong 30 ngày`}
        />
        <StatCard
          label="Tổng Landlords"
          value={totalLandlords}
          hint={`+${newLandlords.toLocaleString("vi-VN")} trong 30 ngày`}
        />
        <StatCard
          label="Tổng Rooms"
          value={totalRooms}
          hint={`+${newRooms.toLocaleString("vi-VN")} trong 30 ngày`}
        />
        <StatCard label="Active Rooms" value={activeRooms} />
        <StatCard label="Pending Landlord Requests" value={pendingLandlordRequests} />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5 shadow-sm xl:col-span-2">
          <h3 className="font-semibold">Biểu đồ tăng trưởng 7 ngày</h3>
          <div className="mt-6 grid grid-cols-7 gap-2 sm:gap-4">
            {dailyGrowth.map((item) => (
              <div
                key={item.label}
                className="flex min-h-44 flex-col justify-end gap-2 rounded-xl bg-slate-50 p-2 text-center"
              >
                <div className="flex flex-1 items-end justify-center gap-1">
                  <div
                    className="w-2 rounded-t bg-blue-500 sm:w-3"
                    style={{ height: `${Math.max(8, (item.users / maxGrowth) * 120)}px` }}
                    title={`${item.users} user mới`}
                  />
                  <div
                    className="w-2 rounded-t bg-emerald-500 sm:w-3"
                    style={{ height: `${Math.max(8, (item.rooms / maxGrowth) * 120)}px` }}
                    title={`${item.rooms} tin mới`}
                  />
                  <div
                    className="w-2 rounded-t bg-violet-500 sm:w-3"
                    style={{ height: `${Math.max(8, (item.views / maxGrowth) * 120)}px` }}
                    title={`${item.views} lượt xem`}
                  />
                </div>
                <div className="text-[10px] text-slate-500 sm:text-xs">{item.label}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-600">
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              User
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Tin
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-violet-500" />
              View
            </span>
          </div>
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <h3 className="font-semibold">Popular Districts</h3>
          <div className="mt-4 space-y-3">
            {topDistricts.length ? (
              topDistricts.map((item) => (
                <div
                  key={item.districtId}
                  className="flex items-center justify-between rounded-xl bg-slate-50 p-3"
                >
                  <span className="truncate text-sm">
                    {districtNameById.get(item.districtId) ?? item.districtId}
                  </span>
                  <strong>{item._count._all.toLocaleString("vi-VN")}</strong>
                </div>
              ))
            ) : (
              <Placeholder
                title="Chưa có dữ liệu khu vực"
                description="Sẽ hiển thị khi có phòng active theo quận/huyện."
              />
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <h3 className="font-semibold">Views</h3>
          {hasTrafficData ? (
            <div className="mt-4 text-4xl font-bold">{views.toLocaleString("vi-VN")}</div>
          ) : (
            <div className="mt-4">
              <Placeholder
                title="Chưa có view tracking"
                description="Dữ liệu sẽ xuất hiện khi bảng RecentlyViewed ghi nhận lượt xem trong 30 ngày."
              />
            </div>
          )}
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <h3 className="font-semibold">Searches</h3>
          <div className="mt-4">
            <Placeholder
              title="Chưa có search analytics"
              description="Hệ thống hiện chưa có bảng search event; giữ placeholder để không ảnh hưởng Search API hiện có."
            />
          </div>
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <h3 className="font-semibold">Popular Landing Pages</h3>
          <div className="mt-4 space-y-3">
            {popularLandingPages.length ? (
              popularLandingPages.map((page) => (
                <div key={page.id} className="rounded-xl bg-slate-50 p-3">
                  <div className="truncate text-sm font-medium">{page.title}</div>
                  <div className="truncate text-xs text-slate-500">{page.path}</div>
                </div>
              ))
            ) : (
              <Placeholder
                title="Chưa có landing page"
                description="Sẽ hiển thị khi có landing page published."
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
