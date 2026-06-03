# RULES - NHATROHAIPHONG.VN

## NGÔN NGỮ

* Luôn trả lời bằng tiếng Việt.

---

## SOURCE OF TRUTH

Ưu tiên theo thứ tự:

1. Source Code hiện tại
2. Official Documentation
3. Context7

Không ưu tiên memory, prompt cũ hoặc context cũ hơn source code thực tế.

---

## PHÂN TÍCH TRƯỚC KHI SỬA

Bắt buộc thực hiện:

1. Root Cause Analysis
2. Dependency Impact Analysis
3. Regression Risk Analysis

Chỉ phân tích phạm vi liên quan.

Không audit lại toàn bộ hệ thống nếu thay đổi không ảnh hưởng.

---

## PHẠM VI ĐỌC CODE

Được phép đọc:

* Module đang sửa
* Dependency trực tiếp
* API liên quan
* Database model liên quan

Không được đọc:

* Toàn bộ src/**
* Toàn bộ prisma/**
* Toàn bộ docs/**
* Toàn bộ project

Trừ khi được yêu cầu rõ ràng.

Không re-audit các Prompt/Foundation đã hoàn thành nếu thay đổi không ảnh hưởng trực tiếp.

---

## FILESYSTEM FIRST

Trước khi đọc file:

* Xác nhận file tồn tại thực tế.
* Chỉ đọc file thực sự tồn tại.

Nếu gặp ENOENT:

* Không retry
* Không suy đoán đường dẫn khác
* Không tạo vòng lặp đọc file
* Log 1 lần
* Đánh dấu unavailable
* Tiếp tục bằng dữ liệu hiện có

Không suy luận cấu trúc file hoặc route.

---

## NODE_MODULES

Không đọc:

* node_modules/**
* Tài liệu Next.js bundled
* Markdown/MDX documentation trong node_modules

Chỉ được đọc package source hoặc typings khi thật sự cần thiết.

---

## ADMIN FIRST POLICY

Khi Admin Core chưa hoàn thành:

Không triển khai:

* Payment
* Subscription
* Wallet
* Billing
* Boost
* Monetization
* User-facing features
* Landlord-facing features

Ưu tiên:

1. Admin
2. Landlord
3. Public

---

## SYSTEM SAFETY

Mặc định:

* Giữ nguyên Database Schema
* Giữ nguyên Authentication
* Giữ nguyên RBAC
* Giữ nguyên Existing APIs
* Giữ nguyên Business Logic
* Giữ nguyên dữ liệu hiện có

Không thay đổi nếu không được yêu cầu.

Nếu không đảm bảo an toàn:

DỪNG NGAY và báo cáo.

---

## AUTO EXECUTION POLICY

Tự động thực hiện:

* Read files
* Search code
* Analyze code
* Refactor nội bộ
* Sửa lỗi nhỏ
* Edit code trong workspace

Không yêu cầu xác nhận trung gian.

Chỉ hỏi lại khi:

* Xóa dữ liệu
* Xóa module lớn
* Thay đổi Database Schema
* Thay đổi API Public
* Thay đổi Business Logic
* Chạy lệnh có nguy cơ mất dữ liệu
* Có nhiều phương án kiến trúc cần lựa chọn

---

## CLEANUP

Sau khi hoàn thành:

* Xóa dead code
* Xóa unused imports
* Xóa unused exports
* Xóa unused types
* Xóa duplicate logic
* Xóa duplicate components

Chỉ xóa khi xác nhận không còn được sử dụng.

---

## VERIFICATION

Sau mỗi thay đổi:

* npm run lint
* npm run typecheck
* npm run build
* npx prisma validate
* npx prisma generate

---

## DEFINITION OF DONE

Chỉ hoàn thành khi:

* Build PASS
* Typecheck PASS
* Lint PASS
* Prisma PASS
* Không phát sinh lỗi mới
* Không phá chức năng cũ
* Không phá dữ liệu
* Không phá Authentication
* Không phá RBAC
* Không phá API hiện có
