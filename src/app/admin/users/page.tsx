import type { UserStatus } from "@/generated/prisma/enums";
import { AdminActionButton } from "@/components/ui/admin-action-button";
import { db } from "@/lib/db";
import { updateUserAction } from "@/server/admin/actions";

function formatDate(value: Date | null) {
  if (!value) return "Chưa có";
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(value);
}

function statusTone(status: UserStatus) {
  if (status === "ACTIVE") return "bg-emerald-100 text-emerald-800";
  if (status === "BANNED") return "bg-rose-100 text-rose-800";
  return "bg-slate-100 text-slate-700";
}

const userActions = [
  { label: "Khóa", action: "LOCK" },
  { label: "Mở khóa", action: "UNLOCK" },
  { label: "Soft delete", action: "SOFT_DELETE" },
  { label: "Restore", action: "RESTORE" },
] as const;

export default async function AdminUsersPage({ searchParams }: { searchParams?: Promise<{ search?: string; status?: string; deleted?: string }> }) {
  const params = await searchParams;
  const search = params?.search?.trim() ?? "";
  const status = params?.status;
  const includeDeleted = params?.deleted === "1";
  const normalizedStatus: UserStatus | undefined = status === "ACTIVE" || status === "INACTIVE" || status === "BANNED" ? status : undefined;
  const where = {
    ...(includeDeleted ? { deletedAt: { not: null } } : { deletedAt: null }),
    ...(normalizedStatus ? { status: normalizedStatus } : {}),
    ...(search
      ? {
          OR: [
            { email: { contains: search, mode: "insensitive" as const } },
            { phone: { contains: search, mode: "insensitive" as const } },
            { fullName: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };
  const [users, totalUsers, activeUsers, bannedUsers, deletedUsers] = await Promise.all([
    db.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
      select: { id: true, email: true, phone: true, fullName: true, status: true, lastLoginAt: true, lockedUntil: true, createdAt: true, deletedAt: true },
    }),
    db.user.count({ where: { deletedAt: null } }),
    db.user.count({ where: { deletedAt: null, status: "ACTIVE" } }),
    db.user.count({ where: { deletedAt: null, status: "BANNED" } }),
    db.user.count({ where: { deletedAt: { not: null } } }),
  ]);
  const userIds = users.map((user) => user.id);
  const [roles, sessions, recentActions] = await Promise.all([
    userIds.length ? db.userRole.findMany({ where: { userId: { in: userIds } }, include: { role: true } }) : [],
    userIds.length ? db.userSession.groupBy({ by: ["userId"], where: { userId: { in: userIds }, deletedAt: null }, _count: { _all: true } }) : [],
    db.auditLog.findMany({ where: { entityType: "User" }, orderBy: { createdAt: "desc" }, take: 8, include: { user: { select: { fullName: true, email: true } } } }),
  ]);
  const rolesByUserId = new Map<string, typeof roles>();
  for (const role of roles) rolesByUserId.set(role.userId, [...(rolesByUserId.get(role.userId) ?? []), role]);
  const sessionCountByUserId = new Map(sessions.map((item) => [item.userId, item._count._all]));

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-sm font-medium uppercase tracking-wide text-slate-500">User Management</p><h2 className="text-2xl font-bold">Quản lý người dùng</h2><p className="mt-2 max-w-3xl text-sm text-slate-600">Khóa/mở khóa, soft delete và restore qua server action có permission user.manage. Không hard delete user.</p></div></div>

      <div className="grid gap-3 sm:grid-cols-4"><div className="rounded-2xl border bg-white p-4 shadow-sm"><p className="text-xs text-slate-500">Tổng user</p><strong className="text-2xl">{totalUsers.toLocaleString("vi-VN")}</strong></div><div className="rounded-2xl border bg-white p-4 shadow-sm"><p className="text-xs text-slate-500">Đang hoạt động</p><strong className="text-2xl text-emerald-700">{activeUsers.toLocaleString("vi-VN")}</strong></div><div className="rounded-2xl border bg-white p-4 shadow-sm"><p className="text-xs text-slate-500">Bị khóa</p><strong className="text-2xl text-rose-700">{bannedUsers.toLocaleString("vi-VN")}</strong></div><div className="rounded-2xl border bg-white p-4 shadow-sm"><p className="text-xs text-slate-500">Đã xóa mềm</p><strong className="text-2xl text-amber-700">{deletedUsers.toLocaleString("vi-VN")}</strong></div></div>

      <form className="grid gap-3 rounded-2xl border bg-white p-4 shadow-sm sm:grid-cols-[1fr_180px_160px_auto]"><input name="search" defaultValue={search} placeholder="Tìm email, phone, họ tên" className="min-w-0 rounded-xl border px-3 py-2 text-sm outline-none focus:border-slate-900" /><select name="status" defaultValue={status ?? ""} className="rounded-xl border px-3 py-2 text-sm outline-none focus:border-slate-900"><option value="">Tất cả trạng thái</option><option value="ACTIVE">ACTIVE</option><option value="INACTIVE">INACTIVE</option><option value="BANNED">BANNED</option></select><select name="deleted" defaultValue={includeDeleted ? "1" : "0"} className="rounded-xl border px-3 py-2 text-sm outline-none focus:border-slate-900"><option value="0">Chưa xóa</option><option value="1">Đã xóa mềm</option></select><button className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Lọc</button></form>

      <div className="grid gap-6 xl:grid-cols-3"><div className="overflow-hidden rounded-2xl border bg-white shadow-sm xl:col-span-2"><div className="border-b p-4 font-semibold">Danh sách user</div><div className="overflow-x-auto"><table className="min-w-[980px] divide-y divide-slate-200 text-sm"><thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Người dùng</th><th className="px-4 py-3">Roles</th><th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3">Sessions</th><th className="px-4 py-3">Đăng nhập cuối</th><th className="px-4 py-3">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{users.map((user) => (<tr key={user.id} className="align-top"><td className="px-4 py-3"><div className="font-medium text-slate-900">{user.fullName}</div><div className="text-xs text-slate-500">{user.email}</div><div className="text-xs text-slate-500">{user.phone ?? "Chưa có phone"}</div>{user.deletedAt ? <div className="mt-1 text-xs font-semibold text-amber-700">Deleted: {formatDate(user.deletedAt)}</div> : null}</td><td className="px-4 py-3"><div className="flex flex-wrap gap-1">{(rolesByUserId.get(user.id) ?? []).map((item) => <span key={item.roleId} className="rounded-full bg-slate-100 px-2 py-1 text-xs">{item.role.slug}</span>)}</div></td><td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusTone(user.status)}`}>{user.status}</span></td><td className="px-4 py-3">{sessionCountByUserId.get(user.id) ?? 0}</td><td className="px-4 py-3 text-slate-600">{formatDate(user.lastLoginAt)}</td><td className="px-4 py-3"><div className="flex flex-wrap gap-2">{userActions.map((item) => <form key={item.action} action={updateUserAction}><input type="hidden" name="id" value={user.id} /><input type="hidden" name="action" value={item.action} /><AdminActionButton label={item.label} message={`${item.label} user ${user.email}?`} /></form>)}</div></td></tr>))}</tbody></table></div></div><div className="rounded-2xl border bg-white p-5 shadow-sm"><h3 className="font-semibold">Hoạt động user gần đây</h3><div className="mt-4 space-y-3">{recentActions.length ? recentActions.map((log) => <div key={log.id} className="rounded-xl border p-3 text-sm"><div className="font-medium">{log.action}</div><div className="mt-1 text-xs text-slate-500">{log.entityId}</div><div className="mt-1 text-xs text-slate-500">{formatDate(log.createdAt)} · {log.user?.fullName ?? log.user?.email ?? "System"}</div></div>) : <p className="text-sm text-slate-500">Chưa có hoạt động.</p>}</div></div></div>
    </section>
  );
}
