# PHASE 10 - AI SEO CONTENT ENGINE

## 1. Content Opportunity Analysis

### Hiện trạng dữ liệu có thể dùng ngay

Dự án đã có nền tảng SEO đủ tốt để xây AI SEO Content Engine theo hướng an toàn, không cần đổi Database Schema, Search Logic, Authentication, RBAC hoặc Monetization Architecture.

Các thực thể hiện có:

| Nhóm dữ liệu | Trạng thái | Cơ hội nội dung |
|---|---:|---|
| City | Có Hải Phòng, Hải Dương đang active | Tạo/duy trì landing page cấp thành phố |
| District | Có đủ nhiều quận/huyện cho Hải Phòng và Hải Dương | Mở rộng landing page cấp quận/huyện khi có phòng thật |
| Ward | Có dữ liệu phường/xã | Dùng làm section trong nội dung; chỉ tạo URL ward khi có đủ phòng thật và có chiến lược chống thin content |
| POI | Có KCN, trường đại học, bệnh viện, cảng, sân bay, trung tâm thương mại, du lịch | Tạo landing page theo POI thực, đặc biệt KCN/trường/bệnh viện |
| LandingPage | Đã hỗ trợ path, title, cityId, districtId, poiId, content, isPublished | Dùng làm container cho nội dung AI đã duyệt |
| SEOSetting | Đã hỗ trợ metaTitle, metaDescription, canonicalUrl, keywords, schemaJson | Dùng lưu output SEO title/description/canonical/keyword |
| FAQ | Đã hỗ trợ FAQ theo LandingPage | Dùng lưu output FAQ từ AI, render JSON-LD sẵn có |
| Room | Có phòng AVAILABLE làm bằng chứng dữ liệu thực | Điều kiện bắt buộc trước khi publish/index |

### Thành phần render/indexing hiện có

| Thành phần | Vai trò | Nhận định Phase 10 |
|---|---|---|
| `src/app/[slug]/page.tsx` | Render landing page theo path, metadata, FAQ, related links, room list | Đủ dùng cho city/district/POI pages |
| `src/server/search/service.ts` | Landing page search theo city/district/POI và cache | Không nên đổi theo constraint; không hỗ trợ price/area/amenity pages độc lập |
| `src/app/sitemap.ts` | Tự đưa published landing pages và room AVAILABLE vào sitemap | Safe nếu chỉ publish URL có dữ liệu thật |
| `src/lib/seo/index.tsx` | Metadata/canonical/JSON-LD | Đã có nền tảng structured data |
| `src/server/admin/crud.ts` | Admin CRUD landing page/SEO/POI | Có thể dùng để nhập nội dung đã duyệt thủ công |

### Khoảng trống nội dung

1. Nội dung landing page hiện mới ở mức seed/template, chưa có hệ thống quy chuẩn AI output.
2. Chưa có checklist chất lượng trước khi publish để chống duplicate/thin content.
3. Chưa có ma trận ưu tiên page theo room count, POI thật, city/district/ward.
4. Chưa có policy rõ cho price/area/amenity long-tail pages trong giới hạn không đổi schema/search.
5. Chưa có quy trình internal link graph có kiểm soát để tránh orphan pages.

## 2. GEO Opportunity Analysis

### Cấp thành phố

| Cụm từ | Trạng thái dữ liệu | Chiến lược |
|---|---|---|
| Phòng trọ Hải Phòng | Đã có city active + landing page | Giữ là hub chính, link xuống district/POI/room |
| Phòng trọ Hải Dương | Đã có city active + landing page | Giữ là hub mở rộng, ưu tiên KCN/TP Hải Dương/Chí Linh/Kinh Môn |
| Quảng Ninh, Hà Nội, Bắc Ninh, Hưng Yên | City có seed nhưng inactive | Không tạo URL index cho đến khi active + có phòng thật |

### Cấp quận/huyện

Ưu tiên Phase 10 nên tập trung vào các district đã có landing page seed và có khả năng có phòng thật:

- Hải Phòng: Lê Chân, Hải An, Ngô Quyền, An Dương, Thủy Nguyên, Đồ Sơn, Cát Hải.
- Hải Dương: Chí Linh, Kinh Môn, Cẩm Giàng, Nam Sách.

Quy tắc publish:

- Chỉ publish district landing page nếu có ít nhất 3 phòng AVAILABLE trong district đó.
- Nếu dưới ngưỡng, page giữ draft hoặc noindex, nội dung chỉ dùng làm section trong city hub.
- Nếu district có phòng nhưng chưa có FAQ/meta riêng, AI engine tạo bộ title/description/intro/FAQ dựa trên dữ liệu thực.

### Cấp ward

Ward có tiềm năng long-tail cao nhưng rủi ro thin content lớn.

Policy đề xuất:

- Không tạo indexed ward URL đại trà trong Phase 10.
- Chỉ dùng ward làm block nội dung trong district page: “Khu vực/phường được quan tâm”.
- Chỉ đề xuất ward page khi:
  - Có ít nhất 5 phòng AVAILABLE trong ward.
  - Có tối thiểu 2 landlord hoặc 2 building/property khác nhau để tránh nội dung quá mỏng.
  - Có internal links từ city/district/POI và link xuống room thật.

## 3. Programmatic SEO Analysis

### Page types có thể làm ngay mà không đổi schema/search

| Page type | Có thể index ngay? | Lý do |
|---|---:|---|
| City page | Có | LandingPage có cityId; search đã hỗ trợ |
| District page | Có | LandingPage có districtId; search đã hỗ trợ |
| POI page | Có | LandingPage có poiId; search đã hỗ trợ theo khoảng cách POI |
| University/Hospital/Industrial Zone pages | Có, dưới dạng POI page | POI category đã có dữ liệu thật |
| Ward page | Chưa nên index đại trà | LandingPage không có wardId; search không hỗ trợ ward landing page riêng nếu không đổi schema/search |
| Price page | Không nên tạo URL index ở Phase 10 | LandingPage không có price band; landing search không lọc price |
| Area-size page | Không nên tạo URL index ở Phase 10 | LandingPage không có area band; landing search không lọc area |
| Amenity page | Không nên tạo URL index ở Phase 10 | LandingPage không có amenity dimension; landing search không lọc amenity |

### Cách xử lý nhóm price/area/amenity trong giới hạn hiện tại

Yêu cầu có các nhóm:

- Dưới 2 triệu, 2-3 triệu, 3-5 triệu.
- Dưới 20m², 20-30m², trên 30m².
- Có điều hòa, có thang máy, có chỗ để xe.

Vì không được đổi search logic và schema, không nên tạo standalone indexed URL cho các nhóm này trong Phase 10. Thay vào đó:

1. Dùng chúng làm content modules trong city/district/POI pages.
2. Link đến trang search/filter hiện có nếu UI/API đã hỗ trợ query tương ứng, nhưng đặt canonical về landing page chính hoặc không đưa filtered URL vào sitemap.
3. Chỉ chuyển thành indexed programmatic pages ở phase sau nếu được phép bổ sung schema/search/indexing policy.

### AI content output template

Mỗi landing page đủ điều kiện publish nên có output:

| Trường | Quy tắc |
|---|---|
| SEO Title | 45-60 ký tự, chứa entity chính, không nhồi keyword |
| SEO Description | 120-155 ký tự, nêu khu vực/POI/giá tham khảo nếu có dữ liệu thật |
| Intro Content | 250-500 từ, có dữ liệu thực: số phòng, khu vực nổi bật, POI, khoảng giá thực |
| FAQ | 3-5 câu hỏi, trả lời cụ thể theo entity, không cam kết sai |
| Internal Links | 4-8 link: parent, sibling, child, POI liên quan, room nổi bật |
| Safety Notes | Lưu bằng quy trình review trước publish |

### Chống duplicate/thin content

Một URL chỉ được publish/index khi đạt tất cả điều kiện:

1. Có entity thật: city/district/POI trong database và chưa deleted.
2. Có phòng thật: tối thiểu 3 phòng AVAILABLE liên quan.
3. Có title/meta/intro khác biệt với page cùng cấp.
4. Có ít nhất 3 internal links hợp lệ.
5. Có ít nhất 1 link xuống room thật.
6. Không trùng canonical với page khác, trừ trường hợp deliberately canonicalized.
7. Không tạo URL chỉ vì keyword nếu không có dữ liệu thật.

## 4. Internal Link Analysis

### Graph mục tiêu

Luồng internal link an toàn:

```text
Homepage -> City -> District -> Ward section -> POI -> Room
```

Trong giới hạn hiện tại, ward nên là section không phải URL độc lập:

```text
Homepage -> City landing page -> District landing page -> POI landing page -> Room detail
```

### Mapping hiện có

- Homepage đã query landingPages, districts, POIs, featuredRooms.
- Landing page đã có related links theo city/district/POI.
- Room detail đã có breadcrumb và related rooms.
- Sitemap đã include landing pages và rooms.

### Rule internal link

| Source | Link đích bắt buộc | Mục tiêu |
|---|---|---|
| Homepage | City hubs, top districts, top POIs, featured rooms | Không orphan city/district/POI pages |
| City page | District pages cùng city, POI pages cùng city, room list | Tạo hub GEO |
| District page | City parent, POI gần district, rooms trong district | Củng cố topical relevance |
| POI page | City parent, district gần POI, rooms gần POI | Tăng intent gần KCN/trường/bệnh viện |
| Room page | District/city/POI related landing pages nếu có | Đẩy authority ngược lên landing pages |

### Anchor text policy

- Dùng anchor tự nhiên: “phòng trọ Lê Chân”, “phòng trọ gần VSIP Hải Phòng”.
- Tránh lặp exact-match quá nhiều trong cùng page.
- Mỗi page không quá 12 internal SEO links trong block chính để tránh spam.

## 5. Indexing Analysis

### Sitemap

Hiện `src/app/sitemap.ts` lấy tất cả LandingPage `isPublished=true` và Room `status=AVAILABLE`. Đây là phù hợp nếu publish policy được kiểm soát.

Khuyến nghị vận hành:

- Không set `isPublished=true` cho page chưa đủ room/entity/content.
- Không đưa filtered query URL price/area/amenity vào sitemap trong Phase 10.
- Giữ room AVAILABLE trong sitemap; phòng không available không được include.

### Canonical

Hiện landing metadata dùng `seo.canonicalUrl ?? page.path`. Policy:

- Canonical của city/district/POI page phải trỏ về chính URL sạch.
- Nếu có filtered/search URL từ content modules, canonical không nên tự index như landing page.
- Không tạo canonical chain.

### Structured data

Hiện đã có:

- BreadcrumbList.
- ItemList.
- Residence.
- FAQPage.
- Organization/WebSite/LocalBusiness.

Policy:

- FAQPage chỉ render khi FAQ có câu trả lời thật, không duplicate đại trà.
- ItemList chỉ gồm room thật từ landing page search.
- Residence chỉ lấy room thật và giới hạn số lượng như hiện tại.

### Noindex policy

Không cần đổi code ngay nếu chỉ publish pages đủ điều kiện. Nếu phase sau cần draft preview/noindex theo dữ liệu, có thể dùng `isPublished=false` hoặc SEOSetting/canonical policy hiện có. Trong Phase 10, cách an toàn nhất là không publish page không đạt chuẩn.

## 6. Impact Analysis

### Tác động SEO kỳ vọng

| Hạng mục | Tác động |
|---|---|
| Organic Traffic | Tăng qua city/district/POI long-tail có dữ liệu thật |
| Long-tail Keywords | Tăng với cụm “phòng trọ gần KCN/trường/bệnh viện” và “phòng trọ + quận/huyện” |
| GEO SEO Coverage | Mở rộng Hải Phòng/Hải Dương an toàn theo data coverage |
| Crawl Efficiency | Tốt nếu chỉ publish URL đủ dữ liệu, không spam filtered URLs |
| Conversion | Tăng nhờ page intent cao dẫn xuống room/contact |

### Tác động kỹ thuật

- Không ảnh hưởng schema vì dùng LandingPage/SEOSetting/FAQ hiện có.
- Không ảnh hưởng search logic vì chỉ dùng city/district/POI đang được landing search hỗ trợ.
- Không ảnh hưởng auth/RBAC vì không thay đổi quyền hay middleware.
- Không ảnh hưởng monetization vì không đụng Plan/Subscription/Boost.
- Không ảnh hưởng analytics architecture; các landing views đã được tracking ở Phase 8.

## 7. Regression Analysis

### Rủi ro chính

| Rủi ro | Mức độ | Kiểm soát |
|---|---:|---|
| Thin content từ ward/price/area/amenity pages | Cao | Không index standalone trong Phase 10 |
| Duplicate title/meta/FAQ | Trung bình | AI prompt phải có uniqueness check theo entity |
| Orphan pages | Trung bình | Bắt buộc parent/sibling/room links trước publish |
| URL không có phòng thật | Cao | Bắt buộc room count threshold |
| Sitemap phình nhanh | Trung bình | Chỉ publish pages đạt chuẩn |
| Search mismatch với nội dung | Cao | Không tạo page mà search không lọc đúng intent |

### Regression checklist trước publish page mới

- Page path duy nhất và sạch.
- Entity thật tồn tại và active/not deleted.
- Có tối thiểu 3 phòng AVAILABLE liên quan.
- Landing search trả về room phù hợp intent.
- Metadata unique.
- FAQ không copy nguyên từ page khác.
- Có internal links parent/sibling/child/room.
- Page xuất hiện trong sitemap chỉ khi published.
- Build/lint/typecheck pass sau mọi thay đổi code.

## 8. Implementation Plan

### Phase 10A - Foundation không đổi code runtime

1. Chuẩn hóa AI SEO content brief:
   - Input: city, district, ward list, POI, room count, min/max/median price, area range, top amenities nếu có.
   - Output: SEO Title, Description, Intro, FAQ, Internal Links.
2. Dùng Admin CRUD hiện có để nhập nội dung vào LandingPage/SEOSetting/FAQ.
3. Chỉ publish city/district/POI pages đạt threshold.
4. Không tạo indexed price/area/amenity/ward URLs trong Phase 10.

### Phase 10B - Content generation workflow đề xuất

```text
Collect real data -> Score page opportunity -> Generate AI draft -> Validate duplicate/thin/content safety -> Human review -> Save LandingPage/SEOSetting/FAQ -> Publish -> Sitemap auto include -> Monitor analytics/GSC
```

### Opportunity scoring đề xuất

| Tiêu chí | Điểm |
|---|---:|
| Có >= 10 phòng AVAILABLE | +3 |
| Có 3-9 phòng AVAILABLE | +2 |
| Có POI thật thuộc KCN/trường/bệnh viện | +3 |
| Có city/district active | +2 |
| Có ít nhất 3 internal link targets | +2 |
| Có landing page seed sẵn | +1 |
| Dưới 3 phòng AVAILABLE | Không publish |
| Không có entity thật | Không tạo |

### Prompt contract cho AI content

AI chỉ được viết dựa trên dữ liệu input. Không được tự bịa:

- Không bịa giá nếu không có thống kê giá từ room thật.
- Không bịa khoảng cách nếu không có POI tọa độ hoặc distance calculation.
- Không bịa tiện ích nếu không có room amenities thật.
- Không cam kết còn phòng ngoài trạng thái AVAILABLE.
- Không dùng cùng một intro/FAQ cho nhiều page.

### Roadmap an toàn cho page types

| Giai đoạn | Page type | Trạng thái |
|---|---|---|
| Phase 10 | City/District/POI | Có thể dùng ngay |
| Phase 10 | University/Hospital/Industrial Zone | Có thể dùng như POI page |
| Phase 10 | Ward | Chỉ section, không standalone indexed URL |
| Phase 10 | Price/Area/Amenity | Chỉ content modules hoặc link filter không sitemap |
| Phase sau | Ward/Price/Area/Amenity indexed pages | Cần được phép bổ sung schema/search/index policy |

### Verification plan

Vì Phase 10 hiện chỉ thêm tài liệu chiến lược, vẫn nên chạy:

```bash
npm run lint
npm run typecheck
npm run build
```

Kết quả cần ghi trong final report.

## Kết luận Phase 10

Nền tảng hiện tại đã sẵn sàng để triển khai AI SEO Content Engine an toàn ở lớp nội dung và vận hành, tập trung vào city/district/POI pages có dữ liệu thật. Không nên tạo URL index cho price/area/amenity/ward trong Phase 10 vì schema/search hiện chưa biểu diễn các dimensions này cho LandingPage và user đã cấm thay đổi schema/search logic. Chiến lược đúng là dùng các intent đó như content modules trước, sau đó nâng cấp thành indexed programmatic pages ở phase riêng nếu được phép thay đổi search/indexing architecture.
