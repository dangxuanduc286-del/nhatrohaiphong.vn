import { db } from "@/lib/db";
import { formatCurrency, formatDate, requireLandlordPage } from "@/server/landlord/utils";

export default async function LandlordBillingPage() {
  const auth = await requireLandlordPage();
  const userId = auth.payload.userId;

  const [billingRecords, paymentIntents] = await Promise.all([
    db.billingRecord.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { subscription: { include: { plan: true } }, roomBoost: { include: { room: { select: { title: true, roomCode: true } } } } },
    }),
    db.paymentIntent.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 50 }),
  ]);

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Billing</p>
        <h2 className="text-2xl font-bold">Hóa đơn & lịch sử thanh toán</h2>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="border-b p-4 font-semibold">Hóa đơn</div>
        <div className="overflow-x-auto">
          <table className="min-w-[920px] divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Code</th><th className="px-4 py-3">Nội dung</th><th className="px-4 py-3">Loại</th><th className="px-4 py-3">Số tiền</th><th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3">Đã thanh toán</th><th className="px-4 py-3">Ngày tạo</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {billingRecords.map((record) => <tr key={record.id}><td className="px-4 py-3 font-mono text-xs">{record.code}</td><td className="px-4 py-3"><div className="font-medium">{record.subscription?.plan.name ?? record.roomBoost?.room.title ?? record.type}</div><div className="text-xs text-slate-500">{record.subscription?.plan.code ?? record.roomBoost?.room.roomCode ?? "—"}</div></td><td className="px-4 py-3">{record.type}</td><td className="px-4 py-3">{formatCurrency(record.amount)}</td><td className="px-4 py-3">{record.status}</td><td className="px-4 py-3 text-slate-500">{formatDate(record.paidAt)}</td><td className="px-4 py-3 text-slate-500">{formatDate(record.createdAt)}</td></tr>)}
              {!billingRecords.length && <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">Chưa có hóa đơn.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="border-b p-4 font-semibold">Lịch sử thanh toán / Payment Intent</div>
        <div className="overflow-x-auto">
          <table className="min-w-[860px] divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Intent</th><th className="px-4 py-3">Provider</th><th className="px-4 py-3">Số tiền</th><th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3">External ID</th><th className="px-4 py-3">Ngày</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {paymentIntents.map((intent) => <tr key={intent.id}><td className="px-4 py-3 font-mono text-xs">{intent.id}</td><td className="px-4 py-3">{intent.provider}</td><td className="px-4 py-3">{formatCurrency(intent.amount)}</td><td className="px-4 py-3">{intent.status}</td><td className="px-4 py-3 text-xs text-slate-500">{intent.externalId ?? "—"}</td><td className="px-4 py-3 text-slate-500">{formatDate(intent.createdAt)}</td></tr>)}
              {!paymentIntents.length && <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">Chưa có payment intent.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
