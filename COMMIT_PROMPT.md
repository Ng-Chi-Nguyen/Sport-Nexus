## 🤖 Quy tắc Git Commit dành cho AI

Mỗi khi tạo hoặc đề xuất commit message, AI phải tuân thủ nghiêm ngặt định dạng **Conventional Commits** dưới đây.

### 1. Cấu trúc Commit

`<type>(<scope>): <mô tả ngắn bằng tiếng Anh>`

`[dòng trống]`
`[mô tả chi tiết - tùy chọn]`

### 2. Danh sách Type bắt buộc:

- `feat`: Thêm tính năng mới cho người dùng.
- `fix`: Sửa lỗi (bug fix).
- `docs`: Thay đổi tài liệu, comment, README.
- `style`: Định dạng code (khoảng trắng, dấu chấm phẩy) không làm thay đổi logic code.
- `refactor`: Cải tiến, tái cấu trúc code nhưng không sửa bug hay thêm feat.
- `perf`: Thay đổi code giúp tăng hiệu năng hệ thống.
- `test`: Thêm mới hoặc bổ sung các bộ kiểm thử (tests).
- `chore`: Cập nhật cấu hình, dependency, công cụ build (không sửa code ứng dụng).

### 3. Quy chuẩn bắt buộc:

- **Ngôn ngữ:** Viết bằng tiếng Việt.
- **Thì câu:** Dùng thì hiện tại thể mệnh lệnh (Mệnh lệnh cách: `add`, `update`, `fix` – KHÔNG dùng `added`, `fixing`, `fixes`).
- **Viết hoa:** Viết thường toàn bộ phần `<type>(<scope>): <mô tả>`. Không đặt dấu chấm `.` ở cuối dòng mô tả ngắn.
- **Độ dài:** Dòng tiêu đề không quá 50 ký tự.
- **Nội dung phần Body (nếu có):** Giải thích LÝ DO tại sao lại thay đổi (WHY), không nhắc lại cái đã làm (WHAT).

### 4. Ví dụ mẫu:

- `feat(search): add 2-minute product viewing rule to history`
- `fix(auth): prevent app crash on null JWT token`
- `refactor(cart): simplify price calculation logic`
