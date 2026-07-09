import type { ReactNode } from "react";

import { AccountShell } from "@/components/layouts/account-shell";
import { getRefreshCookie } from "@/server/auth/cookies";
import { requireRoleValue } from "@/server/auth/rbac";
import { getAuthFromRefreshToken } from "@/server/auth/service";
import { redirect } from "next/navigation";

const userAccountNav = [
  { label: "Tổng quan", href: "/account", icon: "▦", exact: true },
  { label: "Hồ sơ cá nhân", href: "/account/profile", icon: "◉" },
  { label: "Yêu thích", href: "/account/favorites", icon: "♡" },
  { label: "Lịch sử xem", href: "/account/history", icon: "◷" },
  { label: "Nâng cấp Chủ trọ", href: "/account/upgrade-landlord", icon: "⇧" },
  { label: "Đổi mật khẩu", href: "/account/change-password", icon: "⌁" },
  { label: "Trang chủ", href: "/", icon: "⌂", exact: true },
] as const;

export default async function AccountLayout({ children }: { children: ReactNode }) {
  const refreshToken = await getRefreshCookie();
  if (!refreshToken) redirect("/login?next=/account");

  const auth = await getAuthFromRefreshToken(refreshToken).catch(() => null);
  if (!auth) redirect("/login?next=/account");
  if (auth.payload.role === "LANDLORD") redirect("/landlord");
  if (auth.payload.role === "ADMIN" || auth.payload.role === "SUPER_ADMIN") redirect("/admin");
  requireRoleValue(auth.payload.role, ["USER"]);

  return (
    <AccountShell
      title="Account Center"
      eyebrow="Nhatrohaiphong.vn"
      userName={auth.user?.fullName ?? auth.user?.email ?? "Người dùng"}
      role={auth.payload.role}
      items={userAccountNav}
    >
      {children}
    </AccountShell>
  );
}
