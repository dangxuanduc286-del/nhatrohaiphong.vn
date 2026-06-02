"use client";

import { useState } from "react";

const RADIUS_OPTIONS = [1, 3, 5, 10, 20] as const;

export function NearMeSearch() {
  const [radius, setRadius] = useState<(typeof RADIUS_OPTIONS)[number]>(5);
  const [status, setStatus] = useState("Chọn bán kính và cho phép trình duyệt lấy vị trí để tìm phòng gần nhất.");
  const [nearbyUrl, setNearbyUrl] = useState("/api/search/nearby?radius=5");

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setStatus("Trình duyệt không hỗ trợ navigator.geolocation.");
      return;
    }

    setStatus("Đang lấy vị trí hiện tại...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude.toFixed(7);
        const longitude = position.coords.longitude.toFixed(7);
        const url = `/api/search/nearby?latitude=${latitude}&longitude=${longitude}&radius=${radius}&limit=20`;
        setNearbyUrl(url);
        setStatus("Đã lấy vị trí. Mở kết quả để xem danh sách phòng gần nhất từ Search Radius hiện có.");
      },
      () => setStatus("Không thể lấy vị trí. Vui lòng kiểm tra quyền GPS hoặc thử lại."),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    );
  }

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Tìm phòng gần tôi</p>
      <h2 className="mt-2 text-2xl font-bold text-slate-950">Tìm theo vị trí hiện tại</h2>
      <p className="mt-2 text-sm text-slate-600">Tận dụng endpoint nearby/radius hiện có, không tạo query search mới.</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {RADIUS_OPTIONS.map((option) => (
          <button key={option} type="button" onClick={() => setRadius(option)} className={`rounded-full px-4 py-2 text-sm font-semibold ${radius === option ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-700 hover:bg-blue-100"}`}>
            {option}km
          </button>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={useCurrentLocation} className="rounded-full bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800">
          Lấy vị trí hiện tại
        </button>
        <a href={nearbyUrl} className="rounded-full border px-5 py-3 text-sm font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-700">
          Xem phòng gần nhất
        </a>
      </div>
      <p className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">{status}</p>
    </div>
  );
}
