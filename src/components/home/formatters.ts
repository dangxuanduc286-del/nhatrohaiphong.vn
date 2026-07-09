import { areaImages, fallbackImage } from "./constants";

export function formatCurrency(value: { toString(): string } | number) {
  const numeric = Number(value.toString());
  if (!Number.isFinite(numeric) || numeric <= 0) return "Giá đang cập nhật";
  return `${numeric.toLocaleString("vi-VN")}đ/tháng`;
}

export function formatCurrencyCompact(value: { toString(): string } | number) {
  const numeric = Number(value.toString());
  if (!Number.isFinite(numeric) || numeric <= 0) return "Giá đang cập nhật";
  return `Giá từ ${(numeric / 1_000_000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} triệu`;
}

export function formatArea(value: { toString(): string } | number) {
  return `${Number(value.toString()).toLocaleString("vi-VN")}m²`;
}

export function safeImage(url: string | null | undefined, index = 0) {
  if (!url) return areaImages[index % areaImages.length] ?? fallbackImage;
  return url;
}

export function getAreaImage(index: number) {
  return areaImages[index % areaImages.length] ?? fallbackImage;
}

export function formatPostedAt(date: Date) {
  const diffHours = Math.max(1, Math.floor((Date.now() - date.getTime()) / 3_600_000));
  if (diffHours < 24) return `Đăng ${diffHours} giờ trước`;
  return `Đăng ${Math.floor(diffHours / 24)} ngày trước`;
}

export function getLowestRoomPrice(rooms: { price?: { toString(): string } | number }[]) {
  const prices = rooms
    .map((room) => Number(room.price?.toString() ?? 0))
    .filter((price) => Number.isFinite(price) && price > 0);
  if (!prices.length) return "Giá đang cập nhật";
  return formatCurrencyCompact(Math.min(...prices));
}
