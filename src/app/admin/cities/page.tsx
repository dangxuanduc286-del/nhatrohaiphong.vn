import { AdminDataTable, AdminEmptyState, AdminFilters, AdminPagination, AdminSearch, AdminStatusBadge, type AdminTableColumn } from "@/components/ui/admin-data-table";
import { db } from "@/lib/db";
import { getPagination } from "@/server/admin/utils";

type CityRow = Awaited<ReturnType<typeof getCities>>["items"][number];

async function getCities(searchParams: URLSearchParams) {
  const { page, pageSize, skip, take } = getPagination(searchParams);
  const search = searchParams.get("search")?.trim() ?? "";
  const where = { deletedAt: null, ...(search ? { OR: [{ name: { contains: search, mode: "insensitive" as const } }, { slug: { contains: search, mode: "insensitive" as const } }, { code: { contains: search, mode: "insensitive" as const } }] } : {}) };
  const [items, total] = await Promise.all([db.city.findMany({ where, skip, take, orderBy: { name: "asc" }, include: { _count: { select: { districts: true, pointsOfInterest: true } } } }), db.city.count({ where })]);
  return { items, page, totalPages: Math.ceil(total / pageSize), search };
}

export default async function AdminCitiesPage({ searchParams }: { searchParams?: Promise<{ search?: string; page?: string }> }) {
  const params = await searchParams;
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.page) query.set("page", params.page);
  const data = await getCities(query);
  const columns: AdminTableColumn<CityRow>[] = [
    { key: "city", label: "City", render: (item) => <div><div className="font-medium">{item.name}</div><div className="text-xs text-slate-500">{item.slug} · {item.code}</div></div> },
    { key: "status", label: "Status", render: (item) => <AdminStatusBadge value={item.status} tone={item.status === "ACTIVE" ? "green" : "amber"} /> },
    { key: "districts", label: "Districts", render: (item) => item._count.districts },
    { key: "poi", label: "POI", render: (item) => item._count.pointsOfInterest },
  ];
  return <section className="space-y-6"><div><p className="text-sm font-medium uppercase tracking-wide text-slate-500">City Management</p><h2 className="text-2xl font-bold">Quản lý cities</h2></div><AdminFilters><AdminSearch defaultValue={data.search} placeholder="Tìm city" /><span /></AdminFilters><AdminDataTable columns={columns} items={data.items} empty={<AdminEmptyState title="Không có city" />} /><AdminPagination page={data.page} totalPages={data.totalPages} basePath="/admin/cities" searchParams={{ search: data.search }} /></section>;
}
