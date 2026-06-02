import { AdminDataTable, AdminEmptyState, AdminFilters, AdminPagination, AdminSearch, type AdminTableColumn } from "@/components/ui/admin-data-table";
import { db } from "@/lib/db";
import { getPagination } from "@/server/admin/utils";

type DistrictRow = Awaited<ReturnType<typeof getDistricts>>["items"][number];

async function getDistricts(searchParams: URLSearchParams) {
  const { page, pageSize, skip, take } = getPagination(searchParams);
  const search = searchParams.get("search")?.trim() ?? "";
  const where = { deletedAt: null, ...(search ? { OR: [{ name: { contains: search, mode: "insensitive" as const } }, { slug: { contains: search, mode: "insensitive" as const } }] } : {}) };
  const [items, total] = await Promise.all([db.district.findMany({ where, skip, take, orderBy: { name: "asc" }, include: { city: true, _count: { select: { wards: true, properties: true, rooms: true } } } }), db.district.count({ where })]);
  return { items, page, totalPages: Math.ceil(total / pageSize), search };
}

export default async function AdminDistrictsPage({ searchParams }: { searchParams?: Promise<{ search?: string; page?: string }> }) {
  const params = await searchParams;
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.page) query.set("page", params.page);
  const data = await getDistricts(query);
  const columns: AdminTableColumn<DistrictRow>[] = [
    { key: "district", label: "District", render: (item) => <div><div className="font-medium">{item.name}</div><div className="text-xs text-slate-500">{item.slug}</div></div> },
    { key: "city", label: "City", render: (item) => item.city?.name ?? "—" },
    { key: "wards", label: "Wards", render: (item) => item._count.wards },
    { key: "properties", label: "Properties", render: (item) => item._count.properties },
    { key: "rooms", label: "Rooms", render: (item) => item._count.rooms },
  ];
  return <section className="space-y-6"><div><p className="text-sm font-medium uppercase tracking-wide text-slate-500">District Management</p><h2 className="text-2xl font-bold">Quản lý districts</h2></div><AdminFilters><AdminSearch defaultValue={data.search} placeholder="Tìm district" /><span /></AdminFilters><AdminDataTable columns={columns} items={data.items} empty={<AdminEmptyState title="Không có district" />} /><AdminPagination page={data.page} totalPages={data.totalPages} basePath="/admin/districts" searchParams={{ search: data.search }} /></section>;
}
