"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { RoomLocationPicker } from "@/components/rooms/room-location-picker";

type Option = {
  id: string;
  label: string;
};

type RoomFormValues = {
  id?: string;
  title?: string;
  description?: string | null;
  price?: number | string;
  deposit?: number | string | null;
  area?: number | string;
  floor?: number | string | null;
  capacity?: number | string;
  electricPrice?: number | string | null;
  waterPrice?: number | string | null;
  internetFee?: number | string | null;
  serviceFee?: number | string | null;
  parkingFee?: number | string | null;
  address?: string;
  districtId?: string;
  wardId?: string;
  buildingId?: string;
  availableFrom?: string | Date | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
};

type LandlordRoomFormProps = {
  mode: "create" | "edit";
  room?: RoomFormValues;
  districts: Option[];
  wards: Option[];
  buildings: Option[];
};

function formatDateInput(value?: string | Date | null) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function optionalString(value: unknown) {
  if (value === null || typeof value === "undefined") return "";
  return String(value);
}

export function LandlordRoomForm({ mode, room, districts, wards, buildings }: LandlordRoomFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitRoom(formData: FormData) {
    setError(null);
    setIsSubmitting(true);

    try {
      const endpoint = mode === "create" ? "/api/landlord/rooms" : `/api/landlord/rooms/${room?.id}`;
      const response = await fetch(endpoint, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(Object.fromEntries(formData.entries())),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error?.message ?? "Không thể lưu phòng.");
      }

      router.push("/landlord");
      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Không thể lưu phòng.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form action={submitRoom} className="space-y-6">
      <section className="grid gap-4 rounded-2xl border bg-white p-5 shadow-sm md:grid-cols-2">
        <label className="block text-sm font-medium text-slate-700 md:col-span-2">
          Tiêu đề phòng
          <input name="title" defaultValue={optionalString(room?.title)} required minLength={5} maxLength={180} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" />
        </label>

        <label className="block text-sm font-medium text-slate-700 md:col-span-2">
          Mô tả
          <textarea name="description" defaultValue={optionalString(room?.description)} rows={4} maxLength={2000} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Giá thuê
          <input name="price" defaultValue={optionalString(room?.price)} type="number" min="1" step="1000" required className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Tiền cọc
          <input name="deposit" defaultValue={optionalString(room?.deposit)} type="number" min="0" step="1000" className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Diện tích
          <input name="area" defaultValue={optionalString(room?.area)} type="number" min="1" step="0.1" required className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Sức chứa
          <input name="capacity" defaultValue={optionalString(room?.capacity ?? 1)} type="number" min="1" max="20" required className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Tầng
          <input name="floor" defaultValue={optionalString(room?.floor)} type="number" min="0" step="1" className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Ngày có thể vào ở
          <input name="availableFrom" defaultValue={formatDateInput(room?.availableFrom)} type="date" className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" />
        </label>
      </section>

      <section className="grid gap-4 rounded-2xl border bg-white p-5 shadow-sm md:grid-cols-3">
        <label className="block text-sm font-medium text-slate-700">
          Quận/Huyện
          <select name="districtId" defaultValue={optionalString(room?.districtId)} required className="mt-1 w-full rounded-xl border px-3 py-2 text-sm">
            <option value="">Chọn quận/huyện</option>
            {districts.map((district) => <option key={district.id} value={district.id}>{district.label}</option>)}
          </select>
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Phường/Xã
          <select name="wardId" defaultValue={optionalString(room?.wardId)} required className="mt-1 w-full rounded-xl border px-3 py-2 text-sm">
            <option value="">Chọn phường/xã</option>
            {wards.map((ward) => <option key={ward.id} value={ward.id}>{ward.label}</option>)}
          </select>
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Nhà/Tòa nhà
          <select name="buildingId" defaultValue={optionalString(room?.buildingId)} required className="mt-1 w-full rounded-xl border px-3 py-2 text-sm">
            <option value="">Chọn nhà/tòa nhà</option>
            {buildings.map((building) => <option key={building.id} value={building.id}>{building.label}</option>)}
          </select>
        </label>
      </section>

      <section className="grid gap-4 rounded-2xl border bg-white p-5 shadow-sm md:grid-cols-3">
        <label className="block text-sm font-medium text-slate-700">
          Giá điện
          <input name="electricPrice" defaultValue={optionalString(room?.electricPrice)} type="number" min="0" step="100" className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Giá nước
          <input name="waterPrice" defaultValue={optionalString(room?.waterPrice)} type="number" min="0" step="100" className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Internet
          <input name="internetFee" defaultValue={optionalString(room?.internetFee)} type="number" min="0" step="1000" className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Phí dịch vụ
          <input name="serviceFee" defaultValue={optionalString(room?.serviceFee)} type="number" min="0" step="1000" className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Phí gửi xe
          <input name="parkingFee" defaultValue={optionalString(room?.parkingFee)} type="number" min="0" step="1000" className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" />
        </label>
      </section>

      <RoomLocationPicker defaultAddress={room?.address} defaultLatitude={room?.latitude === null || typeof room?.latitude === "undefined" ? null : Number(room.latitude)} defaultLongitude={room?.longitude === null || typeof room?.longitude === "undefined" ? null : Number(room.longitude)} />

      {error ? <p className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p> : null}

      <div className="flex flex-wrap justify-end gap-3">
        <button type="button" onClick={() => router.push("/landlord")} className="rounded-xl border px-5 py-2 text-sm font-semibold hover:border-blue-300 hover:text-blue-700">Hủy</button>
        <button disabled={isSubmitting} className="rounded-xl bg-blue-700 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60">
          {isSubmitting ? "Đang lưu..." : mode === "create" ? "Tạo phòng" : "Lưu thay đổi"}
        </button>
      </div>
    </form>
  );
}
