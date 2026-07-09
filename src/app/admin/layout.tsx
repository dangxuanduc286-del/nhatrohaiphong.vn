import type { ReactNode } from "react";

import { AdminBreadcrumb } from "@/components/layouts/admin-breadcrumb";
import { AdminHeader } from "@/components/layouts/admin-header";
import { AdminMobileNav, AdminSidebar } from "@/components/layouts/admin-sidebar";
import { db } from "@/lib/db";
import { requireAdminAccessPage } from "@/server/admin/utils";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const auth = await requireAdminAccessPage();
  const permissions = await db.rolePermission.findMany({
    where: {
      role: { slug: auth.payload.role.toLowerCase(), deletedAt: null },
      permission: { deletedAt: null },
    },
    select: { permission: { select: { slug: true } } },
  });
  const permissionSlugs = permissions.map((item) => item.permission.slug);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="flex min-h-screen">
        <AdminSidebar permissions={permissionSlugs} />
        <div className="min-w-0 flex-1">
          <AdminHeader userName={auth.user?.fullName ?? "Admin"} role={auth.payload.role} />
          <AdminMobileNav permissions={permissionSlugs} />
          <main className="p-4 sm:p-6 lg:p-8">
            <AdminBreadcrumb />
            <div className="mt-4">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
