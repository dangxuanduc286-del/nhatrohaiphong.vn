import type { ReactNode } from "react";

import { AccountShell } from "@/components/layouts/account-shell";
import { requireLandlordPage } from "@/server/landlord/utils";

const landlordNav = [
  { label: "Dashboard", href: "/landlord", icon: "▦", exact: true },
  { label: "Phòng của tôi", href: "/landlord/rooms", icon: "▤" },
  { label: "Đăng phòng", href: "/landlord/rooms/new", icon: "+" },
  { label: "Hồ sơ", href: "/landlord/profile", icon: "◉" },
  { label: "Đổi mật khẩu", href: "/landlord/change-password", icon: "⌁" },
  { label: "Trang chủ", href: "/", icon: "⌂", exact: true },
] as const;

export default async function LandlordLayout({ children }: { children: ReactNode }) {
  const auth = await requireLandlordPage();

  return (
    <AccountShell
      title="Landlord Dashboard"
      eyebrow="Nhatrohaiphong.vn"
      userName={auth.user?.fullName ?? auth.user?.email ?? "Landlord"}
      role={auth.payload.role}
      items={landlordNav}
    >
      {children}
    </AccountShell>
  );
}
