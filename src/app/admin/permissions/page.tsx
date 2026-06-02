import { AdminDataTable, AdminEmptyState, AdminFilters, AdminPagination, AdminSearch, AdminStatusBadge, type AdminTableColumn } from "@/components/ui/admin-data-table";
import { db } from "@/lib/db";
import { getPagination } from "@/server/admin/utils";

function groupFromSlug(slug: string) {
  return slug.split(".")[0] ?? "system";
}

type PermissionRow = Awaited<ReturnType<typeof getPermissions>>["items"][number];

async function getPermissions(searchParams: URLSearchParams) {
  const { page, pageSize, skip, take } = getPagination(searchParams);
  const search = searchParams.get("search")?.trim() ?? "";
  const group = searchParams.get("group") ?? "";
  const where = { deletedAt: null, ...(group ? { slug: { startsWith: `${group}.` } } : {}), ...(search ? { OR: [{ name: { contains: search, mode: "insensitive" as const } }, { slug: { contains: search, mode: "insensitive" as const } }] } : {}) };
  const [items, total] = await Promise.all([db.permission.findMany({ where, skip, take, orderBy: { slug: "asc" }, include: { roles: { include: { role: true } } } }), db.permission.count({ where })]);
  return { items, total, page, totalPages: Math.ceil(total / pageSize), search, group };
}

export default async function AdminPermissionsPage({ searchParams }: { searchParams?: Promise<{ search?: string; group?: string; page?: string }> }) {
  const params = await searchParams;
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.group) query.set("group", params.group);
  if (params?.page) query.set("page", params.page);
  const data = await getPermissions(query);
  const columns: AdminTableColumn<PermissionRow>[] = [
    { key: "permission", label: "Permission", render: (item) => <div><div className="font-medium">{item.name}</div><div className="text-xs text-slate-500">{item.slug}</div></div> },
    { key: "group", label: "Group", render: (item) => <AdminStatusBadge value={groupFromSlug(item.slug)} tone="blue" /> },
    { key: "roles", label: "Assigned roles", render: (item) => <div className="flex flex-wrap gap-1">{item.roles.map((role) => <span key={role.roleId} className="rounded-full bg-slate-100 px-2 py-1 text-xs">{role.role.slug}</span>)}</div> },
    { key: "description", label: "Description", render: (item) => item.description ?? "—" },
  ];
  return <section className="space-y-6"><div><p className="text-sm font-medium uppercase tracking-wide text-slate-500">Permission Management</p><h2 className="text-2xl font-bold">Quản lý permissions</h2><p className="mt-2 text-sm text-slate-600">Danh sách, search, filter theo group và xem role đang được gán.</p></div><AdminFilters><AdminSearch defaultValue={data.search} placeholder="Tìm permission" /><select name="group" defaultValue={data.group} className="rounded-xl border px-3 py-2 text-sm"><option value="">Tất cả group</option><option value="system">system</option><option value="user">user</option><option value="role">role</option><option value="audit">audit</option><option value="settings">settings</option><option value="room">room</option><option value="analytics">analytics</option></select></AdminFilters><AdminDataTable columns={columns} items={data.items} empty={<AdminEmptyState title="Không có permission" />} /><AdminPagination page={data.page} totalPages={data.totalPages} basePath="/admin/permissions" searchParams={{ search: data.search, group: data.group }} /></section>;
}
