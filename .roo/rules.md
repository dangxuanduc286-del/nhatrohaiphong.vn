# QUY TẮC LÀM VIỆC - NHATROHAIPHONG.VN

Luôn trả lời bằng tiếng Việt.

==================================================
PHÂN TÍCH TRƯỚC KHI SỬA
=======================

Bắt buộc:

1. Root Cause Analysis
2. Dependency Impact Analysis
3. Regression Risk Analysis

Chỉ phân tích phạm vi liên quan.

Không audit lại toàn bộ hệ thống nếu thay đổi không ảnh hưởng.

==================================================
SỬ DỤNG CODEBASE
================

Source of Truth:

1. Source Code hiện tại
2. Context7
3. Official Documentation

Được phép đọc lại:

* Module đang sửa
* Dependency trực tiếp
* API liên quan
* Database model liên quan

Ví dụ:

Prompt Admin:

* src/app/admin/**
* src/app/api/admin/**
* src/server/auth/**
* prisma/schema.prisma

Prompt Rooms:

* src/modules/rooms/**
* src/modules/properties/**
* prisma/schema.prisma

==================================================
KHÔNG ĐƯỢC QUÉT LẠI TOÀN BỘ PROJECT
===================================

Không đọc lại:

* Toàn bộ src/**
* Toàn bộ prisma/**
* Toàn bộ docs/**
* Toàn bộ project

trừ khi được yêu cầu.

Không re-audit:

* Prompt 01 Foundation
* Prompt 02 Database
* Prompt 03 Authentication

trừ khi thay đổi ảnh hưởng trực tiếp.

==================================================
KHÔNG ĐỌC TÀI LIỆU NEXT.JS BUNDLED TRONG NODE_MODULES
=====================================================

KHÔNG đọc tài liệu Next.js bundled/local trong node_modules.

KHÔNG đọc file Markdown/MDX tài liệu Next.js local.

KHÔNG parse tài liệu Next.js local.

Nếu cần tham chiếu Next.js:

* Sử dụng source code hiện có
* Sử dụng TypeScript typings
* Sử dụng package APIs

KHÔNG đọc:

node_modules/**

trừ khi cần kiểm tra source code package cụ thể, typings, hoặc package API.

Nếu file không tồn tại:

* Không retry
* Không thử lại đường dẫn tương tự
* Không đọc file thay thế trong cùng thư mục
* Báo lỗi 1 lần
* Tiếp tục thực hiện nhiệm vụ

==================================================
BẢO TOÀN HỆ THỐNG
=================

Giữ nguyên:

* Database Schema
* Authentication
* RBAC
* Existing APIs
* Existing Business Logic
* Geo Data Hải Phòng/Hải Dương
* SEO Data

Không thay đổi nếu không được yêu cầu.

Nếu không đảm bảo an toàn:

DỪNG NGAY và báo cáo.

==================================================
KHI SỬA CODE
============

Bắt buộc:

* Giữ nguyên chức năng hiện có
* Không thay đổi business logic nếu không được yêu cầu
* Không phá Authentication
* Không phá RBAC
* Không phá Database

==================================================
CLEANUP
=======

Sau khi hoàn thành:

* Xóa dead code
* Xóa unused imports
* Xóa unused exports
* Xóa unused types
* Xóa duplicate logic
* Xóa duplicate components

Chỉ xóa khi xác nhận không còn được sử dụng.

==================================================
KIỂM TRA BẮT BUỘC
=================

Sau mỗi thay đổi:

npm run lint

npm run typecheck

npm run build

npx prisma validate

npx prisma generate

==================================================
ĐIỀU KIỆN HOÀN THÀNH
====================

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
