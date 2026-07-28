# Dashboard Refactor Design

## Mục tiêu
Chia nhỏ file `Dashboard/dashboard.jsx` (416 dòng, monolithic) thành cấu trúc folder/file theo section, giúp dễ bảo trì và mở rộng thêm 10 mục thống kê.

## Kiến trúc

### Cấu trúc folder

```
client/src/
  utils/
    dashboard.utils.js          # helpers URLSearchParams (chuyển từ Dashboard/)
  pages/Admin/Dashboard/
    dashboard.jsx               # page chính - mỏng, chỉ orchestrate tabs
    components/
      Card.jsx                  # reusable card wrapper
      KpiCard.jsx               # KPI stat card
      ProgressBar.jsx           # horizontal progress bar
      FilterBar.jsx             # date range + preset buttons + group by
      TabNav.jsx                # tab navigation (switching sections)
    business/                   # Mục 1 - Tổng quan kinh doanh
      BusinessOverview.jsx      # composition: lắp các component con
      OverviewCards.jsx         # 6 KPI card
      RevenueChart.jsx          # biểu đồ doanh thu
      StatusBreakdown.jsx       # đơn hàng theo trạng thái
      PaymentBreakdown.jsx      # doanh thu theo payment method
    customers/                  # Mục 2 - Khách hàng (todo)
    products/                   # Mục 3 - Sản phẩm (todo)
    inventory/                  # Mục 4 - Kho (todo)
    orders/                     # Mục 5 - Đơn hàng (todo)
    promotions/                 # Mục 6 - Khuyến mãi (todo)
    suppliers/                  # Mục 7 - NCC + nhập hàng (todo)
    reviews/                    # Mục 8 - Review (todo)
    system/                     # Mục 9 - Hệ thống (todo)
    overview/                   # Mục 10 - Dashboard tổng hợp (todo)
```

### Data flow
- `dashboard.jsx` nhận data từ loader, render `FilterBar` + `TabNav` + section active
- Mỗi section (VD: `BusinessOverview`) nhận data đã lọc từ parent qua props
- Mỗi component con trong section là **presentational** — không gọi API, không biết đến loader
- `FilterBar` thay đổi `searchParams` → React Router revalidate → loader chạy lại

### Dependencies
- `TabNav` sử dụng `useSearchParams` để lưu `?tab=...`
- `FilterBar` sử dụng `buildDashboardRangeParams` / `buildDashboardGroupParams` từ `utils/dashboard.utils.js`

### Scope Phase 1
Chỉ refactor code hiện tại (mục 1 - Tổng quan kinh doanh + shared components) qua cấu trúc mới. Không thêm section mới.
