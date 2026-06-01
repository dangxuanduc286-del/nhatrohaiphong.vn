import type { SystemRole } from "@/server/auth/constants";

export function AdminHeader({ userName, role }: { userName: string; role: SystemRole }) {
  return (
    <header className="sticky top-0 z-10 border-b bg-white/90 px-4 py-3 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-slate-500">Nhatrohaiphong.vn</p>
          <h1 className="truncate text-lg font-semibold">Admin Core</h1>
        </div>
        <div className="flex min-w-0 items-center gap-2">
          <div className="hidden max-w-40 truncate text-right text-xs text-slate-500 sm:block">{userName}</div>
          <div className="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">{role}</div>
        </div>
      </div>
    </header>
  );
}
