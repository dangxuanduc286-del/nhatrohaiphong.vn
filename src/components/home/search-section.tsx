import Link from "next/link";

import { Button, Input } from "@/components/ui";

import { quickFilters } from "./constants";

export function SearchSection() {
  return (
    <>
      <form
        action="/api/search"
        data-analytics-event="search_submit"
        data-analytics-location="home_hero_search"
        className="mt-6 rounded-3xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-200/70"
      >
        <div className="grid gap-2 lg:grid-cols-[1.2fr_0.85fr_0.85fr_auto]">
          <label className="flex min-h-16 items-center rounded-2xl bg-slate-50 px-4">
            <span className="min-w-20 text-sm font-bold text-[#475569]">Khu vực</span>
            <Input
              name="district"
              placeholder="Hải An, Lê Chân, Kiến An..."
              className="w-full bg-transparent text-base text-[#111827] outline-none placeholder:text-[#94A3B8]"
            />
          </label>
          <label className="flex min-h-16 items-center rounded-2xl bg-slate-50 px-4">
            <span className="min-w-16 text-sm font-bold text-[#475569]">Giá</span>
            <Input
              name="maxPrice"
              inputMode="numeric"
              placeholder="Dưới 3 triệu"
              className="w-full bg-transparent text-base text-[#111827] outline-none placeholder:text-[#94A3B8]"
            />
          </label>
          <label className="flex min-h-16 items-center rounded-2xl bg-slate-50 px-4">
            <span className="min-w-20 text-sm font-bold text-[#475569]">Diện tích</span>
            <Input
              name="minArea"
              inputMode="numeric"
              placeholder="Từ 20m²"
              className="w-full bg-transparent text-base text-[#111827] outline-none placeholder:text-[#94A3B8]"
            />
          </label>
          <Button
            type="submit"
            className="min-h-16 rounded-2xl bg-[#EA580C] px-8 text-base font-extrabold text-white shadow-lg shadow-orange-200 transition-all hover:-translate-y-0.5 hover:shadow-xl"
          >
            Tìm phòng
          </Button>
        </div>
      </form>

      <div className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
        {quickFilters.map((filter) => (
          <Link
            key={filter}
            href="/phong-tro-hai-phong"
            data-analytics-event="search_quick_filter_click"
            data-analytics-location="home_quick_filters"
            data-analytics-label={filter}
            className="shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-[#374151] shadow-sm hover:border-[#2563EB] hover:text-[#2563EB]"
          >
            {filter}
          </Link>
        ))}
      </div>
    </>
  );
}
