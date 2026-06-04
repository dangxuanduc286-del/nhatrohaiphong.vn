import {
  getSettingCategories,
  getSystemSettings,
  saveSystemSettingAction,
} from "@/server/admin/settings";
import { requireAdminPage } from "@/server/admin/utils";

function formatDate(value: Date | null) {
  if (!value) return "Chưa lưu";
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(
    value,
  );
}

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams?: Promise<{ search?: string; category?: string }>;
}) {
  await requireAdminPage("settings.manage");
  const params = await searchParams;
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.category) query.set("category", params.category);
  const data = await getSystemSettings(query);
  const categories = getSettingCategories();

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">Settings</p>
        <h2 className="text-2xl font-bold">Cấu hình hệ thống</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          Quản trị cấu hình tập trung theo key-value, có phân quyền settings.manage và audit log cho
          mọi thay đổi.
        </p>
      </div>

      <form className="flex flex-col gap-3 rounded-2xl border bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <input
          name="search"
          defaultValue={data.search}
          placeholder="Tìm key, mô tả, giá trị"
          className="min-h-11 flex-1 rounded-xl border px-3 py-2 text-sm"
        />
        <select
          name="category"
          defaultValue={data.category}
          className="min-h-11 rounded-xl border px-3 py-2 text-sm"
        >
          <option value="">Tất cả category</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <button
          className="min-h-11 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          type="submit"
        >
          Search / Filter
        </button>
      </form>

      <div className="grid gap-4 md:hidden">
        {data.items.map((setting) => (
          <form
            key={setting.key}
            action={saveSystemSettingAction}
            className="rounded-2xl border bg-white p-4 shadow-sm"
          >
            <input type="hidden" name="key" value={setting.key} />
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold">{setting.label}</div>
                <div className="text-xs text-slate-500">{setting.key}</div>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                {setting.category}
              </span>
            </div>
            <p className="mt-3 text-sm text-slate-600">{setting.description}</p>
            <div className="mt-4">
              {setting.input === "textarea" ? (
                <textarea
                  name="value"
                  defaultValue={setting.value}
                  rows={3}
                  className="w-full rounded-xl border px-3 py-2 text-sm"
                />
              ) : setting.input === "boolean" ? (
                <select
                  name="value"
                  defaultValue={setting.value}
                  className="min-h-11 w-full rounded-xl border px-3 py-2 text-sm"
                >
                  <option value="true">Enabled</option>
                  <option value="false">Disabled</option>
                </select>
              ) : (
                <input
                  name="value"
                  type={setting.input}
                  defaultValue={setting.value}
                  className="min-h-11 w-full rounded-xl border px-3 py-2 text-sm"
                />
              )}
            </div>
            <div className="mt-3 text-xs text-slate-500">
              Updated: {formatDate(setting.updatedAt)}
              {setting.updaterName ? ` bởi ${setting.updaterName}` : ""}
            </div>
            <button
              type="submit"
              className="mt-4 min-h-11 w-full rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Save
            </button>
          </form>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-2xl border bg-white shadow-sm md:block">
        <div className="overflow-x-auto">
          <table className="min-w-[980px] divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Setting</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Value</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.items.map((setting) => (
                <tr key={setting.key}>
                  <td className="px-4 py-3 align-top">
                    <div className="font-medium">{setting.label}</div>
                    <div className="text-xs text-slate-500">{setting.key}</div>
                    <div className="mt-1 max-w-md text-xs text-slate-500">
                      {setting.description}
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium">
                      {setting.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <form
                      id={`setting-${setting.key}`}
                      action={saveSystemSettingAction}
                      className="min-w-72"
                    >
                      <input type="hidden" name="key" value={setting.key} />
                      {setting.input === "textarea" ? (
                        <textarea
                          name="value"
                          defaultValue={setting.value}
                          rows={2}
                          className="w-full rounded-xl border px-3 py-2 text-sm"
                        />
                      ) : setting.input === "boolean" ? (
                        <select
                          name="value"
                          defaultValue={setting.value}
                          className="min-h-10 w-full rounded-xl border px-3 py-2 text-sm"
                        >
                          <option value="true">Enabled</option>
                          <option value="false">Disabled</option>
                        </select>
                      ) : (
                        <input
                          name="value"
                          type={setting.input}
                          defaultValue={setting.value}
                          className="min-h-10 w-full rounded-xl border px-3 py-2 text-sm"
                        />
                      )}
                    </form>
                  </td>
                  <td className="px-4 py-3 align-top text-slate-500">
                    <div>{formatDate(setting.updatedAt)}</div>
                    {setting.updaterName ? (
                      <div className="text-xs">{setting.updaterName}</div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <button
                      form={`setting-${setting.key}`}
                      type="submit"
                      className="min-h-10 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
                    >
                      Save
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {data.items.length === 0 ? (
        <div className="rounded-2xl border bg-white p-8 text-center text-sm text-slate-500">
          Không tìm thấy setting phù hợp.
        </div>
      ) : null}
    </section>
  );
}
