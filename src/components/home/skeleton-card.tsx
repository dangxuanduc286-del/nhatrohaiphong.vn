import { Card, Skeleton } from "@/components/ui";

export function SkeletonCard({ type }: { type: "room" | "district" | "poi" }) {
  return (
    <Card className="overflow-hidden rounded-3xl border-slate-200">
      <Skeleton className={type === "poi" ? "hidden" : "h-44 rounded-none"} />
      <div className="space-y-3 p-5">
        <Skeleton className="h-5 w-2/3 rounded" />
        <Skeleton className="h-4 w-full rounded bg-slate-100" />
        <Skeleton className="h-4 w-4/5 rounded bg-slate-100" />
        <Skeleton className="h-10 w-32 rounded-2xl" />
      </div>
    </Card>
  );
}
