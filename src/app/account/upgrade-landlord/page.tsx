import Link from "next/link";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { getRefreshCookie } from "@/server/auth/cookies";
import { requireRoleValue } from "@/server/auth/rbac";
import { getAuthFromRefreshToken } from "@/server/auth/service";
import { createLandlordApprovalRequestAction } from "@/server/landlord-approval/actions";

function formatDate(value: Date | null | undefined) {
  if (!value) return "Chưa có";
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(
    value,
  );
}

const benefits = [
  "Đăng phòng miễn phí và quản lý tin trong dashboard riêng",
  "Tăng khả năng tiếp cận người thuê đang tìm phòng tại Hải Phòng",
  "Cập nhật trạng thái phòng, giá và thông tin liên hệ chủ động",
];
const processSteps = [
  "Gửi thông tin xác minh Chủ trọ",
  "ADMIN kiểm tra hồ sơ và nhu cầu đăng phòng",
  "Nhận kết quả duyệt, sau đó truy cập Dashboard Chủ trọ",
];

function statusMeta(status?: string) {
  if (status === "PENDING")
    return {
      label: "Đang xét duyệt",
      className: "border-amber-200 bg-amber-50 text-amber-800",
      dot: "bg-amber-500",
    };
  if (status === "APPROVED")
    return {
      label: "Đã phê duyệt",
      className: "border-emerald-200 bg-emerald-50 text-emerald-800",
      dot: "bg-emerald-500",
    };
  if (status === "REJECTED")
    return {
      label: "Đã từ chối",
      className: "border-red-200 bg-red-50 text-red-800",
      dot: "bg-red-500",
    };
  return {
    label: "Chưa gửi",
    className: "border-blue-200 bg-blue-50 text-blue-800",
    dot: "bg-blue-500",
  };
}

export default async function UpgradeLandlordPage() {
  const refreshToken = await getRefreshCookie();
  if (!refreshToken) redirect("/login?next=/account/upgrade-landlord");

  const auth = await getAuthFromRefreshToken(refreshToken);
  if (auth.payload.role === "LANDLORD") redirect("/landlord");
  if (auth.payload.role === "ADMIN" || auth.payload.role === "SUPER_ADMIN") redirect("/admin");
  requireRoleValue(auth.payload.role, ["USER"]);

  const latestRequest = await db.landlordApprovalRequest.findFirst({
    where: { userId: auth.payload.userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      note: true,
      rejectionReason: true,
      createdAt: true,
      reviewedAt: true,
    },
  });

  const currentStatus = latestRequest?.status;
  const meta = statusMeta(currentStatus);
  const canSubmit = !latestRequest || currentStatus === "REJECTED";

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <section className="mx-auto max-w-5xl space-y-6">
        <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">
          <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-orange-500 p-6 text-white sm:p-8">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center rounded-2xl bg-white/15 px-4 text-sm font-semibold text-white hover:bg-white/25"
            >
              ← Về trang chủ
            </Link>
            <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-blue-100">
              Nâng cấp Chủ trọ
            </p>
            <h1 className="mt-2 max-w-3xl text-3xl font-extrabold tracking-tight sm:text-4xl">
              Đăng phòng miễn phí sau khi được phê duyệt Chủ trọ
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-blue-50 sm:text-base">
              Tài khoản USER cần gửi yêu cầu để ADMIN duyệt trước khi trở thành LANDLORD. Quy trình
              rõ ràng, không tự đổi role và không ảnh hưởng tài khoản hiện có.
            </p>
          </div>
          <div className="grid gap-4 p-5 sm:grid-cols-3 sm:p-6">
            {benefits.map((benefit) => (
              <div
                key={benefit}
                className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-700"
              >
                ✓ {benefit}
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="space-y-6">
            <div className={`rounded-3xl border p-5 shadow-sm ${meta.className}`}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide">
                    Trạng thái hiện tại
                  </p>
                  <h2 className="mt-1 text-2xl font-bold">
                    {currentStatus === "PENDING"
                      ? "Yêu cầu của bạn đang được xét duyệt"
                      : currentStatus === "APPROVED"
                        ? "Bạn đã được phê duyệt làm Chủ trọ"
                        : currentStatus === "REJECTED"
                          ? "Yêu cầu cần bổ sung thông tin"
                          : "Bạn chưa gửi yêu cầu"}
                  </h2>
                </div>
                <span className="inline-flex min-h-10 items-center gap-2 rounded-full bg-white/80 px-4 text-sm font-bold">
                  <span className={`h-2.5 w-2.5 rounded-full ${meta.dot}`} />
                  {meta.label}
                </span>
              </div>
              {latestRequest ? (
                <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <div className="rounded-2xl bg-white/70 p-4">
                    <p className="font-semibold">Ngày gửi</p>
                    <p className="mt-1">{formatDate(latestRequest.createdAt)}</p>
                  </div>
                  <div className="rounded-2xl bg-white/70 p-4">
                    <p className="font-semibold">Ngày xử lý</p>
                    <p className="mt-1">{formatDate(latestRequest.reviewedAt)}</p>
                  </div>
                </div>
              ) : null}
              {currentStatus === "PENDING" ? (
                <p className="mt-4 rounded-2xl bg-white/75 p-4 text-sm leading-6">
                  ADMIN đang kiểm tra yêu cầu. Bạn không cần gửi lại; nếu cần bổ sung thông tin, đội
                  ngũ quản trị sẽ cập nhật trạng thái hoặc liên hệ qua thông tin đã cung cấp.
                </p>
              ) : null}
              {currentStatus === "REJECTED" ? (
                <div className="mt-4 rounded-2xl bg-white/75 p-4 text-sm leading-6">
                  <p className="font-bold">Lý do từ chối</p>
                  <p className="mt-1">
                    {latestRequest?.rejectionReason ?? "Chưa có lý do cụ thể."}
                  </p>
                  <p className="mt-3">Bạn có thể chỉnh lại thông tin và gửi lại yêu cầu mới.</p>
                </div>
              ) : null}
              {currentStatus === "APPROVED" ? (
                <Link
                  href="/landlord"
                  className="mt-4 inline-flex min-h-12 items-center justify-center rounded-2xl bg-emerald-700 px-5 text-sm font-bold text-white hover:bg-emerald-800"
                >
                  Đi tới Dashboard Chủ trọ
                </Link>
              ) : null}
            </div>

            <div className="rounded-3xl border bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-xl font-bold text-slate-950">Quy trình xét duyệt</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Thời gian xử lý dự kiến: trong 24–48 giờ làm việc, tùy số lượng yêu cầu và độ đầy đủ
                của thông tin.
              </p>
              <div className="mt-4 grid gap-3">
                {processSteps.map((step, index) => (
                  <div
                    key={step}
                    className="flex gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-700 font-bold text-white">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-slate-950">{step}</p>
                      <p className="mt-1 text-slate-500">
                        {index === 0
                          ? "Chuẩn bị họ tên, số điện thoại và ghi chú khu vực/số lượng phòng."
                          : index === 1
                            ? "ADMIN xác nhận để tránh nhầm lẫn role và spam đăng tin."
                            : "Khi được duyệt, CTA Đăng phòng sẽ đưa bạn vào Dashboard Chủ trọ."}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {canSubmit ? (
            <form
              action={createLandlordApprovalRequestAction}
              className="space-y-4 rounded-3xl border bg-white p-5 shadow-sm sm:p-6"
            >
              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  {currentStatus === "REJECTED" ? "Gửi lại yêu cầu" : "Gửi yêu cầu nâng cấp"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Thông tin càng rõ, ADMIN càng xử lý nhanh. Vui lòng không gửi thông tin giả hoặc
                  thiếu số điện thoại.
                </p>
              </div>
              <label className="block text-sm font-medium text-slate-700">
                Họ tên
                <input
                  name="fullName"
                  defaultValue={auth.user?.fullName ?? ""}
                  required
                  minLength={2}
                  maxLength={120}
                  className="mt-1 min-h-12 w-full rounded-xl border px-3 py-3 text-base outline-none focus:border-blue-600 sm:text-sm"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Số điện thoại
                <input
                  name="phone"
                  defaultValue={auth.user?.phone ?? ""}
                  required
                  minLength={8}
                  maxLength={20}
                  inputMode="tel"
                  className="mt-1 min-h-12 w-full rounded-xl border px-3 py-3 text-base outline-none focus:border-blue-600 sm:text-sm"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Ghi chú
                <textarea
                  name="note"
                  rows={5}
                  maxLength={1000}
                  placeholder="Ví dụ: Tôi có 5 phòng tại Lê Chân, cần đăng tin và cập nhật trạng thái phòng trống..."
                  className="mt-1 w-full rounded-xl border px-3 py-3 text-base outline-none focus:border-blue-600 sm:text-sm"
                />
              </label>
              <button className="min-h-12 w-full rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white hover:bg-blue-800">
                {currentStatus === "REJECTED" ? "Gửi lại yêu cầu" : "Gửi yêu cầu nâng cấp"}
              </button>
              <p className="text-xs leading-5 text-slate-500">
                Hệ thống tự chặn gửi trùng khi đang PENDING để bảo vệ workflow duyệt.
              </p>
            </form>
          ) : currentStatus === "PENDING" ? (
            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900 shadow-sm sm:p-6">
              <h2 className="text-xl font-bold">Form gửi mới đã được ẩn</h2>
              <p className="mt-2">
                Bạn đã có yêu cầu đang chờ duyệt, vì vậy không thể gửi trùng. Hãy theo dõi trạng
                thái tại trang này.
              </p>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
