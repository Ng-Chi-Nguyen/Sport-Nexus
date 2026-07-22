# Cart Feature Design

## Overview
Giỏ hàng kết hợp localStorage (guest) + server-side (đã login) với cơ chế sync khi đăng nhập.

## Server

### Prisma Schema
```prisma
model Carts {
    id         Int        @id @default(autoincrement())
    user_id    Int        @unique
    user       Users      @relation(fields: [user_id], references: [id])
    created_at DateTime   @default(now())
    updated_at DateTime   @updatedAt
    items      CartItems[]
    @@map("carts")
}

model CartItems {
    id                Int             @id @default(autoincrement())
    cart_id           Int
    cart              Carts           @relation(fields: [cart_id], references: [id], onDelete: Cascade)
    product_variant_id Int
    product_variant   ProductVariants @relation(fields: [product_variant_id], references: [id])
    quantity          Int             @default(1)
    created_at        DateTime        @default(now())
    @@unique([cart_id, product_variant_id])
    @@map("cartitems")
}
```

### API (prefix: `/api/v1/customer/cart`)
- `GET /` — Lấy giỏ hàng (từ token user)
- `POST /items` — Thêm item `{ product_variant_id, quantity }`
- `PUT /items/:id` — Cập nhật số lượng `{ quantity }`
- `DELETE /items/:id` — Xóa item
- `POST /sync` — Đồng bộ từ localStorage `{ items: [{ product_variant_id, quantity }] }`

Tất cả endpoint đều yêu cầu `verifyToken`.

## Client

### CartContext + useCart hook
- `CartProvider` bọc ở App
- State: items array `[{ cart_item_id, product_variant_id, quantity, product, variant }]`
- localStorage key: `cart`
- Actions: ADD_ITEM, REMOVE_ITEM, UPDATE_QTY, CLEAR, SET_ITEMS
- Exports: `useCart()` → `{ items, count, addItem, removeItem, updateQty, clearCart, totalAmount, selectedItems, toggleSelect, selectAll, selectedIds }`

### Sync flow
1. Init: load localStorage → state
2. If user logged in: fetch server cart → merge (variant trùng thì cộng dồn quantity) → set state → save localStorage
3. On add/update/delete: mutate state + localStorage + gọi API (nếu logged in)
4. On login event: đọc local items → POST /sync → fetch server cart mới → replace state + clear localStorage

### Cart Page (`/gio-hang`)
- Route: `webRoute.jsx` → `{ path: "gio-hang", element: <CartPage /> }`
- Components:
  - CartItem: ảnh, tên, thuộc tính, đơn giá, số lượng (+/-), thành tiền, checkbox, nút xóa
  - CartSummary: tổng tiền, giảm giá, tạm tính, phí ship (dummy), nút "Thanh toán"
  - CouponInput: tái sử dụng `useCoupon`
- Empty state: icon + "Giỏ hàng trống" + "Mua sắm ngay" button

### Add to Cart wiring
- `ProductCard`: `onClick` nút "Thêm vào giỏ" → `addItem(variant_id, 1)`
- `ActionBar`: `onAddToCart` hiện tại `() => {}` → gọi `addItem`

### Header
- Icon giỏ hàng link đến `/gio-hang`
- Badge hiển thị `useCart().count`

## Checkout integration
- CartPage "Thanh toán" → navigate(`/thanh-toan`, { state: { items: selectedItems } })
- Giữ nguyên logic Checkout hiện tại (nhận items từ location.state)
