import { db } from "@/lib/db";

function formatCurrency(value: { toString(): string } | number) {
  const amount = typeof value === "number" ? value : Number(value.toString());
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(amount);
}

function formatDate(value: Date | null) {
  if (!value) return "—";
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

export default async function AdminMonetizationPage() {
  const today = startOfDay(new Date());
  const last30Days = addDays(today, -29);

  const [
    plans,
    paidBillingRecords,
    pendingBillingRecords,
    activeSubscriptions,
    expiredSubscriptions,
    activeBoosts,
    wallets,
    recentBillingRecords,
    recentWalletTransactions,
    topCustomers,
  ] = await Promise.all([
    db.plan.findMany({ where: { deletedAt: null }, orderBy: [{ displayOrder: "asc" }, { price: "asc" }] }),
    db.billingRecord.findMany({ where: { deletedAt: null, status: "PAID", createdAt: { gte: last30Days } }, select: { amount: true } }),
    db.billingRecord.count({ where: { deletedAt: null, status: "PENDING" } }),
    db.subscription.count({ where: { deletedAt: null, status: "ACTIVE", OR: [{ endsAt: null }, { endsAt: { gte: new Date() } }] } }),
    db.subscription.count({ where: { deletedAt: null, OR: [{ status: "EXPIRED" }, { endsAt: { lt: new Date() } }] } }),
    db.roomBoost.count({ where: { deletedAt: null, status: "ACTIVE", OR: [{ startsAt: null }, { startsAt: { lte: new Date() } }], AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: new Date() } }] }] } }),
    db.wallet.aggregate({ where: { deletedAt: null }, _count: { _all: true }, _sum: { balance: true } }),
    db.billingRecord.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 12,
      include: { user: { select: { fullName: true, email: true, phone: true } }, subscription: { include: { plan: { select: { name: true, code: true } } } } },
    }),
    db.walletTransaction.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { wallet: { include: { user: { select: { fullName: true, email: true, phone: true } } } } },
    }),
    db.billingRecord.groupBy({
      by: ["userId"],
      where: { deletedAt: null, status: "PAID", createdAt: { gte: last30Days } },
      _sum: { amount: true },
      _count: { _all: true },
      orderBy: { _sum: { amount: "desc" } },
      take: 8,
    }),
  ]);

  const revenue30Days = paidBillingRecords.reduce((sum, item) => sum + Number(item.amount.toString()), 0);
  const topCustomerUsers = topCustomers.length
    ? await db.user.findMany({ where: { id: { in: topCustomers.map((item) => item.userId) } }, select: { id: true, fullName: true, email: true, phone: true } })
    : [];
  const userById = new Map(topCustomerUsers.map((user) => [user.id, user]));

  const overviewCards = [
    { label: "Doanh thu 30 ngày", value: formatCurrency(revenue30Days), hint: `${paidBillingRecords.length.toLocaleString("vi-VN")} giao dịch đã thanh toán` },
    { label: "Subscription active", value: activeSubscriptions.toLocaleString("vi-VN"), hint: `${expiredSubscriptions.toLocaleString("vi-VN")} expired/cần xử lý` },
    { label: "Boost đang chạy", value: activeBoosts.toLocaleString("vi-VN"), hint: "PUSH / FEATURED / VIP" },
    { label: "Ví credits", value: (wallets._sum.balance ?? 0).toLocaleString("vi-VN"), hint: `${wallets._count._all.toLocaleString("vi-VN")} ví đang có dữ liệu` },
    { label: "Billing pending", value: pendingBillingRecords.toLocaleString("vi-VN"), hint: "Cần reconcile thanh toán" },
  ];

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">Monetization</p>
        <h2 className="text-2xl font-bold">Subscription, billing & wallet</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">Dashboard read-only cho gói dịch vụ, subscription, room boost, wallet credits và billing history. Không thay đổi Search/Listing hay API contract hiện có.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {overviewCards.map((item) => (
          <div key={item.label} className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">{item.label}</div>
            <div className="mt-2 text-2xl font-bold">{item.value}</div>
            <div className="mt-1 text-xs text-slate-500">{item.hint}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm xl:col-span-2">
          <div className="border-b p-4 font-semibold">Gói monetization</div>
          <div className="overflow-x-auto">
            <table className="min-w-[760px] divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Gói</th><th className="px-4 py-3">Giá</th><th className="px-4 py-3">Thời hạn</th><th className="px-4 py-3">Quota</th><th className="px-4 py-3">Trạng thái</th></tr></thead>
              <tbody className="divide-y divide-slate-100">{plans.map((plan) => <tr key={plan.id}><td className="px-4 py-3"><div className="font-medium">{plan.name}</div><div className="text-xs text-slate-500">{plan.code}</div></td><td className="px-4 py-3">{formatCurrency(plan.price)}</td><td className="px-4 py-3">{plan.durationDays} ngày</td><td className="px-4 py-3">{plan.listingLimit.toLocaleString("vi-VN")} tin</td><td className="px-4 py-3"><span className={plan.isActive ? "rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700" : "rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600"}>{plan.isActive ? "Active" : "Inactive"}</span></td></tr>)}</tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <h3 className="font-semibold">Top customers 30 ngày</h3>
          <div className="mt-4 space-y-3">{topCustomers.length ? topCustomers.map((item) => { const user = userById.get(item.userId); return <div key={item.userId} className="rounded-xl bg-slate-50 p-3"><div className="truncate text-sm font-medium">{user?.fullName ?? user?.email ?? user?.phone ?? item.userId}</div><div className="mt-1 flex justify-between text-xs text-slate-500"><span>{item._count._all} đơn</span><strong>{formatCurrency(item._sum.amount ?? 0)}</strong></div></div>; }) : <p className="text-sm text-slate-500">Chưa có doanh thu trong 30 ngày.</p>}</div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="border-b p-4 font-semibold">Billing gần đây</div>
          <div className="overflow-x-auto"><table className="min-w-[820px] divide-y divide-slate-200 text-sm"><thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Code</th><th className="px-4 py-3">Khách hàng</th><th className="px-4 py-3">Loại</th><th className="px-4 py-3">Số tiền</th><th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3">Ngày</th></tr></thead><tbody className="divide-y divide-slate-100">{recentBillingRecords.map((record) => <tr key={record.id}><td className="px-4 py-3 font-mono text-xs">{record.code}</td><td className="px-4 py-3"><div className="font-medium">{record.user.fullName ?? record.user.email ?? record.user.phone ?? "—"}</div><div className="text-xs text-slate-500">{record.subscription?.plan.name ?? record.subscription?.plan.code ?? "—"}</div></td><td className="px-4 py-3">{record.type}</td><td className="px-4 py-3">{formatCurrency(record.amount)}</td><td className="px-4 py-3">{record.status}</td><td className="px-4 py-3 text-slate-500">{formatDate(record.createdAt)}</td></tr>)}</tbody></table></div>
        </div>

        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="border-b p-4 font-semibold">Wallet ledger gần đây</div>
          <div className="overflow-x-auto"><table className="min-w-[720px] divide-y divide-slate-200 text-sm"><thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Khách hàng</th><th className="px-4 py-3">Loại</th><th className="px-4 py-3">Credits</th><th className="px-4 py-3">Balance sau</th><th className="px-4 py-3">Ngày</th></tr></thead><tbody className="divide-y divide-slate-100">{recentWalletTransactions.map((transaction) => <tr key={transaction.id}><td className="px-4 py-3">{transaction.wallet.user.fullName ?? transaction.wallet.user.email ?? transaction.wallet.user.phone ?? transaction.wallet.userId}</td><td className="px-4 py-3">{transaction.type}</td><td className={transaction.amount < 0 ? "px-4 py-3 text-rose-700" : "px-4 py-3 text-emerald-700"}>{transaction.amount.toLocaleString("vi-VN")}</td><td className="px-4 py-3">{transaction.balanceAfter?.toLocaleString("vi-VN") ?? "—"}</td><td className="px-4 py-3 text-slate-500">{formatDate(transaction.createdAt)}</td></tr>)}</tbody></table></div>
        </div>
      </div>

      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 text-sm text-blue-900"><strong>Security guardrails:</strong> billing không xoá lịch sử, wallet không cho âm số dư qua service transaction/idempotency, payment provider để dạng adapter và callback chưa cấu hình sẽ bị từ chối thay vì auto-confirm.</div>
    </section>
  );
}
