"use client";

import { useState } from "react";

import { trackEvent } from "@/components/analytics/event-tracker";

const RADIUS_OPTIONS = [1, 3, 5, 10, 20] as const;

export function NearMeSearch() {
  const [radius, setRadius] = useState<(typeof RADIUS_OPTIONS)[number]>(5);
  const [status, setStatus] = useState("Chọn bán kính và cho phép trình duyệt lấy vị trí để tìm phòng gần nhất.");
  const [nearbyUrl, setNearbyUrl] = useState("/api/search/nearby?radius=5");

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      trackEvent("client_error", { location: "near_me_search", category: "geolocation_unsupported" });
      setStatus("Trình duyệt không hỗ trợ navigator.geolocation.");
      return;
    }

    trackEvent("geo_near_me_location_request", { location: "near_me_search", radius });
    setStatus("Đang lấy vị trí hiện tại...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude.toFixed(7);
        const longitude = position.coords.longitude.toFixed(7);
        const url = `/api/search/nearby?latitude=${latitude}&longitude=${longitude}&radius=${radius}&limit=20`;
        setNearbyUrl(url);
        trackEvent("geo_near_me_location_success", { location: "near_me_search", radius });
        setStatus("Đã lấy vị trí. Mở kết quả để xem danh sách phòng gần nhất từ Search Radius hiện có.");
      },
      () => {
        trackEvent("client_error", { location: "near_me_search", category: "geolocation_denied_or_timeout", radius });
        setStatus("Không thể lấy vị trí. Vui lòng kiểm tra quyền GPS hoặc thử lại.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:shadow-lg">
      <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="bg-gradient-to-br from-blue-800 to-cyan-700 p-5 text-white sm:p-7">
          <p className="text-sm font-normal uppercase tracking-wide text-cyan-100">Tìm phòng gần tôi</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight">Tìm theo vị trí hiện tại</h2>
          <p className="mt-3 text-sm font-normal leading-6 text-blue-50">Dùng GPS hiện có để gợi ý phòng quanh bạn, phù hợp khi cần tìm gần trường, bệnh viện hoặc nơi làm việc.</p>
        </div>
        <div className="p-5 sm:p-7">
          <div className="flex flex-wrap gap-2">
            {RADIUS_OPTIONS.map((option) => (
              <button key={option} type="button" onClick={() => {
                  setRadius(option);
                  trackEvent("geo_near_me_radius_select", { location: "near_me_search", radius: option });
                }} className={`min-h-12 rounded-2xl px-4 text-sm font-semibold transition-all ${radius === option ? "bg-[#2563EB] text-white shadow-sm hover:shadow-lg" : "bg-slate-100 text-[#6B7280] hover:bg-blue-100"}`}>
                {option}km
              </button>
            ))}
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={useCurrentLocation} className="min-h-12 rounded-2xl bg-[#2563EB] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-lg">
              Lấy vị trí hiện tại
            </button>
            <a href={nearbyUrl} data-analytics-event="geo_near_me_result_click" data-analytics-location="near_me_search" data-analytics-label="Xem phòng gần nhất" className="inline-flex min-h-12 items-center justify-center rounded-2xl border bg-white px-5 py-3 text-sm font-semibold text-[#2563EB] transition-all hover:shadow-lg">
              Xem phòng gần nhất
            </a>
          </div>
          <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm font-normal leading-6 text-[#6B7280]">{status}</p>
        </div>
      </div>
    </div>
  );
}
