import Link from "next/link";

import { db } from "@/lib/db";
import { requireUserAccountPage } from "@/server/account/utils";
import { formatCurrency } from "@/server/landlord/utils";

export default async function AccountFavoritesPage() {
  const auth = await requireUserAccountPage();
  const items = await db.favorite.findMany({
    where: { userId: auth.payload.userId, deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 30,
    include: {
      room: { select: { slug: true, title: true, price: true, address: true, status: true } },
    },
  });

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-xl font-bold">Yêu thích</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Các phòng đã lưu để so sánh và liên hệ lại nhanh trên mobile.
        </p>
      </div>
      <div className="grid gap-3">
        {items.length ? (
          items.map((item) => (
            <Link
              key={item.roomId}
              href={`/phong/${item.room.slug}`}
              className="rounded-2xl border bg-white p-4 shadow-sm hover:border-blue-300"
            >
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div className="min-w-0">
                  <h3 className="truncate font-semibold">{item.room.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{item.room.address}</p>
                </div>
                <div className="text-sm font-bold text-blue-700">
                  {formatCurrency(item.room.price)}
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="rounded-2xl border bg-white p-8 text-center text-sm text-slate-500">
            <p className="font-semibold text-slate-700">Chưa có phòng yêu thích.</p>
            <Link
              href="/phong-tro-hai-phong"
              className="mt-4 inline-flex rounded-xl bg-blue-700 px-4 py-2 font-semibold text-white hover:bg-blue-800"
            >
              Tìm phòng ngay
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
