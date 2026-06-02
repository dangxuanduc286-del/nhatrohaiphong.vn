import { AdminDataTable, AdminEmptyState, AdminFilters, AdminPagination, AdminSearch, type AdminTableColumn } from "@/components/ui/admin-data-table";
import { db } from "@/lib/db";
import { getPagination } from "@/server/admin/utils";

type RoleRow = Awaited<ReturnType<typeof getRoles>>["items"][number];

async function getRoles(searchParams: URLSearchParams) {
  const { page, pageSize, skip, take } = getPagination(searchParams);
  const search = searchParams.get("search")?.trim() ?? "";
  const where = { deletedAt: null, ...(search ? { OR: [{ name: { contains: search, mode: "insensitive" as const } }, { slug: { contains: search, mode: "insensitive" as const } }] } : {}) };
  const [items, total, permissions] = await Promise.all([
    db.role.findMany({ where, skip, take, orderBy: { slug: "asc" }, include: { permissions: { include: { permission: true } }, users: { include: { user: { select: { id: true, email: true, fullName: true, status: true } } } }, _count: { select: { users: true, permissions: true } } } }),
    db.role.count({ where }),
    db.permission.findMany({ where: { deletedAt: null }, orderBy: { slug: "asc" } }),
  ]);
  return { items, total, permissions, page, totalPages: Math.ceil(total / pageSize), search };
}

export default async function AdminRolesPage({ searchParams }: { searchParams?: Promise<{ search?: string; page?: string }> }) {
  const params = await searchParams;
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.page) query.set("page", params.page);
  const data = await getRoles(query);
  const columns: AdminTableColumn<RoleRow>[] = [
    { key: "role", label: "Role", render: (item) => <div><div className="font-medium">{item.name}</div><div className="text-xs text-slate-500">{item.slug}</div><div className="text-xs text-slate-500">{item.description ?? "Không có mô tả"}</div></div> },
    { key: "permissions", label: "Permissions", render: (item) => <div><div className="font-semibold">{item._count.permissions}</div><div className="mt-1 flex flex-wrap gap-1">{item.permissions.slice(0, 6).map((rolePermission) => <span key={rolePermission.permissionId} className="rounded-full bg-slate-100 px-2 py-1 text-xs">{rolePermission.permission.slug}</span>)}</div></div> },
    { key: "users", label: "Users in role", render: (item) => <div><div className="font-semibold">{item._count.users}</div><div className="mt-1 space-y-1 text-xs text-slate-500">{item.users.slice(0, 3).map((userRole) => <div key={userRole.userId}>{userRole.user.fullName} · {userRole.user.status}</div>)}</div></div> },
  ];
  return <section className="space-y-6"><div><p className="text-sm font-medium uppercase tracking-wide text-slate-500">Role Management</p><h2 className="text-2xl font-bold">Roles & permission matrix</h2><p className="mt-2 max-w-3xl text-sm text-slate-600">API hỗ trợ list/create/edit/soft delete/gán permissions. Trang này hiển thị danh sách, permission matrix và users trong role.</p></div><AdminFilters><AdminSearch defaultValue={data.search} placeholder="Tìm role" /><span /></AdminFilters><AdminDataTable columns={columns} items={data.items} empty={<AdminEmptyState title="Không có role" />} /><AdminPagination page={data.page} totalPages={data.totalPages} basePath="/admin/roles" searchParams={{ search: data.search }} /><div className="overflow-hidden rounded-2xl border bg-white shadow-sm"><div className="border-b p-4 font-semibold">Permission matrix</div><div className="overflow-x-auto"><table className="min-w-[860px] divide-y divide-slate-200 text-sm"><thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Permission</th>{data.items.map((role) => <th key={role.id} className="px-4 py-3">{role.slug}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{data.permissions.map((permission) => <tr key={permission.id}><td className="px-4 py-3"><div className="font-medium">{permission.slug}</div><div className="text-xs text-slate-500">{permission.description ?? permission.name}</div></td>{data.items.map((role) => <td key={role.id} className="px-4 py-3">{role.permissions.some((item) => item.permissionId === permission.id) ? <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800">Granted</span> : <span className="text-slate-400">—</span>}</td>)}</tr>)}</tbody></table></div></div></section>;
}
