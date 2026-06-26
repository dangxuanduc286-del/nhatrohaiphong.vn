export const fallbackImage = "/room-fallback.svg";

export const areaImages = [
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2e?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1560449752-7d5c2825f11d?auto=format&fit=crop&w=900&q=80",
];

export const heroImages = [areaImages[0], areaImages[2], areaImages[3]];

export const heroTrustItems = [
  "Chủ trọ xác minh",
  "Cập nhật mỗi ngày",
  "Chỉ đường tới phòng",
  "Tìm bằng GPS",
];

export const quickFilters = [
  "Dưới 2 triệu",
  "Dưới 3 triệu",
  "Gần KCN",
  "Gần Đại học",
  "Có điều hòa",
  "Có gác lửng",
  "Có WC riêng",
];

export const conversionTrustItems = [
  "Không phí tìm phòng",
  "Xem vị trí trước khi gọi",
  "Lọc nhanh theo khu vực",
  "Chủ trọ đăng tin miễn phí",
];

export const districtAmenities = [
  "KCN Đình Vũ",
  "Vincom",
  "Đại học Hải Phòng",
  "Bệnh viện",
  "Chợ dân sinh",
];

export const poiLabels: Record<string, { label: string; icon: string; tone: string }> = {
  INDUSTRIAL_PARK: { label: "Khu công nghiệp", icon: "🏭", tone: "bg-orange-50 text-[#EA580C]" },
  UNIVERSITY: { label: "Trường học", icon: "🎓", tone: "bg-blue-50 text-[#2563EB]" },
  HOSPITAL: { label: "Bệnh viện", icon: "🏥", tone: "bg-emerald-50 text-[#059669]" },
  SHOPPING_MALL: { label: "Tiện ích", icon: "🛍️", tone: "bg-slate-100 text-[#475569]" },
};
