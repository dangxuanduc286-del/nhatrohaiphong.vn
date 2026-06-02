import type { PointOfInterestCategory } from "@/generated/prisma/enums";
import { AdminDataTable, AdminEmptyState, AdminFilters, AdminPagination, AdminSearch, AdminStatusBadge, type AdminTableColumn } from "@/components/ui/admin-data-table";
import { db } from "@/lib/db";
import { getPagination } from "@/server/admin/utils";

const poiCategories = ["INDUSTRIAL_PARK", "PORT", "AIRPORT", "UNIVERSITY", "HOSPITAL", "TRANSPORT", "SHOPPING_MALL", "TOURISM", "RESIDENTIAL_AREA"] as const;

type PoiRow = Awaited<ReturnType<typeof getPoi>>["items"][number];

async function getPoi(searchParams: URLSearchParams) {
  const { page, pageSize, skip, take } = getPagination(searchParams);
  const search = searchParams.get("search")?.trim() ?? "";
  const rawCategory = searchParams.get("category") ?? "";
  const category = poiCategories.includes(rawCategory as PointOfInterestCategory) ? rawCategory as PointOfInterestCategory : undefined;
  const where = { deletedAt: null, ...(category ? { category } : {}), ...(search ? { OR: [{ name: { contains: search, mode: "insensitive" as const } }, { slug: { contains: search, mode: "insensitive" as const } }] } : {}) };
  const [items, total] = await Promise.all([db.pointOfInterest.findMany({ where, skip, take, orderBy: { updatedAt: "desc" }, include: { city: true } }), db.pointOfInterest.count({ where })]);
  return { items, page, totalPages: Math.ceil(total / pageSize), search, category: rawCategory };
}

export default async function AdminPointsOfInterestPage({ searchParams }: { searchParams?: Promise<{ search?: string; category?: string; page?: string }> }) {
  const params = await searchParams;
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.category) query.set("category", params.category);
  if (params?.page) query.set("page", params.page);
  const data = await getPoi(query);
  const columns: AdminTableColumn<PoiRow>[] = [
    { key: "poi", label: "POI", render: (item) => <div><div className="font-medium">{item.name}</div><div className="text-xs text-slate-500">{item.slug}</div></div> },
    { key: "category", label: "Category", render: (item) => <AdminStatusBadge value={item.category} tone="blue" /> },
    { key: "location", label: "City", render: (item) => item.city?.name ?? "—" },
    { key: "coords", label: "Lat/Lng", render: (item) => `${item.latitude.toString()}, ${item.longitude.toString()}` },
    { key: "description", label: "SEO data", render: (item) => item.description ?? "—" },
  ];
  return <section className="space-y-6"><div><p className="text-sm font-medium uppercase tracking-wide text-slate-500">POI Management</p><h2 className="text-2xl font-bold">Quản lý Points of Interest</h2><p className="mt-2 text-sm text-slate-600">CRUD POI qua API admin, gồm category, city, lat/lng và SEO data.</p></div><AdminFilters><AdminSearch defaultValue={data.search} placeholder="Tìm POI" /><select name="category" defaultValue={data.category} className="rounded-xl border px-3 py-2 text-sm"><option value="">Tất cả category</option>{poiCategories.map((category) => <option key={category} value={category}>{category}</option>)}</select></AdminFilters><AdminDataTable columns={columns} items={data.items} empty={<AdminEmptyState title="Không có POI" />} /><AdminPagination page={data.page} totalPages={data.totalPages} basePath="/admin/points-of-interest" searchParams={{ search: data.search, category: data.category }} /></section>;
}
