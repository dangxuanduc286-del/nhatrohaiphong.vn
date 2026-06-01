import "dotenv/config";

import { Pool } from "pg";

type CitySeed = {
  id: string;
  name: string;
  slug: string;
  code: string;
  status: "ACTIVE" | "INACTIVE";
};

type DistrictSeed = {
  id: string;
  cityId: string;
  name: string;
  slug: string;
  wards: Array<{ id: string; name: string; slug: string }>;
};

type PoiSeed = {
  id: string;
  cityId: string;
  name: string;
  slug: string;
  category:
    | "INDUSTRIAL_PARK"
    | "PORT"
    | "AIRPORT"
    | "UNIVERSITY"
    | "HOSPITAL"
    | "TRANSPORT"
    | "SHOPPING_MALL"
    | "TOURISM"
    | "RESIDENTIAL_AREA";
  latitude: string;
  longitude: string;
  description: string;
};

type LandingPageSeed = {
  id: string;
  path: string;
  title: string;
  slug: string;
  cityId?: string;
  districtId?: string;
  poiId?: string;
};

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const roles = [
  { id: "role_user", name: "USER", slug: "user", description: "Default renter/user role" },
  { id: "role_landlord", name: "LANDLORD", slug: "landlord", description: "Landlord role" },
  { id: "role_admin", name: "ADMIN", slug: "admin", description: "Administrator role" },
] as const;

const permissions = [
  { id: "permission_room_view", name: "room.view", slug: "room.view", description: "View rooms" },
  { id: "permission_room_favorite", name: "room.favorite", slug: "room.favorite", description: "Favorite rooms" },
  { id: "permission_appointment_create", name: "appointment.create", slug: "appointment.create", description: "Create appointments" },
  { id: "permission_room_create", name: "room.create", slug: "room.create", description: "Create rooms" },
  { id: "permission_room_update", name: "room.update", slug: "room.update", description: "Update rooms" },
  { id: "permission_room_delete", name: "room.delete", slug: "room.delete", description: "Delete rooms" },
  { id: "permission_tenant_manage", name: "tenant.manage", slug: "tenant.manage", description: "Manage tenants" },
  { id: "permission_contract_manage", name: "contract.manage", slug: "contract.manage", description: "Manage contracts" },
  { id: "permission_invoice_manage", name: "invoice.manage", slug: "invoice.manage", description: "Manage invoices" },
  { id: "permission_system_manage", name: "system.manage", slug: "system.manage", description: "Manage system" },
  { id: "permission_user_manage", name: "user.manage", slug: "user.manage", description: "Manage users" },
  { id: "permission_role_manage", name: "role.manage", slug: "role.manage", description: "Manage roles" },
  { id: "permission_permission_manage", name: "permission.manage", slug: "permission.manage", description: "Manage permissions" },
  { id: "permission_audit_manage", name: "audit.manage", slug: "audit.manage", description: "Manage audit logs" },
] as const;

const rolePermissions = {
  user: ["room.view", "room.favorite", "appointment.create"],
  landlord: ["room.view", "room.favorite", "appointment.create", "room.create", "room.update", "room.delete", "tenant.manage", "contract.manage", "invoice.manage"],
  admin: permissions.map((permission) => permission.slug),
} as const;

const cities: CitySeed[] = [
  { id: "city_hai_phong", name: "Hải Phòng", slug: "hai-phong", code: "HP", status: "ACTIVE" },
  { id: "city_hai_duong", name: "Hải Dương", slug: "hai-duong", code: "HD", status: "ACTIVE" },
  { id: "city_quang_ninh", name: "Quảng Ninh", slug: "quang-ninh", code: "QN", status: "INACTIVE" },
  { id: "city_ha_noi", name: "Hà Nội", slug: "ha-noi", code: "HN", status: "INACTIVE" },
  { id: "city_bac_ninh", name: "Bắc Ninh", slug: "bac-ninh", code: "BN", status: "INACTIVE" },
  { id: "city_hung_yen", name: "Hưng Yên", slug: "hung-yen", code: "HY", status: "INACTIVE" },
];

const haiPhongDistricts: DistrictSeed[] = [
  { id: "district_hong_bang", cityId: "city_hai_phong", name: "Hồng Bàng", slug: "hong-bang", wards: ["Hạ Lý", "Minh Khai", "Sở Dầu", "Quán Toan"].map((name) => ward("hong_bang", name)) },
  { id: "district_ngo_quyen", cityId: "city_hai_phong", name: "Ngô Quyền", slug: "ngo-quyen", wards: ["Cầu Đất", "Lạch Tray", "Máy Tơ", "Vạn Mỹ", "Đông Khê"].map((name) => ward("ngo_quyen", name)) },
  { id: "district_le_chan", cityId: "city_hai_phong", name: "Lê Chân", slug: "le-chan", wards: ["An Biên", "Cát Dài", "Dư Hàng", "Vĩnh Niệm", "Kênh Dương"].map((name) => ward("le_chan", name)) },
  { id: "district_hai_an", cityId: "city_hai_phong", name: "Hải An", slug: "hai-an", wards: ["Đằng Hải", "Đằng Lâm", "Đông Hải 1", "Đông Hải 2", "Cát Bi", "Tràng Cát"].map((name) => ward("hai_an", name)) },
  { id: "district_kien_an", cityId: "city_hai_phong", name: "Kiến An", slug: "kien-an", wards: ["Bắc Sơn", "Đồng Hòa", "Quán Trữ", "Trần Thành Ngọ"].map((name) => ward("kien_an", name)) },
  { id: "district_duong_kinh", cityId: "city_hai_phong", name: "Dương Kinh", slug: "duong-kinh", wards: ["Anh Dũng", "Hải Thành", "Hòa Nghĩa", "Tân Thành"].map((name) => ward("duong_kinh", name)) },
  { id: "district_do_son", cityId: "city_hai_phong", name: "Đồ Sơn", slug: "do-son", wards: ["Vạn Hương", "Ngọc Hải", "Bàng La"].map((name) => ward("do_son", name)) },
  { id: "district_an_duong", cityId: "city_hai_phong", name: "An Dương", slug: "an-duong", wards: ["An Đồng", "An Hưng", "Hồng Phong", "Lê Lợi", "Nam Sơn"].map((name) => ward("an_duong", name)) },
  { id: "district_thuy_nguyen", cityId: "city_hai_phong", name: "Thủy Nguyên", slug: "thuy-nguyen", wards: ["Núi Đèo", "Minh Đức", "Lưu Kiếm", "Thủy Đường", "Tân Dương"].map((name) => ward("thuy_nguyen", name)) },
  { id: "district_an_lao", cityId: "city_hai_phong", name: "An Lão", slug: "an-lao", wards: ["An Lão", "Trường Sơn", "An Thắng", "Bát Trang"].map((name) => ward("an_lao", name)) },
  { id: "district_kien_thuy", cityId: "city_hai_phong", name: "Kiến Thụy", slug: "kien-thuy", wards: ["Núi Đối", "Đại Hợp", "Đoàn Xá", "Tân Phong"].map((name) => ward("kien_thuy", name)) },
  { id: "district_tien_lang", cityId: "city_hai_phong", name: "Tiên Lãng", slug: "tien-lang", wards: ["Tiên Lãng", "Bạch Đằng", "Cấp Tiến", "Đại Thắng"].map((name) => ward("tien_lang", name)) },
  { id: "district_vinh_bao", cityId: "city_hai_phong", name: "Vĩnh Bảo", slug: "vinh-bao", wards: ["Vĩnh Bảo", "An Hòa", "Đồng Minh", "Tam Cường"].map((name) => ward("vinh_bao", name)) },
  { id: "district_cat_hai", cityId: "city_hai_phong", name: "Cát Hải", slug: "cat-hai", wards: ["Cát Bà", "Cát Hải", "Trân Châu", "Xuân Đám"].map((name) => ward("cat_hai", name)) },
];

const haiDuongDistricts: DistrictSeed[] = [
  { id: "district_hai_duong_city", cityId: "city_hai_duong", name: "Thành phố Hải Dương", slug: "hai-duong-city", wards: ["Bình Hàn", "Cẩm Thượng", "Hải Tân", "Lê Thanh Nghị", "Thanh Bình", "Tứ Minh"].map((name) => ward("hai_duong_city", name)) },
  { id: "district_chi_linh", cityId: "city_hai_duong", name: "Thành phố Chí Linh", slug: "chi-linh", wards: ["Sao Đỏ", "Cộng Hòa", "Phả Lại", "Văn An"].map((name) => ward("chi_linh", name)) },
  { id: "district_kinh_mon", cityId: "city_hai_duong", name: "Thị xã Kinh Môn", slug: "kinh-mon", wards: ["An Lưu", "Hiệp An", "Minh Tân", "Phú Thứ"].map((name) => ward("kinh_mon", name)) },
  { id: "district_cam_giang", cityId: "city_hai_duong", name: "Cẩm Giàng", slug: "cam-giang", wards: ["Lai Cách", "Cẩm Điền", "Lương Điền", "Tân Trường"].map((name) => ward("cam_giang", name)) },
  { id: "district_nam_sach", cityId: "city_hai_duong", name: "Nam Sách", slug: "nam-sach", wards: ["Nam Sách", "An Lâm", "Hợp Tiến", "Quốc Tuấn"].map((name) => ward("nam_sach", name)) },
  { id: "district_kim_thanh", cityId: "city_hai_duong", name: "Kim Thành", slug: "kim-thanh", wards: ["Phú Thái", "Lai Vu", "Kim Anh", "Tuấn Việt"].map((name) => ward("kim_thanh", name)) },
  { id: "district_binh_giang", cityId: "city_hai_duong", name: "Bình Giang", slug: "binh-giang", wards: ["Kẻ Sặt", "Nhân Quyền", "Thái Học", "Vĩnh Hồng"].map((name) => ward("binh_giang", name)) },
  { id: "district_gia_loc", cityId: "city_hai_duong", name: "Gia Lộc", slug: "gia-loc", wards: ["Gia Lộc", "Đoàn Thượng", "Hoàng Diệu", "Nhật Tân"].map((name) => ward("gia_loc", name)) },
  { id: "district_tu_ky", cityId: "city_hai_duong", name: "Tứ Kỳ", slug: "tu-ky", wards: ["Tứ Kỳ", "Đại Sơn", "Hưng Đạo", "Nguyên Giáp"].map((name) => ward("tu_ky", name)) },
  { id: "district_thanh_mien", cityId: "city_hai_duong", name: "Thanh Miện", slug: "thanh-mien", wards: ["Thanh Miện", "Cao Thắng", "Đoàn Tùng", "Ngũ Hùng"].map((name) => ward("thanh_mien", name)) },
  { id: "district_ninh_giang", cityId: "city_hai_duong", name: "Ninh Giang", slug: "ninh-giang", wards: ["Ninh Giang", "Hồng Đức", "Kiến Quốc", "Văn Hội"].map((name) => ward("ninh_giang", name)) },
  { id: "district_thanh_ha", cityId: "city_hai_duong", name: "Thanh Hà", slug: "thanh-ha", wards: ["Thanh Hà", "Cẩm Chế", "Hồng Lạc", "Tân Việt"].map((name) => ward("thanh_ha", name)) },
];

const pointsOfInterest: PoiSeed[] = [
  poi("poi_vsip_hai_phong", "city_hai_phong", "VSIP Hải Phòng", "vsip-hai-phong", "INDUSTRIAL_PARK", "20.9269000", "106.6819000"),
  poi("poi_trang_due", "city_hai_phong", "Tràng Duệ", "trang-due", "INDUSTRIAL_PARK", "20.9050000", "106.6010000"),
  poi("poi_nomura", "city_hai_phong", "Nomura", "nomura", "INDUSTRIAL_PARK", "20.8540000", "106.6410000"),
  poi("poi_dinh_vu", "city_hai_phong", "Đình Vũ", "dinh-vu", "INDUSTRIAL_PARK", "20.8370000", "106.7580000"),
  poi("poi_nam_dinh_vu", "city_hai_phong", "Nam Đình Vũ", "nam-dinh-vu", "INDUSTRIAL_PARK", "20.8200000", "106.7860000"),
  poi("poi_deep_c_1", "city_hai_phong", "Deep C 1", "deep-c-1", "INDUSTRIAL_PARK", "20.8390000", "106.7550000"),
  poi("poi_deep_c_2", "city_hai_phong", "Deep C 2", "deep-c-2", "INDUSTRIAL_PARK", "20.8420000", "106.7800000"),
  poi("poi_deep_c_3", "city_hai_phong", "Deep C 3", "deep-c-3", "INDUSTRIAL_PARK", "20.8350000", "106.8000000"),
  poi("poi_cat_hai_ip", "city_hai_phong", "Cát Hải", "cat-hai-industrial-park", "INDUSTRIAL_PARK", "20.7990000", "106.9910000"),
  poi("poi_an_duong_ip", "city_hai_phong", "An Dương", "an-duong-industrial-park", "INDUSTRIAL_PARK", "20.8800000", "106.6000000"),
  poi("poi_trang_cat", "city_hai_phong", "Tràng Cát", "trang-cat", "INDUSTRIAL_PARK", "20.8350000", "106.7350000"),
  poi("poi_kcn_dai_an", "city_hai_duong", "Đại An", "kcn-dai-an", "INDUSTRIAL_PARK", "20.9370000", "106.2710000"),
  poi("poi_kcn_nam_sach", "city_hai_duong", "Nam Sách", "kcn-nam-sach", "INDUSTRIAL_PARK", "20.9960000", "106.3380000"),
  poi("poi_kcn_tan_truong", "city_hai_duong", "Tân Trường", "kcn-tan-truong", "INDUSTRIAL_PARK", "20.9360000", "106.1770000"),
  poi("poi_kcn_phuc_dien", "city_hai_duong", "Phúc Điền", "kcn-phuc-dien", "INDUSTRIAL_PARK", "20.9460000", "106.1740000"),
  poi("poi_kcn_lai_vu", "city_hai_duong", "Lai Vu", "kcn-lai-vu", "INDUSTRIAL_PARK", "20.9790000", "106.4600000"),
  poi("poi_kcn_cam_dien_luong_dien", "city_hai_duong", "Cẩm Điền - Lương Điền", "kcn-cam-dien-luong-dien", "INDUSTRIAL_PARK", "20.9500000", "106.1400000"),
  poi("poi_kcn_viet_hoa_kenmark", "city_hai_duong", "Việt Hòa - Kenmark", "kcn-viet-hoa-kenmark", "INDUSTRIAL_PARK", "20.9460000", "106.2820000"),
  poi("poi_an_phat_complex", "city_hai_duong", "An Phát Complex", "an-phat-complex", "INDUSTRIAL_PARK", "20.9130000", "106.3020000"),
  poi("poi_nam_cau_kien", "city_hai_phong", "Nam Cầu Kiền", "nam-cau-kien", "INDUSTRIAL_PARK", "20.9485000", "106.6505000"),
  poi("poi_do_son_ip", "city_hai_phong", "KCN Đồ Sơn", "kcn-do-son", "INDUSTRIAL_PARK", "20.7560000", "106.7800000"),
  poi("poi_minh_phuong", "city_hai_phong", "Minh Phương", "minh-phuong", "INDUSTRIAL_PARK", "20.8805000", "106.6105000"),
  poi("poi_dinh_vu_cat_hai_economic_zone", "city_hai_phong", "Khu kinh tế Đình Vũ - Cát Hải", "khu-kinh-te-dinh-vu-cat-hai", "INDUSTRIAL_PARK", "20.8205000", "106.8505000"),
  poi("poi_cang_dinh_vu", "city_hai_phong", "Cảng Đình Vũ", "cang-dinh-vu", "PORT", "20.8420000", "106.7630000"),
  poi("poi_cang_tan_vu", "city_hai_phong", "Cảng Tân Vũ", "cang-tan-vu", "PORT", "20.8370000", "106.7920000"),
  poi("poi_cang_chua_ve", "city_hai_phong", "Cảng Chùa Vẽ", "cang-chua-ve", "PORT", "20.8560000", "106.7110000"),
  poi("poi_cang_nam_hai", "city_hai_phong", "Cảng Nam Hải", "cang-nam-hai", "PORT", "20.8460000", "106.7360000"),
  poi("poi_cang_lach_huyen", "city_hai_phong", "Cảng Lạch Huyện", "cang-lach-huyen", "PORT", "20.7810000", "106.9970000"),
  poi("poi_cang_hai_an", "city_hai_phong", "Cảng Hải An", "cang-hai-an", "PORT", "20.8465000", "106.7285000"),
  poi("poi_san_bay_cat_bi", "city_hai_phong", "Sân bay Cát Bi", "san-bay-cat-bi", "AIRPORT", "20.8194000", "106.7249000"),
  poi("poi_dh_hang_hai_viet_nam", "city_hai_phong", "Đại học Hàng Hải Việt Nam", "dai-hoc-hang-hai-viet-nam", "UNIVERSITY", "20.8370000", "106.6940000"),
  poi("poi_dh_hai_phong", "city_hai_phong", "Đại học Hải Phòng", "dai-hoc-hai-phong", "UNIVERSITY", "20.8500000", "106.6830000"),
  poi("poi_dh_y_duoc_hai_phong", "city_hai_phong", "Đại học Y Dược Hải Phòng", "dai-hoc-y-duoc-hai-phong", "UNIVERSITY", "20.8580000", "106.6810000"),
  poi("poi_dh_quan_ly_va_cong_nghe_hai_phong", "city_hai_phong", "Đại học Quản lý và Công nghệ Hải Phòng", "dai-hoc-quan-ly-va-cong-nghe-hai-phong", "UNIVERSITY", "20.8330000", "106.6900000"),
  poi("poi_benh_vien_viet_tiep", "city_hai_phong", "Việt Tiệp", "benh-vien-viet-tiep", "HOSPITAL", "20.8580000", "106.6810000"),
  poi("poi_benh_vien_dh_y_hai_phong", "city_hai_phong", "Bệnh viện Đại học Y Hải Phòng", "benh-vien-dai-hoc-y-hai-phong", "HOSPITAL", "20.8585000", "106.6815000"),
  poi("poi_benh_vien_kien_an", "city_hai_phong", "Bệnh viện Kiến An", "benh-vien-kien-an", "HOSPITAL", "20.8070000", "106.6280000"),
  poi("poi_vinmec_hai_phong", "city_hai_phong", "Vinmec Hải Phòng", "vinmec-hai-phong", "HOSPITAL", "20.8663000", "106.6576000"),
  poi("poi_ga_hai_phong", "city_hai_phong", "Ga Hải Phòng", "ga-hai-phong", "TRANSPORT", "20.8566000", "106.6824000"),
  poi("poi_ben_xe_thuong_ly", "city_hai_phong", "Bến xe Thượng Lý", "ben-xe-thuong-ly", "TRANSPORT", "20.8690000", "106.6660000"),
  poi("poi_ben_xe_vinh_niem", "city_hai_phong", "Bến xe Vĩnh Niệm", "ben-xe-vinh-niem", "TRANSPORT", "20.8190000", "106.6760000"),
  poi("poi_cao_toc_ha_noi_hai_phong", "city_hai_phong", "Cao tốc Hà Nội - Hải Phòng", "cao-toc-ha-noi-hai-phong", "TRANSPORT", "20.8300000", "106.7600000"),
  poi("poi_aeon_mall_hai_phong", "city_hai_phong", "Aeon Mall Hải Phòng", "aeon-mall-hai-phong", "SHOPPING_MALL", "20.8197000", "106.7044000"),
  poi("poi_vincom_hai_phong", "city_hai_phong", "Vincom Hải Phòng", "vincom-hai-phong", "SHOPPING_MALL", "20.8589000", "106.6846000"),
  poi("poi_vincom_imperia", "city_hai_phong", "Vincom Imperia", "vincom-imperia", "SHOPPING_MALL", "20.8667000", "106.6590000"),
  poi("poi_vincom_plaza_le_thanh_tong", "city_hai_phong", "Vincom Plaza Lê Thánh Tông", "vincom-plaza-le-thanh-tong", "SHOPPING_MALL", "20.8616000", "106.6894000"),
  poi("poi_go_hai_phong", "city_hai_phong", "GO! Hải Phòng", "go-hai-phong", "SHOPPING_MALL", "20.8337000", "106.6842000"),
  poi("poi_vinhomes_marina", "city_hai_phong", "Vinhomes Marina", "vinhomes-marina", "RESIDENTIAL_AREA", "20.8058000", "106.7076000"),
  poi("poi_vinhomes_imperia", "city_hai_phong", "Vinhomes Imperia", "vinhomes-imperia", "RESIDENTIAL_AREA", "20.8667000", "106.6590000"),
  poi("poi_hoang_huy_commerce", "city_hai_phong", "Hoàng Huy Commerce", "hoang-huy-commerce", "RESIDENTIAL_AREA", "20.8295000", "106.6825000"),
  poi("poi_waterfront_city", "city_hai_phong", "Waterfront City", "waterfront-city", "RESIDENTIAL_AREA", "20.8125000", "106.7095000"),
  poi("poi_lach_tray", "city_hai_phong", "Lạch Tray", "lach-tray", "TRANSPORT", "20.8436000", "106.6882000"),
  poi("poi_do_son", "city_hai_phong", "Đồ Sơn", "do-son", "TOURISM", "20.7144000", "106.7946000"),
  poi("poi_cat_ba", "city_hai_phong", "Cát Bà", "cat-ba", "TOURISM", "20.7278000", "107.0482000"),
  poi("poi_hon_dau", "city_hai_phong", "Hòn Dáu", "hon-dau", "TOURISM", "20.6717000", "106.8149000"),
  poi("poi_bach_long_vi", "city_hai_phong", "Bạch Long Vĩ", "bach-long-vi", "TOURISM", "20.1333000", "107.7167000"),
];

const landingPages: LandingPageSeed[] = [
  page("lp_phong_tro_hai_phong", "/phong-tro-hai-phong", "Phòng trọ Hải Phòng", "city_hai_phong"),
  page("lp_phong_tro_hai_duong", "/phong-tro-hai-duong", "Phòng trọ Hải Dương", "city_hai_duong"),
  page("lp_phong_tro_hai_an", "/phong-tro-hai-an", "Phòng trọ Hải An", "city_hai_phong", "district_hai_an"),
  page("lp_phong_tro_an_duong", "/phong-tro-an-duong", "Phòng trọ An Dương", "city_hai_phong", "district_an_duong"),
  page("lp_phong_tro_le_chan", "/phong-tro-le-chan", "Phòng trọ Lê Chân", "city_hai_phong", "district_le_chan"),
  page("lp_phong_tro_ngo_quyen", "/phong-tro-ngo-quyen", "Phòng trọ Ngô Quyền", "city_hai_phong", "district_ngo_quyen"),
  page("lp_phong_tro_thuy_nguyen", "/phong-tro-thuy-nguyen", "Phòng trọ Thủy Nguyên", "city_hai_phong", "district_thuy_nguyen"),
  page("lp_phong_tro_chi_linh", "/phong-tro-chi-linh", "Phòng trọ Chí Linh", "city_hai_duong", "district_chi_linh"),
  page("lp_phong_tro_kinh_mon", "/phong-tro-kinh-mon", "Phòng trọ Kinh Môn", "city_hai_duong", "district_kinh_mon"),
  page("lp_phong_tro_cam_giang", "/phong-tro-cam-giang", "Phòng trọ Cẩm Giàng", "city_hai_duong", "district_cam_giang"),
  page("lp_phong_tro_nam_sach", "/phong-tro-nam-sach", "Phòng trọ Nam Sách", "city_hai_duong", "district_nam_sach"),
  page("lp_phong_tro_gan_vsip", "/phong-tro-gan-vsip", "Phòng trọ gần VSIP Hải Phòng", "city_hai_phong", undefined, "poi_vsip_hai_phong"),
  page("lp_phong_tro_gan_trang_due", "/phong-tro-gan-trang-due", "Phòng trọ gần Tràng Duệ", "city_hai_phong", undefined, "poi_trang_due"),
  page("lp_phong_tro_gan_nomura", "/phong-tro-gan-nomura", "Phòng trọ gần Nomura", "city_hai_phong", undefined, "poi_nomura"),
  page("lp_phong_tro_gan_dinh_vu", "/phong-tro-gan-dinh-vu", "Phòng trọ gần Đình Vũ", "city_hai_phong", undefined, "poi_dinh_vu"),
  page("lp_phong_tro_gan_nam_dinh_vu", "/phong-tro-gan-nam-dinh-vu", "Phòng trọ gần Nam Đình Vũ", "city_hai_phong", undefined, "poi_nam_dinh_vu"),
  page("lp_phong_tro_gan_cat_hai", "/phong-tro-gan-cat-hai", "Phòng trọ gần Cát Hải", "city_hai_phong", undefined, "poi_cat_hai_ip"),
  page("lp_phong_tro_gan_nam_cau_kien", "/phong-tro-gan-nam-cau-kien", "Phòng trọ gần Nam Cầu Kiền", "city_hai_phong", undefined, "poi_nam_cau_kien"),
  page("lp_phong_tro_gan_san_bay_cat_bi", "/phong-tro-gan-san-bay-cat-bi", "Phòng trọ gần sân bay Cát Bi", "city_hai_phong", undefined, "poi_san_bay_cat_bi"),
  page("lp_phong_tro_gan_dai_hoc_hang_hai", "/phong-tro-gan-dai-hoc-hang-hai", "Phòng trọ gần Đại học Hàng Hải", "city_hai_phong", undefined, "poi_dh_hang_hai_viet_nam"),
  page("lp_phong_tro_gan_viet_tiep", "/phong-tro-gan-viet-tiep", "Phòng trọ gần Bệnh viện Việt Tiệp", "city_hai_phong", undefined, "poi_benh_vien_viet_tiep"),
  page("lp_phong_tro_gan_kcn_dai_an", "/phong-tro-gan-kcn-dai-an", "Phòng trọ gần KCN Đại An", "city_hai_duong", undefined, "poi_kcn_dai_an"),
  page("lp_phong_tro_gan_kcn_tan_truong", "/phong-tro-gan-kcn-tan-truong", "Phòng trọ gần KCN Tân Trường", "city_hai_duong", undefined, "poi_kcn_tan_truong"),
  page("lp_phong_tro_gan_kcn_phuc_dien", "/phong-tro-gan-kcn-phuc-dien", "Phòng trọ gần KCN Phúc Điền", "city_hai_duong", undefined, "poi_kcn_phuc_dien"),
  page("lp_phong_tro_gan_kcn_lai_vu", "/phong-tro-gan-kcn-lai-vu", "Phòng trọ gần KCN Lai Vu", "city_hai_duong", undefined, "poi_kcn_lai_vu"),
  page("lp_phong_tro_gan_aeon_mall", "/phong-tro-gan-aeon-mall", "Phòng trọ gần Aeon Mall Hải Phòng", "city_hai_phong", undefined, "poi_aeon_mall_hai_phong"),
  page("lp_phong_tro_gan_vincom", "/phong-tro-gan-vincom", "Phòng trọ gần Vincom Hải Phòng", "city_hai_phong", undefined, "poi_vincom_hai_phong"),
  page("lp_phong_tro_cat_ba", "/phong-tro-cat-ba", "Phòng trọ Cát Bà", "city_hai_phong", "district_cat_hai", "poi_cat_ba"),
  page("lp_phong_tro_do_son", "/phong-tro-do-son", "Phòng trọ Đồ Sơn", "city_hai_phong", "district_do_son", "poi_do_son"),
];

function toSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function ward(prefix: string, name: string) {
  const slug = toSlug(name);
  return { id: `ward_${prefix}_${slug.replace(/-/g, "_")}`, name, slug };
}

function poi(
  id: PoiSeed["id"],
  cityId: PoiSeed["cityId"],
  name: PoiSeed["name"],
  slug: PoiSeed["slug"],
  category: PoiSeed["category"],
  latitude: PoiSeed["latitude"],
  longitude: PoiSeed["longitude"],
): PoiSeed {
  return { id, cityId, name, slug, category, latitude, longitude, description: `${name}.` };
}

function page(
  id: string,
  path: string,
  title: string,
  cityId?: string,
  districtId?: string,
  poiId?: string,
): LandingPageSeed {
  return { id, path, title, slug: path.replace(/^\//, ""), cityId, districtId, poiId };
}

async function query(text: string, values: unknown[]) {
  await pool.query(text, values);
}

async function seedCities() {
  for (const city of cities) {
    await query(
      `INSERT INTO "cities" ("id", "name", "slug", "code", "status", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5::"CityStatus", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT ("code") DO UPDATE SET
         "name" = EXCLUDED."name",
         "slug" = EXCLUDED."slug",
         "status" = EXCLUDED."status",
         "deletedAt" = NULL,
         "updatedAt" = CURRENT_TIMESTAMP`,
      [city.id, city.name, city.slug, city.code, city.status],
    );
  }
}

async function seedDistrictsAndWards() {
  for (const district of [...haiPhongDistricts, ...haiDuongDistricts]) {
    await query(
      `INSERT INTO "districts" ("id", "cityId", "name", "slug", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT ("slug") DO UPDATE SET
         "cityId" = EXCLUDED."cityId",
         "name" = EXCLUDED."name",
         "deletedAt" = NULL,
         "updatedAt" = CURRENT_TIMESTAMP`,
      [district.id, district.cityId, district.name, district.slug],
    );

    for (const wardSeed of district.wards) {
      await query(
        `INSERT INTO "wards" ("id", "districtId", "name", "slug", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON CONFLICT ("districtId", "slug") DO UPDATE SET
           "name" = EXCLUDED."name",
           "deletedAt" = NULL,
           "updatedAt" = CURRENT_TIMESTAMP`,
        [wardSeed.id, district.id, wardSeed.name, wardSeed.slug],
      );
    }
  }
}

async function seedPointsOfInterest() {
  for (const item of pointsOfInterest) {
    await query(
      `INSERT INTO "points_of_interest" ("id", "cityId", "name", "slug", "category", "latitude", "longitude", "description", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5::"PointOfInterestCategory", $6::numeric, $7::numeric, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT ("slug") DO UPDATE SET
         "cityId" = EXCLUDED."cityId",
         "name" = EXCLUDED."name",
         "category" = EXCLUDED."category",
         "latitude" = EXCLUDED."latitude",
         "longitude" = EXCLUDED."longitude",
         "description" = EXCLUDED."description",
         "deletedAt" = NULL,
         "updatedAt" = CURRENT_TIMESTAMP`,
      [item.id, item.cityId, item.name, item.slug, item.category, item.latitude, item.longitude, item.description],
    );
  }
}

async function seedLandingPages() {
  for (const item of landingPages) {
    await query(
      `INSERT INTO "landing_pages" ("id", "path", "title", "slug", "cityId", "districtId", "poiId", "isPublished", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT ("path") DO UPDATE SET
         "title" = EXCLUDED."title",
         "slug" = EXCLUDED."slug",
         "cityId" = EXCLUDED."cityId",
         "districtId" = EXCLUDED."districtId",
         "poiId" = EXCLUDED."poiId",
         "isPublished" = true,
         "deletedAt" = NULL,
         "updatedAt" = CURRENT_TIMESTAMP`,
      [item.id, item.path, item.title, item.slug, item.cityId ?? null, item.districtId ?? null, item.poiId ?? null],
    );
  }
}

async function seedRbac() {
  for (const role of roles) {
    await query(
      `INSERT INTO "roles" ("id", "name", "slug", "description", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT ("slug") DO UPDATE SET
         "name" = EXCLUDED."name",
         "description" = EXCLUDED."description",
         "deletedAt" = NULL,
         "updatedAt" = CURRENT_TIMESTAMP`,
      [role.id, role.name, role.slug, role.description],
    );
  }

  for (const permission of permissions) {
    await query(
      `INSERT INTO "permissions" ("id", "name", "slug", "description", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT ("slug") DO UPDATE SET
         "name" = EXCLUDED."name",
         "description" = EXCLUDED."description",
         "deletedAt" = NULL,
         "updatedAt" = CURRENT_TIMESTAMP`,
      [permission.id, permission.name, permission.slug, permission.description],
    );
  }

  for (const [roleSlug, permissionSlugs] of Object.entries(rolePermissions)) {
    for (const permissionSlug of permissionSlugs) {
      await query(
        `INSERT INTO "role_permissions" ("roleId", "permissionId", "createdAt")
         SELECT r."id", p."id", CURRENT_TIMESTAMP
         FROM "roles" r, "permissions" p
         WHERE r."slug" = $1 AND p."slug" = $2
         ON CONFLICT ("roleId", "permissionId") DO NOTHING`,
        [roleSlug, permissionSlug],
      );
    }
  }
}

async function main() {
  await seedRbac();
  await seedCities();
  await seedDistrictsAndWards();
  await seedPointsOfInterest();
  await seedLandingPages();

  console.info("Seed completed", {
    roles: roles.length,
    permissions: permissions.length,
    cities: cities.length,
    districts: haiPhongDistricts.length + haiDuongDistricts.length,
    wards: [...haiPhongDistricts, ...haiDuongDistricts].reduce((total, district) => total + district.wards.length, 0),
    pointsOfInterest: pointsOfInterest.length,
    landingPages: landingPages.length,
  });
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
