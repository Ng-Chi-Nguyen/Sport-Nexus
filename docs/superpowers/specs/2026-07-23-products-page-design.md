# Products Page — SportNexus

## Overview

Trang `/san-pham` hiển thị danh sách sản phẩm đầy đủ với bộ lọc chi tiết. Đây là điểm đến khi người dùng bấm "Xem thêm" ở Home index. Trang được thiết kế chi tiết hơn (nhiều thông tin hơn) so với trang admin products.

## Route

- `/san-pham` — Products listing page
- Query params là single source of truth cho filter state

## Features

| Feature         | Mô tả                                                                   |
| --------------- | ----------------------------------------------------------------------- |
| Tìm kiếm        | Input search, debounce 400ms, cập nhật URL params                       |
| Lọc danh mục    | Dropdown select danh mục                                                |
| Lọc thương hiệu | Checkbox list thương hiệu                                               |
| Lọc khoảng giá  | 2 input: price_min, price_max                                           |
| Sắp xếp         | Sort dropdown: Mới nhất, Bán chạy, Giá thấp→cao, Giá cao→thấp, Đánh giá |
| Phân trang      | Pagination component, 12 items/page                                     |
| Product Grid    | Grid 3 cột, card có: ảnh, brand, tên, rating (sao + count), giá         |

## Backend API

### `GET /api/v1/home/products`

Tạo service + controller + route mới trong `server/src/services/web/`, `server/src/controllers/web/`, `server/src/routes/web/`.

**Params:**

```
page, search, sort, category_id, brand_id, price_min, price_max, limit
```

**Sort values:** `newest`, `best-selling`, `price-asc`, `price-desc`, `rating`

**Response:**

```json
{
  "success": true,
  "data": {
    "products": [{ id, name, slug, base_price, thumbnail, category: {id, name}, brand: {id, name, logo}, avg_rating, total_reviews, min_price, created_at }],
    "pagination": { totalItems, totalPages, currentPage, itemsPerPage }
  },
  "categories": [{ id, name, slug, product_count }],
  "brands": [{ id, name, logo, product_count }]
}
```

## Frontend Components

### New files:

| File                                                     | Nhiệm vụ                                                  |
| -------------------------------------------------------- | --------------------------------------------------------- |
| `client/src/pages/Products/index.jsx`                    | Page chính, state management, layout grid + sidebar       |
| `client/src/pages/Products/components/FilterSidebar.jsx` | Search, category, brand, price range, sort, clear filters |
| `client/src/pages/Products/components/ProductGrid.jsx`   | Grid 3 cột ProductCard                                    |
| `client/src/loaders/web/productsLoader.js`               | Fetch API dựa trên URL params                             |

### Modified files:

| File                                                  | Thay đổi                                                       |
| ----------------------------------------------------- | -------------------------------------------------------------- |
| `client/src/routes/webRoute.jsx`                      | Thêm route `"san-pham"` → ProductsPage (lazy) + loader         |
| `client/src/components/ui/seeMore.jsx`                | Thêm prop `to` dùng `useNavigate()` hoặc render `<Link>`       |
| `client/src/pages/Home/components/specialSale.jsx`    | Pass `to="/san-pham?sort=best-selling"` vào SeeMore            |
| `client/src/pages/Home/components/newArrivals.jsx`    | Pass `to="/san-pham?sort=newest"` vào SeeMore                  |
| `client/src/pages/Home/components/productSection.jsx` | Pass `to="/san-pham?category_id=X"` vào SeeMore + "Xem tất cả" |

## Data Flow

```
User action → URL search params change → React Router re-render →
Loader reads params → fetch /api/v1/home/products?params →
Parse response → render grid + pagination
```

URL params là single source of truth, pattern giống admin products page hiện tại (dùng `useSearchParams` + `useLoaderData`).

## Layout

```
+------------------+----------------------------------------+
|                  |                                        |
|   FILTER SIDEBAR |          PRODUCT GRID (3 cols)         |
|   - Search       |   +------+  +------+  +------+        |
|   - Category     |   | Card |  | Card |  | Card |        |
|   - Brand        |   +------+  +------+  +------+        |
|   - Price Range  |   +------+  +------+  +------+        |
|   - Sort         |   | Card |  | Card |  | Card |        |
|   - Clear        |   +------+  +------+  +------+        |
|                  |   +------+  +------+  +------+        |
|                  |   | Card |  | Card |  | Card |        |
|                  |   +------+  +------+  +------+        |
|                  |                                        |
|                  |         PAGINATION                      |
+------------------+----------------------------------------+
```

## Product Card (chi tiết hơn admin)

- Ảnh thumbnail (aspect-ratio 1:1)
- Thương hiệu (text uppercase nhỏ, màu xanh)
- Tên sản phẩm (bold, 2 dòng)
- Đánh giá (5 sao + số lượng reviews)
- Giá bán (large, green, bold)
