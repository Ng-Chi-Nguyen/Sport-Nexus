# Remove Shipping System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the entire shipping fee calculation, GHN simulator, shipment tracking, and admin shipping management from the application.

**Architecture:** Remove shipping-related routes, controllers, services, validators, API clients, pages, and components. Keep `shipping_address`, `shipping_name`, `shipping_phone` in Orders for delivery purposes. Remove `Shipments` model from Prisma schema.

**Tech Stack:** Express.js, Prisma, React, TanStack Query, React Router

---

## Task 1: Remove Backend Shipping Services

**Files:**
- Delete: `server/src/services/shipping/ghnSimulator.service.js`
- Delete: `server/src/services/shipping/shippingZone.data.js`
- Delete: `server/src/services/management/shipping.service.js`

- [ ] **Step 1: Delete GHN Simulator service**

```bash
rm server/src/services/shipping/ghnSimulator.service.js
rm server/src/services/shipping/shippingZone.data.js
```

- [ ] **Step 2: Delete Management shipping service**

```bash
rm server/src/services/management/shipping.service.js
```

- [ ] **Step 3: Delete empty shipping directory if exists**

```bash
rmdir server/src/services/shipping 2>/dev/null || true
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: remove backend shipping services"
```

---

## Task 2: Remove Backend Shipping Controllers & Routes

**Files:**
- Delete: `server/src/controllers/customer/shipping.controller.js`
- Delete: `server/src/controllers/management/shipping.controller.js`
- Delete: `server/src/routes/customer/shipping.route.js`
- Delete: `server/src/routes/management/shipping.route.js`
- Delete: `server/src/validators/customer/shipping.validator.js`
- Modify: `server/src/routes/index.route.js:35-37,61,75`

- [ ] **Step 1: Delete shipping controllers**

```bash
rm server/src/controllers/customer/shipping.controller.js
rm server/src/controllers/management/shipping.controller.js
```

- [ ] **Step 2: Delete shipping routes**

```bash
rm server/src/routes/customer/shipping.route.js
rm server/src/routes/management/shipping.route.js
```

- [ ] **Step 3: Delete shipping validator**

```bash
rm server/src/validators/customer/shipping.validator.js
```

- [ ] **Step 4: Remove shipping imports and routes from index.route.js**

Edit `server/src/routes/index.route.js`:
- Remove line 35: `import customerShippingRoute from "./customer/shipping.route.js";`
- Remove line 37: `import managementShippingRoute from "./management/shipping.route.js";`
- Remove line 61: `app.use(\`${api_prefix_v1}management/shipping/\`, managementShippingRoute)`
- Remove line 75: `app.use(\`${api_prefix_v1}customer/shipping/\`, customerShippingRoute)`

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: remove backend shipping controllers and routes"
```

---

## Task 3: Remove Shipment Creation from Order Service

**Files:**
- Modify: `server/src/services/customer/order.service.js:4,10-13,232-250`

- [ ] **Step 1: Remove GHN simulator import**

Edit `server/src/services/customer/order.service.js`:
- Remove line 4: `import { createShipmentForOrder } from "../shipping/ghnSimulator.service.js";`

- [ ] **Step 2: Remove shipping fields from destructuring**

Edit `server/src/services/customer/order.service.js` line 10-13:
```javascript
// BEFORE:
let { total_amount, status, shipping_address, payment_method,
    payment_status, discount_amount, final_amount, coupon_code, user_email, items,
    shipping_name, shipping_phone, province_name, ward_name, weight_grams, service_type,
    points_discount_amount } = orderData;

// AFTER:
let { total_amount, status, shipping_address, payment_method,
    payment_status, discount_amount, final_amount, coupon_code, user_email, items,
    points_discount_amount } = orderData;
```

- [ ] **Step 3: Remove shipment creation block**

Edit `server/src/services/customer/order.service.js` lines 232-250:
```javascript
// REMOVE THIS ENTIRE BLOCK:
// Tự động tạo vận đơn giả lập nếu có thông tin giao hàng
let shipment = null;
if (shipping_name && shipping_phone && province_name) {
    shipment = await createShipmentForOrder({
        order: newOrder,
        data: {
            recipient_name: shipping_name,
            recipient_phone: shipping_phone,
            province_name,
            ward_name: ward_name || "",
            detail_address: shipping_address,
            weight_grams,
            service_type,
        },
        client: tx,
    });
}

return { ...newOrder, shipment };

// REPLACE WITH:
return newOrder;
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: remove shipment creation from order service"
```

---

## Task 4: Remove Shipping Fields from Order Validator

**Files:**
- Modify: `server/src/validators/customer/order.validator.js:28-33`

- [ ] **Step 1: Remove shipping-related fields from createOrder validator**

Edit `server/src/validators/customer/order.validator.js`:
```javascript
// REMOVE THESE LINES (28-33):
shipping_name: Joi.string().trim().allow(null).default(null),
shipping_phone: Joi.string().trim().allow(null).default(null),
province_name: Joi.string().trim().allow(null).default(null),
ward_name: Joi.string().trim().allow(null).default(null),
weight_grams: Joi.number().integer().min(1).max(50000).default(500),
service_type: Joi.string().valid('FAST', 'ECONOMY').default('FAST'),
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: remove shipping fields from order validator"
```

---

## Task 5: Remove Shipments Model from Prisma Schema

**Files:**
- Modify: `server/prisma/schema.prisma:395-423`

- [ ] **Step 1: Remove Shipments model**

Edit `server/prisma/schema.prisma`:
```prisma
// REMOVE THIS ENTIRE MODEL (lines ~395-423):
model Shipments {
  id               Int      @id @default(autoincrement())
  order_id         Int
  order            Orders   @relation(fields: [order_id], references: [id], onDelete: Cascade)
  tracking_code    String   @unique
  service_type     String   @default("FAST")
  status           String   @default("RECEIVED")
  weight_grams     Int      @default(500)
  cod_amount       Decimal  @default(0) @db.Decimal(10, 2)
  shipping_fee     Decimal  @default(0) @db.Decimal(10, 2)
  cod_fee          Decimal  @default(0) @db.Decimal(10, 2)
  insurance_fee    Decimal  @default(0) @db.Decimal(10, 2)
  total_fee        Decimal  @default(0) @db.Decimal(10, 2)
  estimated_delivery DateTime
  delivered_at     DateTime?
  recipient_name   String
  recipient_phone  String
  province_name    String
  ward_name        String
  detail_address   String
  timeline         Json
  created_at       DateTime @default(now())
  updated_at       DateTime @updatedAt

  @@index([order_id])
  @@map("shipments")
}
```

- [ ] **Step 2: Remove Shipments relation from Orders model**

Edit `server/prisma/schema.prisma` in the Orders model:
```prisma
// REMOVE THIS LINE:
Shipments           Shipments[]
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: remove Shipments model from Prisma schema"
```

---

## Task 6: Remove Frontend Shipping API Clients

**Files:**
- Delete: `client/src/api/customer/shippingApi.jsx`
- Delete: `client/src/api/management/shippingApi.jsx`

- [ ] **Step 1: Delete shipping API files**

```bash
rm client/src/api/customer/shippingApi.jsx
rm client/src/api/management/shippingApi.jsx
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: remove frontend shipping API clients"
```

---

## Task 7: Remove Admin Shipping Page & Routes

**Files:**
- Delete: `client/src/pages/Admin/shipping/index.jsx`
- Modify: `client/src/routes/adminRoutes.jsx:44,245`
- Modify: `client/src/constants/menu.jsx:30-33`

- [ ] **Step 1: Delete admin shipping page**

```bash
rm -rf client/src/pages/Admin/shipping
```

- [ ] **Step 2: Remove shipping lazy import from adminRoutes.jsx**

Edit `client/src/routes/adminRoutes.jsx`:
- Remove line 44: `const ShippingPage = lazy(() => import("@/pages/Admin/shipping/index.jsx"));`

- [ ] **Step 3: Remove shipping route from adminRoutes.jsx**

Edit `client/src/routes/adminRoutes.jsx`:
- Remove line 245: `{ path: "shipping", element: <ShippingPage /> },`

- [ ] **Step 4: Remove shipping menu item from menu.jsx**

Edit `client/src/constants/menu.jsx`:
```javascript
// REMOVE THESE LINES (30-33):
{
  path: `${prefix}/shipping`,
  label: "shipping",
  iconName: "Truck",
},
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: remove admin shipping page and routes"
```

---

## Task 8: Remove Tracking Page

**Files:**
- Delete: `client/src/pages/Tracking/index.jsx`
- Modify: `client/src/routes/webRoute.jsx:45,160-163`
- Modify: `client/src/constants/order.jsx:39-47`

- [ ] **Step 1: Delete tracking page**

```bash
rm -rf client/src/pages/Tracking
```

- [ ] **Step 2: Remove tracking route from webRoute.jsx**

Edit `client/src/routes/webRoute.jsx`:
- Remove line 45: `const TrackingPage = lazy(() => import("@/pages/Tracking"));`
- Remove lines 160-163:
```javascript
{
  path: "tra-cuu-don",
  element: <TrackingPage />,
},
```

- [ ] **Step 3: Remove SHIPPING_STATUS_LABELS from order.jsx**

Edit `client/src/constants/order.jsx`:
```javascript
// REMOVE THESE LINES (39-47):
// Nhãn Tiếng Việt dịch trạng thái vận đơn (tra cứu)
export const SHIPPING_STATUS_LABELS = {
  RECEIVED: "Đã tiếp nhận đơn",
  PICKED_UP: "Đã lấy hàng",
  IN_TRANSIT: "Đang vận chuyển",
  OUT_FOR_DELIVERY: "Đang giao",
  DELIVERED: "Đã giao thành công",
  CANCELLED: "Đã huỷ",
};
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: remove tracking page and shipping status labels"
```

---

## Task 9: Remove Shipping Fee from Checkout

**Files:**
- Modify: `client/src/pages/Checkout/index.jsx:9,58,153-185,188-189,197,201-206,349-350,385`

- [ ] **Step 1: Remove shippingApi import**

Edit `client/src/pages/Checkout/index.jsx`:
- Remove line 9: `import shippingApi from "@/api/customer/shippingApi";`

- [ ] **Step 2: Remove shippingEstimate state**

Edit `client/src/pages/Checkout/index.jsx`:
- Remove line 58: `const [shippingEstimate, setShippingEstimate] = useState(null);`

- [ ] **Step 3: Remove defaultWeight memo**

Edit `client/src/pages/Checkout/index.jsx`:
- Remove lines 153-156:
```javascript
const defaultWeight = useMemo(
  () => items.reduce((sum, item) => sum + (item.quantity || 1) * 500, 0),
  [items],
);
```

- [ ] **Step 4: Remove shipping calculation useEffect**

Edit `client/src/pages/Checkout/index.jsx`:
- Remove lines 158-185 (the entire useEffect for shippingApi.calculate)

- [ ] **Step 5: Remove shippingFee and update grandTotal**

Edit `client/src/pages/Checkout/index.jsx`:
```javascript
// BEFORE:
const hasShippingAddress = Boolean(selectedProvinceName && items.length > 0);
const shippingFee = hasShippingAddress ? shippingEstimate?.totalFee || 0 : 0;
const grandTotal = finalAmount + shippingFee;

// AFTER:
const grandTotal = finalAmount;
```

- [ ] **Step 6: Remove shipping fields from orderPayload**

Edit `client/src/pages/Checkout/index.jsx` in orderPayload:
```javascript
// REMOVE THESE FIELDS from orderPayload:
shipping_name: recipientName.trim() || null,
shipping_phone: recipientPhone.trim() || null,
province_name: selectedProvinceName || null,
ward_name: selectedWardName || null,
weight_grams: defaultWeight,
service_type: "FAST",
```

- [ ] **Step 7: Remove shippingFee from OrderSummary props**

Edit `client/src/pages/Checkout/index.jsx`:
- Remove lines 349-350:
```javascript
shippingFee={shippingFee}
shippingEstimate={shippingEstimate}
```

- [ ] **Step 8: Remove shippingFee from ConfirmModal data**

Edit `client/src/pages/Checkout/index.jsx`:
- Remove line 385: `shippingFee,`

- [ ] **Step 9: Remove trackingCode from OrderSuccess**

Edit `client/src/pages/Checkout/index.jsx`:
- Remove line 294: `trackingCode={orderResult?.shipment?.tracking_code}`

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: remove shipping fee calculation from checkout"
```

---

## Task 10: Remove Shipping Fee from Checkout Components

**Files:**
- Modify: `client/src/pages/Checkout/components/OrderSummary.jsx:15-16,103-123,128`
- Modify: `client/src/pages/Checkout/components/ConfirmModal.jsx:15,126-129,134`

- [ ] **Step 1: Remove shipping props from OrderSummary**

Edit `client/src/pages/Checkout/components/OrderSummary.jsx`:
- Remove lines 15-16 from props:
```javascript
shippingFee = 0,
shippingEstimate = null,
```

- [ ] **Step 2: Remove shipping fee display from OrderSummary**

Edit `client/src/pages/Checkout/components/OrderSummary.jsx`:
- Remove lines 103-123:
```javascript
<div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
  <span>{t("shipping_fee")}</span>
  <span className="text-right">
    {shippingFee ? (
      <>
        {formatCurrency(shippingFee)}
        {shippingEstimate?.estimateDays && (
          <span className="block text-[10px] text-slate-400 dark:text-slate-500">
            {t("shipping_estimate", {
              days: shippingEstimate.estimateDays,
            })}
          </span>
        )}
      </>
    ) : (
      <span className="text-[11px]">
        {t("select_province_prompt", "Chọn tỉnh để tính phí")}
      </span>
    )}
  </span>
</div>
```

- [ ] **Step 3: Update total display in OrderSummary**

Edit `client/src/pages/Checkout/components/OrderSummary.jsx`:
```javascript
// BEFORE:
{formatCurrency(finalAmount + shippingFee)}

// AFTER:
{formatCurrency(finalAmount)}
```

- [ ] **Step 4: Remove shippingFee from ConfirmModal data destructuring**

Edit `client/src/pages/Checkout/components/ConfirmModal.jsx`:
- Remove line 15: `shippingFee = 0,`

- [ ] **Step 5: Remove shipping fee display from ConfirmModal**

Edit `client/src/pages/Checkout/components/ConfirmModal.jsx`:
- Remove lines 126-129:
```javascript
<div className="flex justify-between text-slate-600 dark:text-slate-400">
  <span>{t("shipping_fee")}</span>
  <span>{shippingFee ? formatCurrency(shippingFee) : "—"}</span>
</div>
```

- [ ] **Step 6: Update total display in ConfirmModal**

Edit `client/src/pages/Checkout/components/ConfirmModal.jsx`:
```javascript
// BEFORE:
{formatCurrency(finalAmount + shippingFee)}

// AFTER:
{formatCurrency(finalAmount)}
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: remove shipping fee from checkout components"
```

---

## Task 11: Verify Build & Lint

- [ ] **Step 1: Run frontend build**

```bash
npm run build --prefix client
```

Expected: Build succeeds with no errors

- [ ] **Step 2: Run frontend lint**

```bash
npm run lint --prefix client
```

Expected: No lint errors related to removed shipping code

- [ ] **Step 3: Verify no broken imports**

```bash
grep -r "shippingApi\|ghnSimulator\|ShippingPage\|TrackingPage" client/src/ server/src/ || echo "No broken imports found"
```

Expected: No output (no broken imports)

- [ ] **Step 4: Commit final cleanup if needed**

```bash
git add -A
git commit -m "chore: verify shipping system removal"
```

---

## Summary of Changes

### Backend (Server)
- **Deleted:** 8 files (services, controllers, routes, validator)
- **Modified:** 3 files (index.route.js, order.service.js, order.validator.js, schema.prisma)

### Frontend (Client)
- **Deleted:** 5 files (API clients, admin page, tracking page)
- **Modified:** 6 files (adminRoutes, webRoute, menu, Checkout, OrderSummary, ConfirmModal, order constants)

### Database
- **Removed:** `Shipments` model from Prisma schema
- **Kept:** `shipping_address`, `shipping_name`, `shipping_phone` in Orders for delivery purposes
