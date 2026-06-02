import { db } from "@/lib/db";
import { getActivePlans } from "@/server/monetization/service";
import { formatCurrency, requireLandlordPage } from "@/server/landlord/utils";

export default async function LandlordCheckoutPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const auth = await requireLandlordPage();
  const params = await searchParams;
  const type = String(params.type ?? "wallet");
  const planId = typeof params.planId === "string" ? params.planId : undefined;
  const roomId = typeof params.roomId === "string" ? params.roomId : undefined;
  const boostType = typeof params.boostType === "string" ? params.boostType : "FEATURED";

  const [plans, rooms, pendingIntents] = await Promise.all([
    getActivePlans(),
    db.room.findMany({ where: { createdBy: auth.payload.userId, deletedAt: null }, orderBy: { createdAt: "desc" }, take: 50, select: { id: true, roomCode: true, title: true } }),
    db.paymentIntent.findMany({ where: { userId: auth.payload.userId, status: { in: ["CREATED", "PENDING"] } }, orderBy: { createdAt: "desc" }, take: 10 }),
  ]);

  const selectedPlan = plans.find((plan) => plan.id === planId);
  const selectedRoom = rooms.find((room) => room.id === roomId);
  const amount = type === "boost" ? (boostType === "VIP" ? 199000 : boostType === "PUSH" ? 49000 : 99000) : type === "wallet" ? 100000 : selectedPlan ? Number(selectedPlan.price.toString()) : 0;

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Checkout</p>
        <h2 className="text-2xl font-bold">Tạo Payment Intent / Pending Payment / Payment Status</h2>
        <p className="mt-2 text-sm text-slate-600">Gateway thật chưa tích hợp. Trang này hiển thị payload đề xuất và API tạo intent sẽ lưu trạng thái PENDING.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <h3 className="font-semibold">Thông tin checkout</h3>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4"><dt className="text-slate-500">Loại</dt><dd className="font-semibold">{type}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-slate-500">Gói</dt><dd className="font-semibold">{selectedPlan?.name ?? "—"}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-slate-500">Phòng</dt><dd className="font-semibold">{selectedRoom?.title ?? "—"}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-slate-500">Boost</dt><dd className="font-semibold">{type === "boost" ? boostType : "—"}</dd></div>
            <div className="flex justify-between gap-4 border-t pt-3"><dt className="text-slate-500">Số tiền</dt><dd className="text-xl font-bold text-blue-700">{formatCurrency(amount)}</dd></div>
          </dl>
          <div className="mt-5 rounded-xl bg-slate-50 p-4 text-xs text-slate-700">
            <div className="font-semibold">POST /api/landlord/checkout/payment-intents</div>
            <pre className="mt-2 overflow-x-auto whitespace-pre-wrap">{JSON.stringify({ type, planId, roomId, boostType: type === "boost" ? boostType : undefined, amount: type === "wallet" ? amount : undefined, provider: "BANK_TRANSFER" }, null, 2)}</pre>
          </div>
          <p className="mt-4 text-sm text-amber-700">Nút gọi API từ UI chưa bật vì ứng dụng hiện chưa có client auth token wiring cho dashboard page. Có thể gọi API bằng Bearer token để tạo intent pending.</p>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <h3 className="font-semibold">Pending Payment</h3>
          <div className="mt-4 space-y-3">
            {pendingIntents.map((intent) => <div key={intent.id} className="rounded-xl bg-slate-50 p-3 text-sm"><div className="flex justify-between gap-3"><span className="font-mono text-xs">{intent.id}</span><strong>{intent.status}</strong></div><div className="mt-1 text-slate-500">{intent.provider} · {formatCurrency(intent.amount)}</div><div className="mt-2 text-xs text-slate-500">GET /api/landlord/checkout/payment-intents/{intent.id}</div></div>)}
            {!pendingIntents.length && <p className="text-sm text-slate-500">Không có pending payment.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
