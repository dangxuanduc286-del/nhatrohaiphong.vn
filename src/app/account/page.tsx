import Link from "next/link";

import { db } from "@/lib/db";
import { requireUserAccountPage } from "@/server/account/utils";

export default async function AccountOverviewPage() {
  const auth = await requireUserAccountPage();
  const userId = auth.payload.userId;

  const [favorites, viewed, latestRequest] = await Promise.all([
    db.favorite.count({ where: { userId, deletedAt: null } }),
    db.recentlyViewed.count({ where: { userId } }),
    db.landlordApprovalRequest.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { status: true, createdAt: true },
    }),
  ]);

  const cards = [
    {
      label: "Phòng yêu thích",
      value: favorites,
      helper: "Danh sách lưu để liên hệ sau",
      href: "/account/favorites",
    },
    {
      label: "Lịch sử xem",
      value: viewed,
      helper: "Phòng đã xem gần đây",
      href: "/account/history",
    },
    {
      label: "Nâng cấp",
      value: latestRequest?.status ?? "Chưa gửi",
      helper: "Trạng thái yêu cầu Chủ trọ",
      href: "/account/upgrade-landlord",
    },
  ];

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">
        <div className="bg-gradient-to-r from-blue-700 to-blue-500 p-6 text-white">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-100">
            Account Center
          </p>
          <h2 className="mt-2 text-3xl font-bold">
            Xin chào, {auth.user?.fullName ?? "người dùng"}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-blue-50">
            Quản lý hồ sơ, phòng đã lưu, lịch sử xem và yêu cầu nâng cấp Chủ trọ trong cùng một trải
            nghiệm giống dashboard.
          </p>
        </div>
        <div className="grid gap-3 p-4 sm:grid-cols-3">
          {cards.map((card) => (
            <Link
              key={card.label}
              href={card.href}
              className="rounded-2xl bg-slate-50 p-4 text-sm hover:bg-blue-50"
            >
              <div className="text-slate-500">{card.label}</div>
              <div className="mt-2 text-2xl font-bold text-slate-950">
                {card.value.toLocaleString("vi-VN")}
              </div>
              <div className="mt-1 text-xs text-slate-500">{card.helper}</div>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link
          href="/phong-tro-hai-phong"
          className="rounded-2xl border bg-white p-5 shadow-sm hover:border-blue-300"
        >
          <h3 className="font-semibold">Tiếp tục tìm phòng</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Quay lại trang tìm kiếm phòng trọ tại Hải Phòng, tối ưu cho mobile và thao tác nhanh.
          </p>
        </Link>
        <Link
          href="/account/profile"
          className="rounded-2xl border bg-white p-5 shadow-sm hover:border-blue-300"
        >
          <h3 className="font-semibold">Hoàn thiện hồ sơ</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Cập nhật họ tên, số điện thoại và avatar để thuận tiện khi liên hệ phòng.
          </p>
        </Link>
      </div>
    </section>
  );
}
