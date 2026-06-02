import { AdminDataTable, AdminEmptyState, AdminFilters, AdminPagination, AdminSearch, AdminStatusBadge, type AdminTableColumn } from "@/components/ui/admin-data-table";
import { db } from "@/lib/db";
import { getPagination } from "@/server/admin/utils";

type LandingPageRow = Awaited<ReturnType<typeof getLandingPages>>["items"][number];

async function getLandingPages(searchParams: URLSearchParams) {
  const { page, pageSize, skip, take } = getPagination(searchParams);
  const search = searchParams.get("search")?.trim() ?? "";
  const status = searchParams.get("status") ?? "";
  const where = { deletedAt: null, ...(status === "published" ? { isPublished: true } : status === "draft" ? { isPublished: false } : {}), ...(search ? { OR: [{ title: { contains: search, mode: "insensitive" as const } }, { slug: { contains: search, mode: "insensitive" as const } }, { path: { contains: search, mode: "insensitive" as const } }] } : {}) };
  const [items, total] = await Promise.all([db.landingPage.findMany({ where, skip, take, orderBy: { updatedAt: "desc" }, include: { city: true, district: true, poi: true, seoSettings: { where: { deletedAt: null }, take: 1 } } }), db.landingPage.count({ where })]);
  return { items, page, totalPages: Math.ceil(total / pageSize), search, status };
}

export default async function AdminLandingPagesPage({ searchParams }: { searchParams?: Promise<{ search?: string; status?: string; page?: string }> }) {
  const params = await searchParams;
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.status) query.set("status", params.status);
  if (params?.page) query.set("page", params.page);
  const data = await getLandingPages(query);
  const columns: AdminTableColumn<LandingPageRow>[] = [
    { key: "page", label: "Landing page", render: (item) => <div><div className="font-medium">{item.title}</div><div className="text-xs text-slate-500">{item.path}</div><div className="text-xs text-slate-500">Slug: {item.slug}</div></div> },
    { key: "seo", label: "SEO", render: (item) => <div><div>{item.seoSettings[0]?.metaTitle ?? "—"}</div><div className="text-xs text-slate-500">{item.seoSettings[0]?.canonicalUrl ?? "No canonical"}</div></div> },
    { key: "location", label: "Location/POI", render: (item) => item.city?.name ?? item.district?.name ?? item.poi?.name ?? "Global" },
    { key: "status", label: "Status", render: (item) => <AdminStatusBadge value={item.isPublished ? "Published" : "Draft"} tone={item.isPublished ? "green" : "amber"} /> },
  ];
  return <section className="space-y-6"><div><p className="text-sm font-medium uppercase tracking-wide text-slate-500">Landing Page Management</p><h2 className="text-2xl font-bold">Quản lý landing pages</h2><p className="mt-2 text-sm text-slate-600">CRUD qua API admin; UI danh sách hiển thị SEO Title, Meta, Canonical, Slug và Status.</p></div><AdminFilters><AdminSearch defaultValue={data.search} placeholder="Tìm title, slug, path" /><select name="status" defaultValue={data.status} className="rounded-xl border px-3 py-2 text-sm"><option value="">Tất cả</option><option value="published">Published</option><option value="draft">Draft</option></select></AdminFilters><AdminDataTable columns={columns} items={data.items} empty={<AdminEmptyState title="Không có landing page" />} /><AdminPagination page={data.page} totalPages={data.totalPages} basePath="/admin/landing-pages" searchParams={{ search: data.search, status: data.status }} /></section>;
}
