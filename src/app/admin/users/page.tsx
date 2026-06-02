import { AdminDataTable, AdminEmptyState, AdminFilters, AdminPagination, AdminSearch, AdminStatusBadge, type AdminTableColumn } from "@/components/ui/admin-data-table";
import type { UserStatus } from "@/generated/prisma/enums";
import { AdminActionButton } from "@/components/ui/admin-action-button";
import { db } from "@/lib/db";
import { updateUserAction } from "@/server/admin/actions";
import { getPagination } from "@/server/admin/utils";

function formatDate(value: Date | null) {
  if (!value) return "Chưa có";
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(value);
}

function statusTone(status: UserStatus) {
  if (status === "ACTIVE") return "green";
  if (status === "BANNED") return "red";
  return "slate";
}

const userActions = [
  { label: "Khóa", action: "LOCK" },
  { label: "Mở khóa", action: "UNLOCK" },
  { label: "Soft delete", action: "SOFT_DELETE" },
  { label: "Restore", action: "RESTORE" },
] as const;

type UsersData = Awaited<ReturnType<typeof getUsers>>;
type UserRow = UsersData["items"][number];

async function getUsers(searchParams: URLSearchParams) {
  const { page, pageSize, skip, take } = getPagination(searchParams);
  const search = searchParams.get("search")?.trim() ?? "";
  const status = searchParams.get("status") ?? "";
  const deleted = searchParams.get("deleted") ?? "0";
  const includeDeleted = deleted === "1";
  const normalizedStatus: UserStatus | undefined = status === "ACTIVE" || status === "INACTIVE" || status === "BANNED" ? status : undefined;
  const where = {
    ...(includeDeleted ? { deletedAt: { not: null } } : { deletedAt: null }),
    ...(normalizedStatus ? { status: normalizedStatus } : {}),
    ...(search ? { OR: [{ email: { contains: search, mode: "insensitive" as const } }, { phone: { contains: search, mode: "insensitive" as const } }, { fullName: { contains: search, mode: "insensitive" as const } }] } : {}),
  };
  const [items, total, totalUsers, activeUsers, bannedUsers, deletedUsers] = await Promise.all([
    db.user.findMany({ where, skip, take, orderBy: { createdAt: "desc" }, select: { id: true, email: true, phone: true, fullName: true, status: true, lastLoginAt: true, lockedUntil: true, createdAt: true, deletedAt: true, roles: { include: { role: true } }, sessions: { where: { deletedAt: null }, select: { id: true } } } }),
    db.user.count({ where }),
    db.user.count({ where: { deletedAt: null } }),
    db.user.count({ where: { deletedAt: null, status: "ACTIVE" } }),
    db.user.count({ where: { deletedAt: null, status: "BANNED" } }),
    db.user.count({ where: { deletedAt: { not: null } } }),
  ]);

  return { items, total, totalUsers, activeUsers, bannedUsers, deletedUsers, page, totalPages: Math.ceil(total / pageSize), search, status, deleted };
}

export default async function AdminUsersPage({ searchParams }: { searchParams?: Promise<{ search?: string; status?: string; deleted?: string; page?: string }> }) {
  const params = await searchParams;
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.status) query.set("status", params.status);
  if (params?.deleted) query.set("deleted", params.deleted);
  if (params?.page) query.set("page", params.page);
  const data = await getUsers(query);
  const columns: AdminTableColumn<UserRow>[] = [
    { key: "user", label: "Người dùng", render: (user) => <div><div className="font-medium text-slate-900">{user.fullName}</div><div className="text-xs text-slate-500">{user.email}</div><div className="text-xs text-slate-500">{user.phone ?? "Chưa có phone"}</div>{user.deletedAt ? <div className="mt-1 text-xs font-semibold text-amber-700">Deleted: {formatDate(user.deletedAt)}</div> : null}</div> },
    { key: "roles", label: "Roles", render: (user) => <div className="flex flex-wrap gap-1">{user.roles.map((item) => <span key={item.roleId} className="rounded-full bg-slate-100 px-2 py-1 text-xs">{item.role.slug}</span>)}</div> },
    { key: "status", label: "Trạng thái", render: (user) => <AdminStatusBadge value={user.lockedUntil ? "LOCKED" : user.status} tone={user.lockedUntil ? "red" : statusTone(user.status)} /> },
    { key: "sessions", label: "Sessions", render: (user) => user.sessions.length.toLocaleString("vi-VN") },
    { key: "lastLogin", label: "Đăng nhập cuối", render: (user) => <span className="text-slate-600">{formatDate(user.lastLoginAt)}</span> },
    { key: "actions", label: "Actions", render: (user) => <div className="flex flex-wrap gap-2">{userActions.map((item) => <form key={item.action} action={updateUserAction}><input type="hidden" name="id" value={user.id} /><input type="hidden" name="action" value={item.action} /><AdminActionButton label={item.label} message={`${item.label} user ${user.email}?`} /></form>)}</div> },
  ];

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-sm font-medium uppercase tracking-wide text-slate-500">User Management</p><h2 className="text-2xl font-bold">Quản lý người dùng</h2><p className="mt-2 max-w-3xl text-sm text-slate-600">Khóa/mở khóa, soft delete và restore qua server action có permission user.manage. Không hard delete user.</p></div></div>
      <div className="grid gap-3 sm:grid-cols-4"><div className="rounded-2xl border bg-white p-4 shadow-sm"><p className="text-xs text-slate-500">Tổng user</p><strong className="text-2xl">{data.totalUsers.toLocaleString("vi-VN")}</strong></div><div className="rounded-2xl border bg-white p-4 shadow-sm"><p className="text-xs text-slate-500">Đang hoạt động</p><strong className="text-2xl text-emerald-700">{data.activeUsers.toLocaleString("vi-VN")}</strong></div><div className="rounded-2xl border bg-white p-4 shadow-sm"><p className="text-xs text-slate-500">Bị khóa</p><strong className="text-2xl text-rose-700">{data.bannedUsers.toLocaleString("vi-VN")}</strong></div><div className="rounded-2xl border bg-white p-4 shadow-sm"><p className="text-xs text-slate-500">Đã xóa mềm</p><strong className="text-2xl text-amber-700">{data.deletedUsers.toLocaleString("vi-VN")}</strong></div></div>
      <AdminFilters><AdminSearch defaultValue={data.search} placeholder="Tìm email, phone, họ tên" /><select name="status" defaultValue={data.status} className="rounded-xl border px-3 py-2 text-sm"><option value="">Tất cả trạng thái</option><option value="ACTIVE">ACTIVE</option><option value="INACTIVE">INACTIVE</option><option value="BANNED">BANNED</option></select><select name="deleted" defaultValue={data.deleted} className="rounded-xl border px-3 py-2 text-sm"><option value="0">Chưa xóa</option><option value="1">Đã xóa mềm</option></select></AdminFilters>
      <AdminDataTable columns={columns} items={data.items} empty={<AdminEmptyState title="Không có user" />} />
      <AdminPagination page={data.page} totalPages={data.totalPages} basePath="/admin/users" searchParams={{ search: data.search, status: data.status, deleted: data.deleted }} />
    </section>
  );
}
