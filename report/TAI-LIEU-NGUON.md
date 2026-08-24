<p align="center">
  <img src="../client/src/assets/images/logo-sportnexus-dark.svg" alt="SportNexus Logo" width="320">
</p>

<h1 align="center">TÀI LIỆU NGUỒN — SPORTNEXUS</h1>

<p align="center">
  <strong>Tài liệu phân tích và mô tả hệ thống thương mại điện tử thể thao</strong><br>
  Bản nội dung được viết lại theo cấu trúc 3 chương hướng báo cáo
</p>

---

# CHƯƠNG I. GIỚI THIỆU VỀ HỆ THỐNG SPORTNEXUS

## 1.1. Bối cảnh của đề tài

Trong thời đại số hóa, thương mại điện tử đã trở thành một xu hướng không thể thiếu trong mọi lĩnh vực kinh doanh, đặc biệt là trong ngành thể thao. Người tiêu dùng ngày càng ưu tiên mua sắm trực tuyến nhờ sự tiện lợi, tiết kiệm thời gian và khả năng tiếp cận sản phẩm đa dạng. Bên cạnh đó, các doanh nghiệp bán lẻ thể thao cũng cần một nền tảng quản lý toàn diện để tối ưu quy trình bán hàng, quản lý tồn kho, chăm sóc khách hàng và theo dõi doanh thu.

SportNexus là một hệ thống thương mại điện tử chuyên về lĩnh vực thể thao, được xây dựng nhằm đáp ứng nhu cầu bán hàng trực tuyến và quản trị vận hành. Hệ thống này tích hợp các chức năng chính như quản lý sản phẩm, giỏ hàng, đặt hàng, thanh toán, tài khoản người dùng và quản trị hệ thống. Sự kết hợp giữa frontend hiện đại và backend mạnh mẽ giúp dự án này mang tính khả thi cao trong thực tế và đồng thời phù hợp với yêu cầu của một đồ án hoặc khóa luận.

## 1.2. Mục tiêu của dự án

Dự án SportNexus hướng tới việc xây dựng một nền tảng thương mại điện tử hoàn chỉnh cho ngành thể thao với các mục tiêu chính như sau:

- Xây dựng giao diện bán hàng thân thiện, dễ sử dụng và tương thích với nhiều thiết bị.
- Quản lý sản phẩm theo mô hình đa biến thể với nhiều màu sắc, kích thước và mức tồn kho khác nhau.
- Tạo quy trình mua hàng từ tìm kiếm, thêm giỏ hàng đến đặt hàng và thanh toán.
- Hỗ trợ khách hàng theo dõi trạng thái đơn hàng và quản lý tài khoản cá nhân.
- Xây dựng hệ thống quản trị cho admin và nhân viên để quản lý sản phẩm, đơn hàng, tồn kho, khuyến mãi và quyền truy cập.
- Tích hợp các công nghệ hiện đại như xác thực JWT, lưu trữ hình ảnh, email và cổng thanh toán.

## 1.3. Phạm vi nghiên cứu

### 1.3.1. Đối tượng sử dụng

Hệ thống được thiết kế cho ba nhóm đối tượng chính:

- Khách vãng lai: có thể duyệt sản phẩm và tìm hiểu thông tin trước khi mua.
- Khách hàng đã đăng nhập: có quyền quản lý giỏ hàng, theo dõi đơn hàng, cập nhật thông tin cá nhân và tích lũy thành viên.
- Quản trị viên và nhân viên: thực hiện quản lý nội dung, đơn hàng, sản phẩm, tồn kho, khuyến mãi và quyền người dùng.

### 1.3.2. Chức năng chính

Dự án tập trung vào các chức năng cốt lõi của một hệ thống thương mại điện tử hiện đại:

- Quản lý danh mục và sản phẩm.
- Tìm kiếm, lọc và hiển thị sản phẩm theo nhiều tiêu chí.
- Giỏ hàng và đặt hàng.
- Thanh toán COD và thanh toán online qua PayOS.
- Quản lý trạng thái đơn hàng và vận chuyển.
- Quản lý tài khoản người dùng và phân quyền.
- Chương trình thành viên, ưu đãi và mã giảm giá.
- Dashboard thống kê cho quản trị.

### 1.3.3. Phạm vi công nghệ

Dự án được phát triển theo kiến trúc client-server, gồm hai phần chính:

- Frontend: React 19 + Vite + React Router + Tailwind CSS.
- Backend: Node.js + Express 5 + Prisma ORM + MySQL.

Ngoài ra, hệ thống còn tích hợp các dịch vụ hỗ trợ như:

- Supabase Storage: lưu trữ hình ảnh và tài nguyên tệp.
- PayOS: cổng thanh toán trực tuyến.
- Nodemailer: gửi email thông báo.
- JWT: xác thực người dùng.

## 1.4. Phương pháp nghiên cứu

Quá trình xây dựng dự án dựa trên phương pháp phân tích yêu cầu và phát triển theo hướng module hóa. Cụ thể:

- Nghiên cứu hệ thống thương mại điện tử hiện đại và các mô hình quản lý sản phẩm, người dùng và đơn hàng.
- Thiết kế kiến trúc hệ thống theo tầng rõ ràng: frontend, backend, cơ sở dữ liệu và dịch vụ hỗ trợ.
- Phân tích mã nguồn thực tế để xác định cấu trúc route, controller, service, schema và luồng nghiệp vụ.
- Kiểm tra chức năng theo luồng đặt hàng, thanh toán, quản trị và bảo mật.

## 1.5. Ý nghĩa khoa học và thực tiễn

SportNexus không chỉ là một sản phẩm demo mà còn có giá trị thực tiễn cao trong bối cảnh doanh nghiệp cần chuyển đổi số. Dự án này cho thấy cách một hệ thống thương mại điện tử có thể được xây dựng từ góc nhìn kỹ thuật, nghiệp vụ và vận hành.

Về mặt khoa học, dự án tích hợp nhiều khái niệm quan trọng của kỹ thuật phần mềm như: kiến trúc phân lớp, thiết kế dữ liệu quan hệ, xác thực và phân quyền, tích hợp API, và kiểm thử luồng nghiệp vụ. Về mặt thực tiễn, hệ thống có thể được mở rộng thành sản phẩm thương mại điện tử thực tế cho doanh nghiệp bán hàng thể thao.

---

# CHƯƠNG II. CƠ SỞ LÝ THUYẾT VÀ CÔNG NGHỆ CỦA HỆ THỐNG

## 2.1. Khái niệm thương mại điện tử

Thương mại điện tử là hình thức mua bán hàng hóa hoặc dịch vụ thông qua mạng Internet. Với mô hình này, khách hàng có thể tìm kiếm sản phẩm, so sánh giá, đặt hàng và thanh toán mà không cần đến trực tiếp cửa hàng. Đối với doanh nghiệp, thương mại điện tử giúp mở rộng thị trường, giảm chi phí, đồng thời nâng cao hiệu quả quản lý và chăm sóc khách hàng.

Trong bối cảnh thị trường thể thao phát triển mạnh, hệ thống thương mại điện tử cho phép doanh nghiệp tiếp cận nhiều nhóm khách hàng hơn, từ người tập gym, jogger, đến người yêu thích đồ thể thao chuyên nghiệp. Chính vì vậy, xây dựng một nền tảng bán hàng trực tuyến chuyên biệt cho lĩnh vực này là lựa chọn phù hợp và có tính ứng dụng cao.

## 2.2. Mô hình kiến trúc hệ thống

Hệ thống SportNexus được triển khai theo mô hình web full-stack với phần frontend và backend tách biệt nhưng đồng bộ về dữ liệu và nghiệp vụ. Cách tổ chức này giúp hệ thống dễ bảo trì, dễ mở rộng và dễ quản lý khi quy mô tăng trưởng.

### 2.2.1. Frontend

Frontend là phần giao diện người dùng, chạy trên trình duyệt. Nó đảm nhiệm việc hiển thị danh mục sản phẩm, khung giỏ hàng, tài khoản, thanh toán và các màn hình quản trị. Được xây dựng bằng React, frontend sử dụng các component để tách logic hiển thị thành từng phần nhỏ và dễ tái sử dụng.

### 2.2.2. Backend

Backend là nơi xử lý toàn bộ logic nghiệp vụ của hệ thống. Nó chịu trách nhiệm nhận request từ frontend, validate dữ liệu, xác thực người dùng, truy vấn cơ sở dữ liệu, và trả về kết quả dưới dạng JSON. Trong dự án này, backend được xây dựng bằng Node.js và Express để phục vụ API REST.

### 2.2.3. Cơ sở dữ liệu

Cơ sở dữ liệu của hệ thống được xây dựng theo mô hình quan hệ để đảm bảo tính nhất quán, toàn vẹn và khả năng trích xuất báo cáo. Prisma được dùng để định nghĩa và quản lý schema, giúp kết nối ứng dụng với MySQL một cách rõ ràng và dễ bảo trì.

## 2.3. Mô hình dữ liệu của hệ thống

Một hệ thống thương mại điện tử cần quản lý nhiều thực thể phức tạp. Trong SportNexus, các thực thể cốt lõi bao gồm:

- Người dùng (users)
- Vai trò và quyền (roles, permissions)
- Sản phẩm (products)
- Biến thể sản phẩm (product_variants)
- Danh mục và thương hiệu
- Đơn hàng (orders)
- Chi tiết đơn hàng (order_items)
- Thanh toán (payment_transactions)
- Hóa đơn (invoices)
- Coupon và ưu đãi
- Tồn kho và xuất nhập kho
- Vận chuyển và trạng thái giao hàng

Mô hình này cho phép hệ thống quản lý đầy đủ chuỗi nghiệp vụ từ đầu vào đến kết thúc. Một đơn hàng có thể liên kết với nhiều sản phẩm, nhiều biến thể, nhiều giao dịch thanh toán và các trạng thái theo dõi khác nhau.

## 2.4. Công nghệ chính được sử dụng

### 2.4.1. React 19 và Vite

React là thư viện JavaScript mạnh mẽ cho việc xây dựng giao diện người dùng. Vite giúp tăng tốc quá trình phát triển nhờ khả năng biên dịch nhanh và hiệu suất tốt. Cặp công nghệ này phù hợp với ứng dụng web hiện đại, có nhiều route và component phức tạp như SportNexus.

### 2.4.2. Express.js và Prisma

Express là framework Node.js giúp xây dựng API nhanh chóng, linh hoạt và dễ mở rộng. Prisma hỗ trợ thao tác với cơ sở dữ liệu theo cách rõ ràng và an toàn hơn, giúp giảm sai sót trong truy vấn dữ liệu và tối ưu việc quản lý schema.

### 2.4.3. MySQL

MySQL là cơ sở dữ liệu quan hệ được sử dụng để lưu trữ dữ liệu nghiệp vụ. Đây là lựa chọn phù hợp cho hệ thống thương mại điện tử khi cần xử lý dữ liệu lớn, tạo mối quan hệ phức tạp và phục vụ báo cáo thống kê.

### 2.4.4. JWT và phân quyền

JWT (JSON Web Token) được sử dụng để xác thực người dùng và cấp quyền truy cập cho các route hoặc chức năng cần bảo vệ. Cùng với cơ chế phân quyền theo vai trò, hệ thống có thể giới hạn quyền người dùng theo nhóm như khách hàng, nhân viên, quản lý và admin.

### 2.4.5. Supabase, PayOS và email

- Supabase Storage: lưu trữ hình ảnh, file đính kèm, dữ liệu media.
- PayOS: hỗ trợ tích hợp thanh toán trực tuyến.
- Nodemailer: gửi email như xác nhận đơn, quên mật khẩu, thông báo khuyến mãi.

Các dịch vụ này giúp hệ thống mang tính thực tiễn và gần với một sản phẩm đầy đủ ở mức demo hoặc triển khai thử nghiệm.

## 2.5. Quy trình nghiệp vụ chính

### 2.5.1. Quy trình mua hàng

Quy trình mua hàng trong SportNexus diễn ra theo thứ tự sau:

1. Khách hàng duyệt danh mục hoặc tìm kiếm sản phẩm.
2. Chọn biến thể sản phẩm phù hợp như màu sắc, kích thước, số lượng.
3. Thêm vào giỏ hàng.
4. Tiến hành thanh toán.
5. Hệ thống tạo đơn hàng và lưu lịch sử giao dịch.
6. Admin hoặc hệ thống cập nhật trạng thái đơn hàng và giao nhận.

### 2.5.2. Quy trình quản lý đơn hàng

Khi đơn hàng được tạo, dữ liệu được lưu trong các bảng như orders, order_items, payment_transactions và shipments. Quản trị viên có thể xử lý đơn theo từng giai đoạn như chờ xác nhận, đang xử lý, đang giao, hoàn thành hoặc hủy. Từng trạng thái được lưu rõ ràng để phục vụ tra cứu và báo cáo.

### 2.5.3. Quy trình quản trị

Các vai trò quản trị trong hệ thống được triển khai theo cấp độ quyền khác nhau. Admin có khả năng quản lý toàn bộ, trong khi các nhân viên có quyền được phép trên các module cụ thể như kho, sản phẩm hoặc đơn hàng. Bằng cách này, hệ thống đảm bảo rõ ràng về trách nhiệm và bảo mật dữ liệu.

---

# CHƯƠNG III. KẾT QUẢ THỰC HIỆN VÀ ĐÁNH GIÁ HỆ THỐNG

## 3.1. Kết quả xây dựng hệ thống

Dự án SportNexus đã xây dựng được một nền tảng thương mại điện tử với các chức năng cốt lõi sau:

- Giao diện public cho khách hàng để duyệt và mua hàng.
- Hệ thống quản lý tài khoản người dùng và đăng nhập.
- Tích hợp giỏ hàng, thanh toán và theo dõi đơn hàng.
- Module quản trị cho admin và nhân viên.
- Tích hợp dữ liệu sản phẩm đa biến thể và quản lý tồn kho.
- Hỗ trợ ưu đãi, coupon và chương trình thành viên.

Các chức năng này đã được triển khai theo tổ chức tách rõ giữa frontend và backend, giúp hệ thống dễ mở rộng và phù hợp với mô hình phát triển hiện đại.

## 3.2. Đánh giá chức năng chính

### 3.2.1. Giao diện người dùng

Giao diện của dự án được xây dựng theo hướng hiện đại, rõ ràng và thân thiện với người dùng. Cấu trúc route được tách theo public, auth và admin giúp hệ thống dễ tổ chức và quản lý. Về UX, người dùng có thể duyệt sản phẩm, tìm kiếm nhanh, và tiến hành đặt hàng mà không gặp khó khăn.

### 3.2.2. Backend và API

Backend cung cấp API theo kiểu REST, phục vụ cho các hoạt động chính của hệ thống. Các route được tổ chức theo module như auth, customer, management, product, order, payment. Cấu trúc này giúp hệ thống dễ kiểm tra, mục tiêu và bảo trì lâu dài.

### 3.2.3. Quản lý dữ liệu và thanh toán

Với Prisma và MySQL, dữ liệu được lưu theo mô hình quan hệ rõ ràng. Hệ thống quản lý đơn hàng, biến thể sản phẩm, transaction thanh toán và trạng thái cập nhật theo thời gian. Tích hợp PayOS cho phép phương thức thanh toán online có thể phát triển thêm trong tương lai khi môi trường thực tế sẵn sàng.

### 3.2.4. Bảo mật và phân quyền

Hệ thống áp dụng JWT và kiểm tra quyền truy cập theo từng route. Giao diện và API đều có cơ chế kiểm soát quyền nhằm ngăn người dùng không phù hợp truy cập dữ liệu nhạy cảm. Đây là một yếu tố quan trọng trong bất kỳ hệ thống thương mại điện tử nào.

## 3.3. Những hạn chế hiện tại

Mặc dù nền tảng đã xây dựng được các tính năng cốt lõi, hệ thống vẫn còn một số điểm cần hoàn thiện để tiến tới mức production thực tế:

- Luồng thanh toán online cần được kiểm thử và thực hiện đầy đủ trong môi trường chạy thật.
- Một số module quản trị chưa được mở rộng và tối ưu hoàn toàn cho quy mô lớn hơn.
- Cần tăng cường kiểm thử tự động và kiểm tra lỗi ở nhiều luồng nghiệp vụ.
- Cần bổ sung thêm báo cáo thống kê chuyên sâu và tối ưu trải nghiệm admin.

Những hạn chế này không làm giảm giá trị của dự án, mà ngược lại cho thấy hệ thống đang ở một giai đoạn phát triển rõ ràng, có khả năng nâng cấp và hoàn thiện tiếp theo.

## 3.4. Kết luận chung

SportNexus là một hệ thống thương mại điện tử thể thao được xây dựng với mục tiêu mang đến trải nghiệm mua sắm trực tuyến hiện đại và quy trình quản lý hiệu quả cho doanh nghiệp. Dự án thu thập và tích hợp nhiều yếu tố quan trọng của phần mềm chuyên nghiệp: thiết kế UI/UX, API backend, mô hình dữ liệu, quyền truy cập, thanh toán và quản trị.

Về mặt hoàn thiện, dự án đã đạt được các chức năng cốt lõi của một ứng dụng thương mại điện tử thực tế. Về mặt phát triển tiếp theo, hệ thống có tiềm năng mở rộng đáng kể trong các lĩnh vực như báo cáo doanh thu, phân tích khách hàng, tối ưu thanh toán và tích hợp vận chuyển thực tế.

---

## TÓM TẮT

SportNexus là một nền tảng thương mại điện tử thể thao, được xây dựng theo kiến trúc web hiện đại, với frontend React, backend Express, database MySQL và Prisma. Dự án đáp ứng được các nhu cầu chính của một hệ thống bán hàng trực tuyến như quản lý sản phẩm, giỏ hàng, đặt hàng, thanh toán, người dùng và quản trị. Mặc dù còn một số hạn chế trong quá trình hoàn thiện, hệ thống đã chứng minh được tính khả thi về kỹ thuật và tính ứng dụng thực tế trong thời đại chuyển đổi số.
