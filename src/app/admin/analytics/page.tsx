import { db } from "@/lib/db";

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

export default async function AdminAnalyticsPage() {
  const today = startOfDay(new Date());
  const last7Days = addDays(today, -6);
  const last30Days = addDays(today, -29);
  const [views, rooms, newRooms, users, newUsers, landlords, newLandlords, topDistricts] = await Promise.all([
    db.recentlyViewed.count({ where: { viewedAt: { gte: last30Days } } }),
    db.room.count({ where: { deletedAt: null } }),
    db.room.count({ where: { deletedAt: null, createdAt: { gte: last30Days } } }),
    db.user.count({ where: { deletedAt: null } }),
    db.user.count({ where: { deletedAt: null, createdAt: { gte: last30Days } } }),
    db.user.count({ where: { deletedAt: null, roles: { some: { role: { slug: "landlord", deletedAt: null } } } } }),
    db.user.count({ where: { deletedAt: null, createdAt: { gte: last30Days }, roles: { some: { role: { slug: "landlord", deletedAt: null } } } } }),
    db.room.groupBy({ by: ["districtId"], where: { deletedAt: null }, _count: { _all: true }, orderBy: { _count: { districtId: "desc" } }, take: 10 }),
  ]);
  const districts = topDistricts.length ? await db.district.findMany({ where: { id: { in: topDistricts.map((item) => item.districtId) } }, select: { id: true, name: true } }) : [];
  const districtNameById = new Map(districts.map((district) => [district.id, district.name]));
  const dailyGrowth = await Promise.all(Array.from({ length: 7 }, async (_, index) => {
    const day = addDays(last7Days, index);
    const nextDay = addDays(day, 1);
    const [dayUsers, dayRooms, dayViews] = await Promise.all([
      db.user.count({ where: { deletedAt: null, createdAt: { gte: day, lt: nextDay } } }),
      db.room.count({ where: { deletedAt: null, createdAt: { gte: day, lt: nextDay } } }),
      db.recentlyViewed.count({ where: { viewedAt: { gte: day, lt: nextDay } } }),
    ]);
    return { label: new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit" }).format(day), users: dayUsers, rooms: dayRooms, views: dayViews };
  }));
  const maxGrowth = Math.max(1, ...dailyGrowth.map((item) => Math.max(item.users, item.rooms, item.views)));

  return (
    <section className="space-y-6">
      <div><p className="text-sm font-medium uppercase tracking-wide text-slate-500">Analytics</p><h2 className="text-2xl font-bold">Admin analytics</h2><p className="mt-2 max-w-3xl text-sm text-slate-600">Tổng quan lượt xem, tin đăng mới, user mới, chủ trọ mới và khu vực phổ biến trong 30 ngày.</p></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[{ label: "Lượt xem 30 ngày", value: views }, { label: "Tin đăng", value: rooms, hint: `+${newRooms.toLocaleString("vi-VN")} mới` }, { label: "User", value: users, hint: `+${newUsers.toLocaleString("vi-VN")} mới` }, { label: "Chủ trọ", value: landlords, hint: `+${newLandlords.toLocaleString("vi-VN")} mới` }].map((item) => <div key={item.label} className="rounded-2xl border bg-white p-5 shadow-sm"><div className="text-sm text-slate-500">{item.label}</div><div className="mt-2 text-3xl font-bold">{item.value.toLocaleString("vi-VN")}</div>{item.hint ? <div className="mt-1 text-xs text-emerald-700">{item.hint} trong 30 ngày</div> : null}</div>)}
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5 shadow-sm xl:col-span-2"><h3 className="font-semibold">Biểu đồ tăng trưởng 7 ngày</h3><div className="mt-6 grid grid-cols-7 gap-2 sm:gap-4">{dailyGrowth.map((item) => <div key={item.label} className="flex min-h-44 flex-col justify-end gap-2 rounded-xl bg-slate-50 p-2 text-center"><div className="flex flex-1 items-end justify-center gap-1"><div className="w-2 rounded-t bg-blue-500 sm:w-3" style={{ height: `${Math.max(8, (item.users / maxGrowth) * 120)}px` }} title={`${item.users} user mới`} /><div className="w-2 rounded-t bg-emerald-500 sm:w-3" style={{ height: `${Math.max(8, (item.rooms / maxGrowth) * 120)}px` }} title={`${item.rooms} tin mới`} /><div className="w-2 rounded-t bg-violet-500 sm:w-3" style={{ height: `${Math.max(8, (item.views / maxGrowth) * 120)}px` }} title={`${item.views} lượt xem`} /></div><div className="text-[10px] text-slate-500 sm:text-xs">{item.label}</div></div>)}</div><div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-600"><span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-blue-500" />User</span><span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" />Tin</span><span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-violet-500" />View</span></div></div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm"><h3 className="font-semibold">Khu vực phổ biến</h3><div className="mt-4 space-y-3">{topDistricts.length ? topDistricts.map((item) => <div key={item.districtId} className="flex items-center justify-between rounded-xl bg-slate-50 p-3"><span className="truncate text-sm">{districtNameById.get(item.districtId) ?? item.districtId}</span><strong>{item._count._all.toLocaleString("vi-VN")}</strong></div>) : <p className="text-sm text-slate-500">Chưa có dữ liệu.</p>}</div></div>
      </div>
    </section>
  );
}
