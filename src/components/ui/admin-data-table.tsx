import Link from "next/link";
import type { ReactNode } from "react";

export type AdminTableColumn<T> = {
  key: string;
  label: string;
  render: (item: T) => ReactNode;
  className?: string;
};

export function AdminDataTable<T extends { id: string }>({ columns, items, empty }: { columns: AdminTableColumn<T>[]; items: T[]; empty?: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[860px] divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>{columns.map((column) => <th key={column.key} className={`px-4 py-3 ${column.className ?? ""}`}>{column.label}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => <tr key={item.id} className="align-top">{columns.map((column) => <td key={column.key} className={`px-4 py-3 ${column.className ?? ""}`}>{column.render(item)}</td>)}</tr>)}
            {!items.length && <tr><td colSpan={columns.length} className="px-4 py-10 text-center text-slate-500">{empty ?? "Không có dữ liệu."}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminSearch({ defaultValue, placeholder = "Tìm kiếm" }: { defaultValue?: string; placeholder?: string }) {
  return <input name="search" defaultValue={defaultValue} placeholder={placeholder} className="min-w-0 rounded-xl border px-3 py-2 text-sm outline-none focus:border-slate-900" />;
}

export function AdminFilters({ children }: { children: ReactNode }) {
  return <form className="grid gap-3 rounded-2xl border bg-white p-4 shadow-sm sm:grid-cols-[1fr_auto_auto]">{children}<button className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Lọc</button></form>;
}

export function AdminStatusBadge({ value, tone = "slate" }: { value: string; tone?: "slate" | "green" | "red" | "amber" | "blue" }) {
  const tones = { slate: "bg-slate-100 text-slate-700", green: "bg-emerald-100 text-emerald-800", red: "bg-rose-100 text-rose-800", amber: "bg-amber-100 text-amber-800", blue: "bg-blue-100 text-blue-800" };
  return <span className={`rounded-full px-2 py-1 text-xs font-semibold ${tones[tone]}`}>{value}</span>;
}

export function AdminEmptyState({ title = "Không có dữ liệu", description }: { title?: string; description?: string }) {
  return <div className="rounded-2xl border bg-white p-8 text-center"><div className="font-semibold text-slate-900">{title}</div>{description ? <p className="mt-2 text-sm text-slate-500">{description}</p> : null}</div>;
}

export function AdminPagination({ page, totalPages, basePath, searchParams }: { page: number; totalPages: number; basePath: string; searchParams?: Record<string, string | undefined> }) {
  const makeHref = (nextPage: number) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams ?? {})) if (value) params.set(key, value);
    params.set("page", String(nextPage));
    return `${basePath}?${params.toString()}`;
  };
  return <div className="flex items-center justify-between rounded-2xl border bg-white p-4 text-sm"><span>Trang {page} / {Math.max(1, totalPages)}</span><div className="flex gap-2"><Link className="rounded-lg border px-3 py-2 aria-disabled:pointer-events-none aria-disabled:opacity-50" aria-disabled={page <= 1} href={makeHref(Math.max(1, page - 1))}>Trước</Link><Link className="rounded-lg border px-3 py-2 aria-disabled:pointer-events-none aria-disabled:opacity-50" aria-disabled={page >= totalPages} href={makeHref(Math.min(totalPages, page + 1))}>Sau</Link></div></div>;
}

export function AdminBulkActions({ children }: { children?: ReactNode }) {
  return <div className="rounded-2xl border border-dashed bg-white p-4 text-sm text-slate-600">{children ?? "Bulk actions sẽ chỉ bật khi có workflow phê duyệt rõ ràng."}</div>;
}
