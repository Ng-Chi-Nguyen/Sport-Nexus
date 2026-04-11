# Docs (Tài liệu tham khảo)

## Mục đích

`docs/` dùng để chứa tài liệu tham khảo nghiệp vụ/database cho dự án SportNexus.

## Nguyên tắc source-of-truth

- Source-of-truth cho cấu trúc database runtime là: `server/prisma/schema.prisma`.
- Tài liệu trong `docs/` chỉ mang tính tham khảo và có thể lệch so với code hiện tại.

## Cách đọc tài liệu đề xuất

1. Đọc tài liệu trong `docs/` để hiểu ngữ cảnh nghiệp vụ.
2. Đối chiếu lại với route/service/schema trong `server/` trước khi triển khai.
3. Khi có mâu thuẫn, ưu tiên theo mã nguồn đang chạy (đặc biệt là Prisma schema).

## Trạng thái trong task hiện tại

- Trong worktree của task này chưa có các file tài liệu DB gốc (ví dụ `docs.docx`, sơ đồ model).
- Cần đồng bộ lại thư mục `docs/` ở các task tiếp theo nếu muốn tài liệu hóa chi tiết từng file.
