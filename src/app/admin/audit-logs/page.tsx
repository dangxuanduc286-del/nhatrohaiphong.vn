import { AdminDataTable, AdminEmptyState, AdminFilters, AdminPagination, AdminSearch, type AdminTableColumn } from "@/components/ui/admin-data-table";
import { db } from "@/lib/db";
import { getPagination } from "@/server/admin/utils";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(value);
}

type AuditLogRow = Awaited<ReturnType<typeof getAuditLogs>>["items"][number];

async function getAuditLogs(searchParams: URLSearchParams) {
  const { page, pageSize, skip, take } = getPagination(searchParams);
  const search = searchParams.get("search")?.trim() ?? "";
  const entityType = searchParams.get("entityType")?.trim() ?? "";
  const action = searchParams.get("action")?.trim() ?? "";
  const where = { ...(entityType ? { entityType } : {}), ...(action ? { action: { contains: action, mode: "insensitive" as const } } : {}), ...(search ? { OR: [{ action: { contains: search, mode: "insensitive" as const } }, { entityType: { contains: search, mode: "insensitive" as const } }, { entityId: { contains: search, mode: "insensitive" as const } }, { ipAddress: { contains: search, mode: "insensitive" as const } }] } : {}) };
  const [items, total, entities] = await Promise.all([
    db.auditLog.findMany({ where, skip, take, orderBy: { createdAt: "desc" }, include: { user: { select: { fullName: true, email: true } } } }),
    db.auditLog.count({ where }),
    db.auditLog.groupBy({ by: ["entityType"], _count: { _all: true }, orderBy: { _count: { entityType: "desc" } }, take: 10 }),
  ]);
  return { items, total, entities, page, totalPages: Math.ceil(total / pageSize), search, entityType, action };
}

export default async function AdminAuditLogsPage({ searchParams }: { searchParams?: Promise<{ search?: string; entityType?: string; action?: string; page?: string }> }) {
  const params = await searchParams;
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.entityType) query.set("entityType", params.entityType);
  if (params?.action) query.set("action", params.action);
  if (params?.page) query.set("page", params.page);
  const data = await getAuditLogs(query);
  const columns: AdminTableColumn<AuditLogRow>[] = [
    { key: "action", label: "Action", render: (item) => <div><div className="font-medium">{item.action}</div><div className="text-xs text-slate-500">{item.id}</div></div> },
    { key: "entity", label: "Entity", render: (item) => <div>{item.entityType}{item.entityId ? <div className="text-xs text-slate-500">{item.entityId}</div> : null}</div> },
    { key: "user", label: "User", render: (item) => item.user?.fullName ?? item.user?.email ?? "System" },
    { key: "ip", label: "IP", render: (item) => item.ipAddress ?? "—" },
    { key: "time", label: "Timestamp", render: (item) => formatDate(item.createdAt) },
  ];
  return <section className="space-y-6"><div><p className="text-sm font-medium uppercase tracking-wide text-slate-500">Audit Logs</p><h2 className="text-2xl font-bold">Audit logs</h2><p className="mt-2 max-w-3xl text-sm text-slate-600">Read-only audit trail: user/action/entity/timestamp/IP, hỗ trợ search/filter/pagination.</p></div><AdminFilters><AdminSearch defaultValue={data.search} placeholder="Tìm action, entity, IP" /><input name="entityType" defaultValue={data.entityType} placeholder="Entity type" className="rounded-xl border px-3 py-2 text-sm" /><input name="action" defaultValue={data.action} placeholder="Action" className="rounded-xl border px-3 py-2 text-sm" /></AdminFilters><div className="grid gap-6 xl:grid-cols-4"><div className="rounded-2xl border bg-white p-5 shadow-sm"><h3 className="font-semibold">Entity phổ biến</h3><div className="mt-4 space-y-2">{data.entities.map((item) => <div key={item.entityType} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-sm"><span>{item.entityType}</span><strong>{item._count._all}</strong></div>)}</div></div><div className="xl:col-span-3"><AdminDataTable columns={columns} items={data.items} empty={<AdminEmptyState title="Không có audit log" />} /></div></div><AdminPagination page={data.page} totalPages={data.totalPages} basePath="/admin/audit-logs" searchParams={{ search: data.search, entityType: data.entityType, action: data.action }} /></section>;
}
