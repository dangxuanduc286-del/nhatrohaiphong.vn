export function AdminBreadcrumb({ items = ["Admin"] }: { items?: string[] }) {
  return <div className="text-sm text-slate-500">{items.join(" / ")}</div>;
}
