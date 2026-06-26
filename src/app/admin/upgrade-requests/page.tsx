import { Input, Select } from "@/components/ui";
import { AdminActionButton } from "@/components/ui/admin-action-button";
import {
  AdminDataTable,
  AdminEmptyState,
  AdminFilters,
  AdminPagination,
  type AdminTableColumn,
} from "@/components/ui/admin-data-table";
import type { LandlordApprovalStatus } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { getPagination, requireAdminPage } from "@/server/admin/utils";
import { reviewLandlordApprovalRequestAction } from "@/server/admin/actions";

function formatDate(value: Date | null) {
  if (!value) return "Chưa có";
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(
    value,
  );
}

function statusTone(status: LandlordApprovalStatus) {
  if (status === "APPROVED") return "bg-emerald-50 text-emerald-700";
  if (status === "REJECTED") return "bg-red-50 text-red-700";
  return "bg-amber-50 text-amber-700";
}

type UpgradeRequestData = Awaited<ReturnType<typeof getUpgradeRequests>>;
type UpgradeRequestRow = UpgradeRequestData["items"][number];

async function getUpgradeRequests(searchParams: URLSearchParams) {
  const { page, pageSize, skip, take } = getPagination(searchParams);
  const status = searchParams.get("status") ?? "PENDING";
  const normalizedStatus: LandlordApprovalStatus | undefined =
    status === "PENDING" || status === "APPROVED" || status === "REJECTED" ? status : undefined;
  const where = normalizedStatus ? { status: normalizedStatus } : {};

  const [items, total, pending, approved, rejected] = await Promise.all([
    db.landlordApprovalRequest.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        fullName: true,
        phone: true,
        note: true,
        rejectionReason: true,
        createdAt: true,
        reviewedAt: true,
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            phone: true,
            roles: { include: { role: true } },
          },
        },
        reviewer: { select: { fullName: true, email: true } },
      },
    }),
    db.landlordApprovalRequest.count({ where }),
    db.landlordApprovalRequest.count({ where: { status: "PENDING" } }),
    db.landlordApprovalRequest.count({ where: { status: "APPROVED" } }),
    db.landlordApprovalRequest.count({ where: { status: "REJECTED" } }),
  ]);

  return {
    items,
    total,
    pending,
    approved,
    rejected,
    page,
    totalPages: Math.ceil(total / pageSize),
    status,
  };
}

export default async function AdminUpgradeRequestsPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string; page?: string }>;
}) {
  await requireAdminPage("user.manage");
  const params = await searchParams;
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.page) query.set("page", params.page);
  const data = await getUpgradeRequests(query);

  const columns: AdminTableColumn<UpgradeRequestRow>[] = [
    {
      key: "request",
      label: "Yêu cầu",
      render: (item) => (
        <div>
          <div className="font-medium text-slate-900">{item.fullName}</div>
          <div className="text-xs text-slate-500">{item.phone}</div>
          <div className="mt-1 text-xs text-slate-500">{item.note ?? "Không có ghi chú"}</div>
        </div>
      ),
    },
    {
      key: "user",
      label: "User",
      render: (item) => (
        <div>
          <div className="font-medium text-slate-900">{item.user.fullName}</div>
          <div className="text-xs text-slate-500">{item.user.email}</div>
          <div className="mt-1 flex flex-wrap gap-1">
            {item.user.roles.map((role) => (
              <span key={role.roleId} className="rounded-full bg-slate-100 px-2 py-1 text-xs">
                {role.role.slug}
              </span>
            ))}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Trạng thái",
      render: (item) => (
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone(item.status)}`}>
          {item.status}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Ngày gửi",
      render: (item) => <span className="text-slate-600">{formatDate(item.createdAt)}</span>,
    },
    {
      key: "review",
      label: "Review",
      render: (item) => (
        <div className="text-xs text-slate-500">
          <div>{formatDate(item.reviewedAt)}</div>
          <div>{item.reviewer?.fullName ?? item.reviewer?.email ?? "Chưa duyệt"}</div>
          {item.rejectionReason ? (
            <div className="mt-1 font-medium text-red-700">{item.rejectionReason}</div>
          ) : null}
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (item) =>
        item.status === "PENDING" ? (
          <div className="flex flex-col gap-2">
            <form action={reviewLandlordApprovalRequestAction} className="flex flex-wrap gap-2">
              <Input type="hidden" name="id" value={item.id} />
              <Input type="hidden" name="action" value="APPROVE" />
              <AdminActionButton
                label="Duyệt"
                message={`Duyệt ${item.user.email} thành LANDLORD?`}
              />
            </form>
            <form action={reviewLandlordApprovalRequestAction} className="flex flex-col gap-2">
              <Input type="hidden" name="id" value={item.id} />
              <Input type="hidden" name="action" value="REJECT" />
              <Input
                name="rejectionReason"
                required
                minLength={2}
                placeholder="Lý do từ chối"
                className="rounded-lg border px-2 py-1 text-xs"
              />
              <AdminActionButton
                label="Từ chối"
                message={`Từ chối yêu cầu của ${item.user.email}?`}
              />
            </form>
          </div>
        ) : (
          <span className="text-xs text-slate-500">Đã xử lý</span>
        ),
    },
  ];

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
          Landlord Approval
        </p>
        <h2 className="text-2xl font-bold">Duyệt yêu cầu Chủ trọ</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          ADMIN duyệt USER thành LANDLORD. Public register không tạo LANDLORD.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">Pending</p>
          <strong className="text-2xl text-amber-700">
            {data.pending.toLocaleString("vi-VN")}
          </strong>
        </div>
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">Approved</p>
          <strong className="text-2xl text-emerald-700">
            {data.approved.toLocaleString("vi-VN")}
          </strong>
        </div>
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">Rejected</p>
          <strong className="text-2xl text-red-700">{data.rejected.toLocaleString("vi-VN")}</strong>
        </div>
      </div>
      <AdminFilters>
        <Select
          name="status"
          defaultValue={data.status}
          className="rounded-xl border px-3 py-2 text-sm"
        >
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="">Tất cả</option>
        </Select>
      </AdminFilters>
      <AdminDataTable
        columns={columns}
        items={data.items}
        empty={<AdminEmptyState title="Không có yêu cầu" />}
      />
      <AdminPagination
        page={data.page}
        totalPages={data.totalPages}
        basePath="/admin/upgrade-requests"
        searchParams={{ status: data.status }}
      />
    </section>
  );
}
