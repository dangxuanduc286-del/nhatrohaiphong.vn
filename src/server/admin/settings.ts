import { revalidatePath } from "next/cache";

import type { SystemSettingCategory } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { requireAdminPage } from "@/server/admin/utils";

type SettingDefinition = {
  key: string;
  label: string;
  category: SystemSettingCategory;
  defaultValue: string;
  description: string;
  input: "text" | "email" | "tel" | "textarea" | "url" | "boolean";
};

export const SYSTEM_SETTING_DEFINITIONS = [
  {
    key: "general.siteName",
    label: "Site Name",
    category: "GENERAL",
    defaultValue: "NhaTroHaiPhong.vn",
    description: "Tên website hiển thị trong admin và nội dung hệ thống.",
    input: "text",
  },
  {
    key: "general.siteDescription",
    label: "Site Description",
    category: "GENERAL",
    defaultValue: "Nền tảng tìm phòng trọ Hải Phòng",
    description: "Mô tả ngắn về hệ thống.",
    input: "textarea",
  },
  {
    key: "general.contactEmail",
    label: "Contact Email",
    category: "GENERAL",
    defaultValue: "support@nhatrohaiphong.vn",
    description: "Email liên hệ chính thức.",
    input: "email",
  },
  {
    key: "general.contactPhone",
    label: "Contact Phone",
    category: "GENERAL",
    defaultValue: "",
    description: "Số điện thoại liên hệ chính thức.",
    input: "tel",
  },
  {
    key: "seo.metaTitle",
    label: "Meta Title",
    category: "SEO",
    defaultValue: "Nhà trọ Hải Phòng",
    description: "Meta title mặc định khi trang chưa có SEO riêng.",
    input: "text",
  },
  {
    key: "seo.metaDescription",
    label: "Meta Description",
    category: "SEO",
    defaultValue: "Tìm phòng trọ, nhà trọ, căn hộ mini tại Hải Phòng.",
    description: "Meta description mặc định.",
    input: "textarea",
  },
  {
    key: "seo.defaultOgImage",
    label: "Default OG Image",
    category: "SEO",
    defaultValue: "/room-fallback.svg",
    description: "Ảnh Open Graph mặc định.",
    input: "url",
  },
  {
    key: "landlord.autoApprove",
    label: "Auto Approve Landlord",
    category: "LANDLORD",
    defaultValue: "false",
    description: "Tự động duyệt yêu cầu nâng cấp chủ trọ.",
    input: "boolean",
  },
  {
    key: "landlord.approvalMessage",
    label: "Approval Message",
    category: "LANDLORD",
    defaultValue: "Yêu cầu nâng cấp chủ trọ đã được phê duyệt.",
    description: "Thông báo khi duyệt chủ trọ.",
    input: "textarea",
  },
  {
    key: "landlord.rejectionMessage",
    label: "Rejection Message",
    category: "LANDLORD",
    defaultValue: "Yêu cầu nâng cấp chủ trọ chưa được phê duyệt.",
    description: "Thông báo mặc định khi từ chối chủ trọ.",
    input: "textarea",
  },
  {
    key: "analytics.enabled",
    label: "Analytics Enabled",
    category: "ANALYTICS",
    defaultValue: "true",
    description: "Bật/tắt hiển thị analytics trong admin.",
    input: "boolean",
  },
  {
    key: "analytics.trackingEnabled",
    label: "Tracking Enabled",
    category: "ANALYTICS",
    defaultValue: "true",
    description: "Bật/tắt cấu hình tracking phía hệ thống.",
    input: "boolean",
  },
] as const satisfies readonly SettingDefinition[];

export type SystemSettingView = SettingDefinition & {
  value: string;
  persisted: boolean;
  updatedAt: Date | null;
  updatedBy: string | null;
  updaterName: string | null;
};

export function getSettingCategories() {
  return ["GENERAL", "SEO", "LANDLORD", "ANALYTICS"] as const;
}

export async function getSystemSettings(searchParams: URLSearchParams) {
  const search = searchParams.get("search")?.trim().toLowerCase() ?? "";
  const category = searchParams.get("category")?.trim() as SystemSettingCategory | "";
  const rows = await db.systemSetting.findMany({
    include: { updater: { select: { fullName: true, email: true } } },
    orderBy: [{ category: "asc" }, { key: "asc" }],
  });
  const byKey = new Map(rows.map((row) => [row.key, row]));
  const items = SYSTEM_SETTING_DEFINITIONS.map<SystemSettingView>((definition) => {
    const row = byKey.get(definition.key);
    return {
      ...definition,
      value: row?.value ?? definition.defaultValue,
      persisted: Boolean(row),
      updatedAt: row?.updatedAt ?? null,
      updatedBy: row?.updatedBy ?? null,
      updaterName: row?.updater?.fullName ?? row?.updater?.email ?? null,
    };
  }).filter((item) => {
    const matchesCategory = category ? item.category === category : true;
    const haystack = `${item.key} ${item.label} ${item.description} ${item.value}`.toLowerCase();
    const matchesSearch = search ? haystack.includes(search) : true;
    return matchesCategory && matchesSearch;
  });
  return { items, search, category };
}

function normalizeSettingValue(definition: SettingDefinition, value: string) {
  const trimmed = value.trim();
  if (definition.input === "boolean") return trimmed === "true" ? "true" : "false";
  if (definition.input === "email" && trimmed && !/^\S+@\S+\.\S+$/.test(trimmed))
    throw new AppError("Email cấu hình không hợp lệ", 400, "INVALID_SETTING_EMAIL");
  if (
    definition.input === "url" &&
    trimmed &&
    !trimmed.startsWith("/") &&
    !/^https?:\/\//.test(trimmed)
  )
    throw new AppError("URL cấu hình không hợp lệ", 400, "INVALID_SETTING_URL");
  return trimmed;
}

export async function saveSystemSettingAction(formData: FormData) {
  "use server";

  const auth = await requireAdminPage("settings.manage");
  const key = String(formData.get("key") ?? "");
  const rawValue = String(formData.get("value") ?? "");
  const definition = SYSTEM_SETTING_DEFINITIONS.find((item) => item.key === key);
  if (!definition) throw new AppError("Setting không được hỗ trợ", 400, "UNSUPPORTED_SETTING");

  const value = normalizeSettingValue(definition, rawValue);
  const existing = await db.systemSetting.findUnique({ where: { key } });
  const saved = await db.systemSetting.upsert({
    where: { key },
    update: {
      value,
      description: definition.description,
      category: definition.category,
      updatedBy: auth.payload.userId,
    },
    create: {
      key,
      value,
      description: definition.description,
      category: definition.category,
      updatedBy: auth.payload.userId,
    },
  });

  await db.auditLog.create({
    data: {
      userId: auth.payload.userId,
      action:
        definition.category === "ANALYTICS"
          ? "ADMIN_ANALYTICS_CONFIGURATION_UPDATE"
          : "ADMIN_SYSTEM_SETTING_UPDATE",
      entityType: definition.category === "ANALYTICS" ? "AnalyticsConfiguration" : "SystemSetting",
      entityId: saved.id,
      oldValues: existing
        ? { key: existing.key, value: existing.value, category: existing.category }
        : undefined,
      newValues: { key: saved.key, value: saved.value, category: saved.category },
    },
  });

  revalidatePath("/admin/settings");
  revalidatePath("/admin/analytics");
}
