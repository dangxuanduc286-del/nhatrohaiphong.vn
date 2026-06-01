import { db } from "@/lib/db";

const systemRoles = ["super_admin", "admin", "moderator"];

export default async function AdminRolesPage() {
  const [roles, permissions] = await Promise.all([
    db.role.findMany({ where: { deletedAt: null, slug: { in: systemRoles } }, orderBy: { slug: "asc" }, include: { permissions: { include: { permission: true } }, _count: { select: { users: true } } } }),
    db.permission.findMany({ where: { deletedAt: null }, orderBy: { slug: "asc" } }),
  ]);

  return (
    <section className="space-y-6">
      <div><p className="text-sm font-medium uppercase tracking-wide text-slate-500">Role Management</p><h2 className="text-2xl font-bold">Roles & permission matrix</h2><p className="mt-2 max-w-3xl text-sm text-slate-600">Read-only theo database hiện có. Không chỉnh sửa role/permission để tránh thay đổi RBAC production khi chưa có workflow phê duyệt.</p></div>
      <div className="grid gap-4 md:grid-cols-3">{roles.map((role) => <div key={role.id} className="rounded-2xl border bg-white p-5 shadow-sm"><div className="text-xs uppercase text-slate-500">{role.slug}</div><h3 className="mt-1 text-lg font-bold">{role.name}</h3><p className="mt-2 text-sm text-slate-600">{role.description ?? "Không có mô tả"}</p><div className="mt-4 text-sm"><strong>{role._count.users}</strong> user · <strong>{role.permissions.length}</strong> permission</div></div>)}</div>
      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm"><div className="border-b p-4 font-semibold">Permission matrix</div><div className="overflow-x-auto"><table className="min-w-[760px] divide-y divide-slate-200 text-sm"><thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Permission</th>{roles.map((role) => <th key={role.id} className="px-4 py-3">{role.name}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{permissions.map((permission) => <tr key={permission.id}><td className="px-4 py-3"><div className="font-medium">{permission.slug}</div><div className="text-xs text-slate-500">{permission.description ?? permission.name}</div></td>{roles.map((role) => <td key={role.id} className="px-4 py-3">{role.permissions.some((item) => item.permissionId === permission.id) ? <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800">Granted</span> : <span className="text-slate-400">—</span>}</td>)}</tr>)}</tbody></table></div></div>
    </section>
  );
}
