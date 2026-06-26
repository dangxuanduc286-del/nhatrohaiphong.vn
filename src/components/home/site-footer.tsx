import Link from "next/link";

import type { PostRoomCta } from "./types";

type FooterDistrict = {
  name: string;
  slug: string;
};

export function SiteFooter({
  postRoomCta,
  districts,
}: {
  postRoomCta: PostRoomCta;
  districts: FooterDistrict[];
}) {
  return (
    <footer className="border-t border-slate-200 bg-white px-4 py-12 pb-28 sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-4">
        <div>
          <div className="text-3xl font-extrabold text-[#2563EB]">Nhatrohaiphong.vn</div>
          <p className="mt-3 text-sm leading-6 text-[#64748B]">
            Marketplace tìm phòng trọ, căn hộ mini và phòng gần tiện ích tại Hải Phòng.
          </p>
        </div>
        <div>
          <h3 className="text-xl font-bold text-[#111827]">Tìm phòng</h3>
          <div className="mt-3 grid gap-2 text-sm text-[#64748B]">
            <Link href="/phong-tro-hai-phong">Phòng trọ Hải Phòng</Link>
            <Link href="/phong-tro-hai-phong">Tìm kiếm</Link>
            <Link href={postRoomCta.href}>Đăng phòng</Link>
          </div>
        </div>
        <div>
          <h3 className="text-xl font-bold text-[#111827]">Quận/Huyện</h3>
          <div className="mt-3 grid gap-2 text-sm text-[#64748B]">
            {districts.slice(0, 5).map((district) => (
              <Link key={district.slug} href={`/phong-tro-${district.slug}`}>
                {district.name}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-xl font-bold text-[#111827]">Thông tin</h3>
          <div className="mt-3 grid gap-2 text-sm text-[#64748B]">
            <Link href="/phong-tro-hai-phong">Khu vực nổi bật</Link>
            <Link href={postRoomCta.href}>Dành cho chủ trọ</Link>
            <span>Liên hệ</span>
            <span>Điều khoản</span>
            <span>Chính sách</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
