export function SkeletonCard({ type }: { type: "room" | "district" | "poi" }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className={type === "poi" ? "hidden" : "h-44 animate-pulse bg-slate-200"} />
      <div className="space-y-3 p-5">
        <div className="h-5 w-2/3 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
        <div className="h-4 w-4/5 animate-pulse rounded bg-slate-100" />
        <div className="h-10 w-32 animate-pulse rounded-2xl bg-slate-200" />
      </div>
    </div>
  );
}
