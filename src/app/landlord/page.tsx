import Link from "next/link";

import { db } from "@/lib/db";
import { getActivePlans } from "@/server/monetization/service";
import { formatCurrency, formatDate, requireLandlordPage } from "@/server/landlord/utils";

export default async function LandlordDashboardPage() {
  const auth = await requireLandlordPage();
  const userId = auth.payload.userId;
  const now = new Date();

  const [plans, subscription, rooms, boosts, wallet, pendingBilling] = await Promise.all([
    getActivePlans(),
    db.subscription.findFirst({ where: { userId, deletedAt: null }, orderBy: { createdAt: "desc" }, include: { plan: true } }),
    db.room.findMany({ where: { createdBy: userId, deletedAt: null }, orderBy: { createdAt: "desc" }, take: 8, select: { id: true, roomCode: true, title: true, status: true } }),
    db.roomBoost.findMany({ where: { userId, deletedAt: null }, orderBy: { createdAt: "desc" }, take: 8, include: { room: { select: { title: true, roomCode: true } } } }),
    db.wallet.findUnique({ where: { userId } }),
    db.billingRecord.count({ where: { userId, deletedAt: null, status: "PENDING" } }),
  ]);

  const activeBoosts = boosts.filter((boost) => boost.status === "ACTIVE" && (!boost.startsAt || boost.startsAt <= now) && (!boost.endsAt || boost.endsAt >= now));

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Chưa tích hợp gateway thật</p>
        <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-3xl font-bold">Quản lý gói, VIP/Boost, ví và thanh toán</h2>
            <p className="mt-2 max-w-3xl text-sm text-slate-600">Các luồng mua/gia hạn/kích hoạt hiện tạo billing và payment intent ở trạng thái pending để kiểm thử nghiệp vụ trước khi tích hợp cổng thanh toán thật.</p>
          </div>
          <Link href="/landlord/rooms/new" className="inline-flex rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">Đăng phòng</Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border bg-white p-5 shadow-sm"><div className="text-sm text-slate-500">Gói hiện tại</div><div className="mt-2 text-2xl font-bold">{subscription?.plan.name ?? "Chưa có"}</div><div className="text-xs text-slate-500">{subscription ? `${subscription.status} · hết hạn ${formatDate(subscription.endsAt)}` : "Mua gói để mở quota"}</div></div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm"><div className="text-sm text-slate-500">Số dư ví</div><div className="mt-2 text-2xl font-bold">{(wallet?.balance ?? 0).toLocaleString("vi-VN")}</div><div className="text-xs text-slate-500">Credits khả dụng</div></div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm"><div className="text-sm text-slate-500">Boost active</div><div className="mt-2 text-2xl font-bold">{activeBoosts.length.toLocaleString("vi-VN")}</div><div className="text-xs text-slate-500">VIP/FEATURED/PUSH đang chạy</div></div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm"><div className="text-sm text-slate-500">Pending payment</div><div className="mt-2 text-2xl font-bold">{pendingBilling.toLocaleString("vi-VN")}</div><div className="text-xs text-slate-500">Chờ thanh toán/reconcile</div></div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm xl:col-span-2">
          <div className="border-b p-4 font-semibold">Danh sách gói / Mua gói / Gia hạn gói</div>
          <div className="grid gap-4 p-4 md:grid-cols-2">
            {plans.map((plan) => (
              <div key={plan.id} className="rounded-2xl border p-5">
                <div className="flex items-start justify-between gap-3"><div><h3 className="text-lg font-bold">{plan.name}</h3><p className="text-xs text-slate-500">{plan.code} · {plan.durationDays} ngày · {plan.listingLimit} tin</p></div><div className="text-right font-bold text-blue-700">{formatCurrency(plan.price)}</div></div>
                <p className="mt-3 text-sm text-slate-600">{plan.description ?? "Gói monetization cho chủ trọ."}</p>
                <div className="mt-4 flex gap-2">
                  <Link href={`/landlord/checkout?type=plan&planId=${plan.id}`} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Mua gói</Link>
                  <Link href={`/landlord/checkout?type=renew&planId=${plan.id}`} className="rounded-xl border px-4 py-2 text-sm font-semibold hover:border-blue-300 hover:text-blue-700">Gia hạn</Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <h3 className="font-semibold">Kích hoạt VIP / Boost</h3>
          <div className="mt-4 space-y-3">
            {rooms.length ? rooms.map((room) => (
              <div key={room.id} className="rounded-xl bg-slate-50 p-3">
                <div className="truncate text-sm font-medium">{room.title}</div><div className="text-xs text-slate-500">{room.roomCode} · {room.status}</div>
                <div className="mt-3 flex flex-wrap gap-2"><Link href={`/landlord/rooms/${room.id}/edit`} className="rounded-lg border bg-white px-3 py-1.5 text-xs font-semibold hover:border-blue-300 hover:text-blue-700">Sửa</Link><Link href={`/landlord/checkout?type=boost&boostType=VIP&roomId=${room.id}`} className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white">VIP</Link><Link href={`/landlord/checkout?type=boost&boostType=FEATURED&roomId=${room.id}`} className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white">Boost</Link></div>
              </div>
            )) : <p className="text-sm text-slate-500">Chưa có phòng để kích hoạt VIP/Boost.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
