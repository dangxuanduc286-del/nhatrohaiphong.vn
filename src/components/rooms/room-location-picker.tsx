"use client";

import { useMemo, useState } from "react";

type RoomLocationPickerProps = {
  defaultLatitude?: number | null;
  defaultLongitude?: number | null;
  defaultAddress?: string;
};

const DEFAULT_CENTER = { latitude: 20.8449, longitude: 106.6881 };

function normalizeCoordinate(value: string, min: number, max: number) {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return "";
  return String(Math.min(max, Math.max(min, numberValue)));
}

export function RoomLocationPicker({ defaultLatitude, defaultLongitude, defaultAddress }: RoomLocationPickerProps) {
  const [latitude, setLatitude] = useState(defaultLatitude?.toString() ?? "");
  const [longitude, setLongitude] = useState(defaultLongitude?.toString() ?? "");
  const [address, setAddress] = useState(defaultAddress ?? "");
  const [status, setStatus] = useState("Chưa lấy vị trí.");

  const coordinates = useMemo(() => {
    const lat = Number(latitude);
    const lng = Number(longitude);
    return Number.isFinite(lat) && Number.isFinite(lng) ? { latitude: lat, longitude: lng } : DEFAULT_CENTER;
  }, [latitude, longitude]);

  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${coordinates.longitude - 0.01},${coordinates.latitude - 0.01},${coordinates.longitude + 0.01},${coordinates.latitude + 0.01}&layer=mapnik&marker=${coordinates.latitude},${coordinates.longitude}`;

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setStatus("Trình duyệt không hỗ trợ navigator.geolocation.");
      return;
    }

    setStatus("Đang lấy vị trí hiện tại...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(7));
        setLongitude(position.coords.longitude.toFixed(7));
        setStatus("Đã lấy vị trí. Có thể kéo/chỉnh marker bằng cách nhập lại tọa độ sau khi chọn trên bản đồ.");
      },
      () => setStatus("Không thể lấy vị trí. Vui lòng kiểm tra quyền truy cập GPS hoặc nhập thủ công."),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    );
  }

  function searchAddress() {
    const encodedAddress = encodeURIComponent(address.trim());
    if (!encodedAddress) {
      setStatus("Vui lòng nhập địa chỉ trước khi tìm kiếm.");
      return;
    }

    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, "_blank", "noopener,noreferrer");
    setStatus("Đã mở Google Maps để tìm địa chỉ. Sao chép tọa độ vị trí phù hợp vào form nếu cần tinh chỉnh.");
  }

  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">📍 Vị trí phòng</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">Gắn vị trí chính xác trên bản đồ</h2>
          <p className="mt-2 text-sm text-slate-600">Dữ liệu lưu vào trường latitude/longitude hiện có của Room, không thay đổi schema.</p>
        </div>
        <button type="button" onClick={useCurrentLocation} className="rounded-full bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">
          Lấy vị trí hiện tại
        </button>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="overflow-hidden rounded-2xl border bg-slate-100">
          <iframe title="Bản đồ chọn vị trí phòng" src={mapUrl} className="h-72 w-full border-0 sm:h-96" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        </div>
        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            Địa chỉ
            <textarea name="address" value={address} onChange={(event) => setAddress(event.target.value)} rows={3} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" placeholder="Nhập địa chỉ phòng" />
          </label>
          <button type="button" onClick={searchAddress} className="w-full rounded-xl border px-4 py-2 text-sm font-semibold hover:border-blue-300 hover:text-blue-700">
            Tìm kiếm địa chỉ
          </button>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <label className="block text-sm font-medium text-slate-700">
              Latitude
              <input name="latitude" value={latitude} onChange={(event) => setLatitude(normalizeCoordinate(event.target.value, -90, 90))} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" inputMode="decimal" />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Longitude
              <input name="longitude" value={longitude} onChange={(event) => setLongitude(normalizeCoordinate(event.target.value, -180, 180))} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" inputMode="decimal" />
            </label>
          </div>
          <p className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600">{status}</p>
        </div>
      </div>
    </section>
  );
}
