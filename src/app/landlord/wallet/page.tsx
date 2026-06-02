import { db } from "@/lib/db";
import { ensureWallet } from "@/server/monetization/service";
import { formatDate, requireLandlordPage } from "@/server/landlord/utils";

export default async function LandlordWalletPage() {
  const auth = await requireLandlordPage();
  const wallet = await ensureWallet(auth.payload.userId);
  const transactions = await db.walletTransaction.findMany({ where: { walletId: wallet.id }, orderBy: { createdAt: "desc" }, take: 50 });

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Wallet</p>
        <h2 className="text-2xl font-bold">Số dư & lịch sử giao dịch</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5 shadow-sm"><div className="text-sm text-slate-500">Số dư</div><div className="mt-2 text-3xl font-bold">{wallet.balance.toLocaleString("vi-VN")}</div><div className="text-xs text-slate-500">Credits khả dụng</div></div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm"><div className="text-sm text-slate-500">Đang khóa</div><div className="mt-2 text-3xl font-bold">{wallet.lockedBalance.toLocaleString("vi-VN")}</div><div className="text-xs text-slate-500">Reserved credits</div></div>
        <div className="rounded-2xl border bg-blue-50 p-5 text-sm text-blue-900"><strong>Nạp ví:</strong> tạo payment intent ở trang Checkout. Gateway thật chưa được tích hợp nên thanh toán sẽ ở trạng thái pending.</div>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="border-b p-4 font-semibold">Lịch sử giao dịch</div>
        <div className="overflow-x-auto">
          <table className="min-w-[760px] divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Loại</th><th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3">Credits</th><th className="px-4 py-3">Balance sau</th><th className="px-4 py-3">Tham chiếu</th><th className="px-4 py-3">Ngày</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map((transaction) => <tr key={transaction.id}><td className="px-4 py-3">{transaction.type}</td><td className="px-4 py-3">{transaction.status}</td><td className={transaction.amount < 0 ? "px-4 py-3 font-semibold text-rose-700" : "px-4 py-3 font-semibold text-emerald-700"}>{transaction.amount.toLocaleString("vi-VN")}</td><td className="px-4 py-3">{transaction.balanceAfter?.toLocaleString("vi-VN") ?? "—"}</td><td className="px-4 py-3 text-xs text-slate-500">{transaction.referenceType ?? "—"} {transaction.referenceId ?? ""}</td><td className="px-4 py-3 text-slate-500">{formatDate(transaction.createdAt)}</td></tr>)}
              {!transactions.length && <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">Chưa có giao dịch ví.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
