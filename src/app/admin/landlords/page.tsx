import { AdminDataTable, AdminEmptyState, AdminFilters, AdminPagination, AdminSearch, AdminStatusBadge, type AdminTableColumn } from "@/components/ui/admin-data-table";
import type { UserStatus } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { getPagination } from "@/server/admin/utils";

function formatNumber(value: number) {
  return value.toLocaleString("vi-VN");
}

type LandlordRow = Awaited<ReturnType<typeof getLandlords>>["items"][number];

async function getLandlords(searchParams: URLSearchParams) {
  const { page, pageSize, skip, take } = getPagination(searchParams);
  const search = searchParams.get("search")?.trim() ?? "";
  const status = searchParams.get("status") ?? "ACTIVE";
  const normalizedStatus: UserStatus | undefined = status === "ACTIVE" || status === "INACTIVE" || status === "BANNED" ? status : undefined;
  const where = { deletedAt: null, roles: { some: { role: { slug: "landlord" } } }, ...(normalizedStatus ? { status: normalizedStatus } : {}), ...(search ? { OR: [{ email: { contains: search, mode: "insensitive" as const } }, { phone: { contains: search, mode: "insensitive" as const } }, { fullName: { contains: search, mode: "insensitive" as const } }] } : {}) };
  const [items, total] = await Promise.all([
    db.user.findMany({ where, skip, take, orderBy: { createdAt: "desc" }, select: { id: true, fullName: true, email: true, phone: true, status: true, lockedUntil: true, properties: { where: { deletedAt: null }, select: { id: true, buildings: { where: { deletedAt: null }, select: { rooms: { where: { deletedAt: null }, select: { id: true, status: true, contracts: { where: { deletedAt: null }, select: { id: true } } } } } } } } } }),
    db.user.count({ where }),
  ]);
  return { items, total, page, totalPages: Math.ceil(total / pageSize), search, status };
}

export default async function AdminLandlordsPage({ searchParams }: { searchParams?: Promise<{ search?: string; status?: string; page?: string }> }) {
  const params = await searchParams;
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.status) query.set("status", params.status);
  if (params?.page) query.set("page", params.page);
  const data = await getLandlords(query);
  const columns: AdminTableColumn<LandlordRow>[] = [
    { key: "landlord", label: "Landlord", render: (item) => <div><div className="font-medium">{item.fullName}</div><div className="text-xs text-slate-500">{item.email}</div><div className="text-xs text-slate-500">{item.phone ?? "Chưa có phone"}</div></div> },
    { key: "status", label: "Status", render: (item) => <AdminStatusBadge value={item.lockedUntil ? "LOCKED" : item.status} tone={item.status === "ACTIVE" && !item.lockedUntil ? "green" : "red"} /> },
    { key: "properties", label: "Properties", render: (item) => formatNumber(item.properties.length) },
    { key: "rooms", label: "Rooms", render: (item) => formatNumber(item.properties.reduce((sum, property) => sum + property.buildings.reduce((roomSum, building) => roomSum + building.rooms.length, 0), 0)) },
    { key: "contracts", label: "Contracts", render: (item) => formatNumber(item.properties.reduce((sum, property) => sum + property.buildings.reduce((buildingSum, building) => buildingSum + building.rooms.reduce((roomSum, room) => roomSum + room.contracts.length, 0), 0), 0)) },
  ];
  return <section className="space-y-6"><div><p className="text-sm font-medium uppercase tracking-wide text-slate-500">Landlord Management</p><h2 className="text-2xl font-bold">Quản lý chủ trọ</h2><p className="mt-2 max-w-3xl text-sm text-slate-600">Danh sách chủ trọ từ role landlord, tổng properties/rooms/contracts/status và API hỗ trợ lock/unlock qua user status.</p></div><AdminFilters><AdminSearch defaultValue={data.search} placeholder="Tìm landlord" /><select name="status" defaultValue={data.status} className="rounded-xl border px-3 py-2 text-sm"><option value="ACTIVE">ACTIVE</option><option value="INACTIVE">INACTIVE</option><option value="BANNED">BANNED</option></select></AdminFilters><AdminDataTable columns={columns} items={data.items} empty={<AdminEmptyState title="Không có landlord" />} /><AdminPagination page={data.page} totalPages={data.totalPages} basePath="/admin/landlords" searchParams={{ search: data.search, status: data.status }} /></section>;
}
