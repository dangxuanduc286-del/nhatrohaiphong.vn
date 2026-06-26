import { Button, Input } from "@/components/ui";
import { updateCurrentUserProfileAction } from "@/server/account/actions";
import { requireLandlordPage } from "@/server/landlord/utils";

export default async function LandlordProfilePage() {
  const auth = await requireLandlordPage();

  return (
    <section className="max-w-3xl space-y-6">
      <div className="rounded-3xl border bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-xl font-bold">Hồ sơ Chủ trọ</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Đồng bộ thông tin liên hệ hiển thị trong dashboard Chủ trọ, không đổi role hoặc workflow
          duyệt.
        </p>
        <form action={updateCurrentUserProfileAction} className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            Họ tên
            <Input
              name="fullName"
              defaultValue={auth.user?.fullName ?? ""}
              required
              minLength={2}
              maxLength={120}
              className="mt-1 min-h-12 w-full rounded-xl border px-3 py-3 text-base outline-none focus:border-blue-600 sm:text-sm"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Email
            <Input
              value={auth.user?.email ?? ""}
              readOnly
              className="mt-1 min-h-12 w-full rounded-xl border bg-slate-50 px-3 py-3 text-base text-slate-500 outline-none sm:text-sm"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Số điện thoại
            <Input
              name="phone"
              defaultValue={auth.user?.phone ?? ""}
              inputMode="tel"
              maxLength={20}
              className="mt-1 min-h-12 w-full rounded-xl border px-3 py-3 text-base outline-none focus:border-blue-600 sm:text-sm"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Avatar URL
            <Input
              name="avatarUrl"
              defaultValue={auth.user?.avatarUrl ?? ""}
              type="url"
              placeholder="https://..."
              className="mt-1 min-h-12 w-full rounded-xl border px-3 py-3 text-base outline-none focus:border-blue-600 sm:text-sm"
            />
          </label>
          <Button className="min-h-12 rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white hover:bg-blue-800">
            Lưu hồ sơ
          </Button>
        </form>
      </div>
    </section>
  );
}
