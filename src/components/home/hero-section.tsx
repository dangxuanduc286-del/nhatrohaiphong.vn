import Image from "next/image";
import Link from "next/link";

import { Container, Section } from "@/components/ui";

import { heroImages, heroTrustItems } from "./constants";
import type { PostRoomCta } from "./types";
import { SearchSection } from "./search-section";

export function HeroSection({ postRoomCta }: { postRoomCta: PostRoomCta }) {
  return (
    <Section spacing="md" className="relative overflow-hidden bg-white px-4 sm:px-6 lg:px-8">
      <Container flush className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
        <div>
          <div className="inline-flex rounded-2xl bg-blue-50 px-4 py-2 text-xs font-bold uppercase tracking-wide text-[#2563EB] sm:text-sm">
            Marketplace phòng trọ đã xác minh
          </div>
          <h1 className="mt-5 max-w-[760px] text-balance text-[34px] font-extrabold leading-[1.08] tracking-tight text-[#111827] sm:text-[54px] lg:text-[64px]">
            Tìm phòng trọ <span className="whitespace-nowrap text-[#2563EB]">Hải Phòng</span>
            <span className="block text-[24px] font-bold leading-[1.18] text-[#111827] sm:text-[38px] lg:text-[42px]">
              Gần nơi làm việc, trường học và khu công nghiệp
            </span>
          </h1>
          <p className="mt-4 max-w-[620px] text-balance text-base leading-7 text-[#4B5563] sm:text-lg">
            Xem giá thuê, diện tích, vị trí và liên hệ chủ trọ trực tiếp. Bắt đầu bằng khu vực bạn
            muốn ở để rút ngắn thời gian tìm phòng.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/phong-tro-hai-phong"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#2563EB] px-5 text-sm font-extrabold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              Xem phòng đang trống
            </Link>
            <Link
              href={postRoomCta.href}
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-[#EA580C] bg-white px-5 text-sm font-extrabold text-[#EA580C] shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              {postRoomCta.label}
            </Link>
          </div>

          <SearchSection />

          <div className="mt-4 grid grid-cols-2 gap-2 text-sm font-semibold text-[#374151] sm:grid-cols-4">
            {heroTrustItems.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1.5 rounded-2xl bg-slate-50 px-3 py-2"
              >
                <span className="text-[#16A34A]">✓</span>
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-5 grid-rows-5 gap-3 sm:h-[520px]">
          <div className="relative col-span-5 row-span-3 min-h-72 overflow-hidden rounded-3xl bg-slate-200 shadow-sm sm:col-span-3 sm:row-span-5">
            <Image
              src={heroImages[0]}
              alt="Phòng trọ thực tế tại Hải Phòng"
              fill
              priority
              quality={85}
              sizes="(min-width: 1024px) 42vw, 100vw"
              className="object-cover"
            />
            <div className="absolute bottom-4 left-4 right-4 rounded-3xl bg-white/95 p-5 shadow-sm backdrop-blur">
              <p className="text-sm font-bold uppercase tracking-wide text-[#2563EB]">
                Phòng nổi bật
              </p>
              <p className="mt-2 text-2xl font-extrabold text-[#EA580C]">2.800.000đ/tháng</p>
              <p className="mt-1 text-base font-bold text-[#111827]">
                25m² · Hải An · gần KCN Đình Vũ
              </p>
            </div>
          </div>
          <div className="relative col-span-3 row-span-2 min-h-40 overflow-hidden rounded-3xl bg-slate-200 shadow-sm sm:col-span-2 sm:row-span-3">
            <Image
              src={heroImages[1]}
              alt="Căn hộ mini Hải Phòng"
              fill
              quality={75}
              sizes="(min-width: 1024px) 20vw, 60vw"
              className="object-cover"
            />
          </div>
          <div className="relative col-span-2 row-span-2 min-h-40 overflow-hidden rounded-3xl bg-slate-200 shadow-sm sm:col-span-2 sm:row-span-2">
            <Image
              src={heroImages[2]}
              alt="Nội thất phòng trọ"
              fill
              quality={75}
              sizes="(min-width: 1024px) 20vw, 40vw"
              className="object-cover"
            />
          </div>
        </div>
      </Container>
    </Section>
  );
}
