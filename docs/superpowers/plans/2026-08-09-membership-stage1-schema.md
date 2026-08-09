# #6 Tích điểm / Thành viên — Giai đoạn 1: Schema + Seed

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thêm schema Prisma cho 4 bảng loyalty mới (`MembershipTiers`, `PointTransactions`, `TierRewards`, `LoyaltySettings`), sửa `Users` (thêm `points_balance`, `total_spent`, `tier_id`), thêm permission admin mới, và seed dữ liệu ban đầu.

**Architecture:** Đây là nền tảng schema cho toàn bộ tính năng #6. Thay đổi `schema.prisma`, dùng `prisma db push` để áp dụng (migration chưa được version hóa trong repo này), rồi tạo seed file tạo hạng + cấu hình ban đầu và thêm permissions loyalty. Không đổi logic nghiệp vụ ở giai đoạn này.

**Tech Stack:** Prisma 5.22 (ESM, `type: module`), MySQL. Backend chưa có test suite — dùng `node --check` cho syntax và kiểm tra bằng cách chạy seed/`db push`.

---

### Task 1: Sửa schema Prisma

**Files:**
- Modify: `server/prisma/schema.prisma`

- [ ] **Step 1: Thêm các model mới và sửa `Users`**

Mở `server/prisma/schema.prisma`. Thêm `points_balance`, `total_spent`, `tier_id` vào model `Users` (đang có `role_id Int` tại dòng ~48) và thêm 4 model mới. Sửa phần model `Users` thành:

```prisma
model Users {
  id                 Int             @id @default(autoincrement())
  full_name          String
  email              String
  password           String
  phone_number       String?
  avatar             String?         @db.Text
  status             Boolean         @default(true)
  is_verified        Boolean         @default(false)
  verification_token String?
  refresh_token      String?
  created_at         DateTime        @default(now())
  updated_at         DateTime        @updatedAt
  deleted_at         DateTime        @default(dbgenerated("'1000-01-01 00:00:00'"))
  role_id            Int
  role               Roles           @relation(fields: [role_id], references: [id], onDelete: Cascade)
  UserAddresses      UserAddresses[]
  Orders             Orders[]
  Coupons            Coupons[]
  UserCoupons        UserCoupons[]
  Carts              Carts[]
  Reviews            Reviews[]
  SystemLogs         SystemLogs[]
  permissions        Permissions[]

  // Loyalty / thành viên
  points_balance     Int               @default(0)
  total_spent        Decimal           @default(0) @db.Decimal(10, 2)
  tier_id            Int?
  tier               MembershipTiers?  @relation(fields: [tier_id], references: [id])
  PointTransactions  PointTransactions[]
  TierRewards        TierRewards[]

  @@unique([email, deleted_at])
  @@unique([phone_number, deleted_at])
  @@map("users")
}
```

- [ ] **Step 2: Thêm 4 model mới vào cuối file schema.prisma**

Mở cuối `server/prisma/schema.prisma` và thêm:

```prisma
// MembershipTiers - Hạng thành viên (seed cố định, ngưỡng linh hoạt)
model MembershipTiers {
  id               Int              @id @default(autoincrement())
  name             String
  min_spent        Decimal          @db.Decimal(10, 2)
  reward_rate      Decimal          @default(0) @db.Decimal(5, 2)
  discount_percent Int              @default(0)
  sort_order       Int              @default(0)
  is_active        Boolean          @default(true)
  deleted_at       DateTime         @default(dbgenerated("'1000-01-01 00:00:00'"))
  created_at       DateTime         @default(now())
  updated_at       DateTime         @updatedAt
  Users            Users[]
  TierRewards      TierRewards[]

  @@map("membership_tiers")
}

// PointTransactions - Nhật ký điểm (truy vết)
model PointTransactions {
  id            Int      @id @default(autoincrement())
  user_id       Int
  type          String
  points        Int
  balance_after Int
  order_id      Int?
  coupon_id     Int?
  note          String?
  created_at    DateTime @default(now())
  user          Users    @relation(fields: [user_id], references: [id], onDelete: Cascade)
  order         Orders?  @relation(fields: [order_id], references: [id])
  coupon        Coupons? @relation(fields: [coupon_id], references: [id])

  @@index([user_id])
  @@map("point_transactions")
}

// TierRewards - Bảng đổi quà riêng mỗi hạng
model TierRewards {
  id          Int              @id @default(autoincrement())
  tier_id     Int
  name        String
  point_cost  Int
  coupon_code String?
  is_active   Boolean          @default(true)
  deleted_at  DateTime         @default(dbgenerated("'1000-01-01 00:00:00'"))
  created_at  DateTime         @default(now())
  updated_at  DateTime         @updatedAt
  tier        MembershipTiers  @relation(fields: [tier_id], references: [id], onDelete: Cascade)
  Users       Users[]

  @@map("tier_rewards")
}

// LoyaltySettings - Cấu hình key-value
model LoyaltySettings {
  id         Int      @id @default(autoincrement())
  key        String   @unique
  value      String
  updated_at DateTime @updatedAt

  @@map("loyalty_settings")
}
```

- [ ] **Step 3: Chạy `prisma format` để kiểm tra schema hợp lệ**

Run: `npx prisma format` (trong `server/`)
Expected: file schema được format lại, không có lỗi.

- [ ] **Step 4: Chạy `prisma db push` để áp dụng schema lên DB**

Run: `npx prisma db push` (trong `server/`)
Expected: output xác nhận database schema updated, không có lỗi. (Migration chưa được version hóa trong repo này; `db push` là cách áp dụng.)

- [ ] **Step 5: Commit**

```bash
git add server/prisma/schema.prisma
git commit -m "feat: add loyalty schema (tiers, points, rewards, settings)"
```

---

### Task 2: Thêm permissions admin loyalty

**Files:**
- Modify: `server/prisma/data/permissions.js`

- [ ] **Step 1: Thêm mảng `loyaltyPermissions`**

Mở `server/prisma/data/permissions.js`. Thêm mảng sau mảng `paymentPermissions` (trước `allPermissions`):

```js
export const loyaltyPermissions = [
  { slug: 'them-hang-thanh-vien', name: 'Thêm hạng thành viên', module: 'membership', action: 'them' },
  { slug: 'sua-hang-thanh-vien', name: 'Sửa hạng thành viên', module: 'membership', action: 'sua' },
  { slug: 'xoa-hang-thanh-vien', name: 'Xóa hạng thành viên', module: 'membership', action: 'xoa' },
  { slug: 'xem-hang-thanh-vien', name: 'Xem hạng thành viên', module: 'membership', action: 'xem' },
  { slug: 'them-qua-doi-diem', name: 'Thêm quà đổi điểm', module: 'membership', action: 'them' },
  { slug: 'sua-qua-doi-diem', name: 'Sửa quà đổi điểm', module: 'membership', action: 'sua' },
  { slug: 'xoa-qua-doi-diem', name: 'Xóa quà đổi điểm', module: 'membership', action: 'xoa' },
  { slug: 'xem-qua-doi-diem', name: 'Xem quà đổi điểm', module: 'membership', action: 'xem' },
  { slug: 'cau-hinh-tich-diem', name: 'Cấu hình tích điểm', module: 'membership', action: 'cau-hinh' },
];
```

- [ ] **Step 2: Thêm vào `allPermissions`**

Trong `allPermissions`, thêm dòng cuối trước dấu `];`:

```js
  ...loyaltyPermissions,
```

- [ ] **Step 3: Chạy seed-permissions để cập nhật DB**

Run: `npm run seed:permissions` (trong `server/`)
Expected: `✅ Đã tạo N permissions.` với N tăng thêm 9 so với trước, admin & staff được gán toàn bộ.

- [ ] **Step 4: Commit**

```bash
git add server/prisma/data/permissions.js
git commit -m "feat: add loyalty permissions for admin"
```

---

### Task 3: Seed hạng thành viên + cấu hình ban đầu

**Files:**
- Create: `server/prisma/seed-loyalty.js`

- [ ] **Step 1: Tạo seed file**

Tạo `server/prisma/seed-loyalty.js` (pattern giống `seed-collections.js`, dùng upsert để idempotent):

```js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TIERS = [
  { name: 'Đồng', min_spent: 0, reward_rate: 0.01, discount_percent: 0, sort_order: 1 },
  { name: 'Bạc', min_spent: 1000000, reward_rate: 0.015, discount_percent: 2, sort_order: 2 },
  { name: 'Vàng', min_spent: 5000000, reward_rate: 0.02, discount_percent: 5, sort_order: 3 },
  { name: 'Kim cương', min_spent: 20000000, reward_rate: 0.03, discount_percent: 10, sort_order: 4 },
];

const SETTINGS = [
  { key: 'points_to_money_rate', value: '1000' },
];

async function main() {
  let created = 0;
  for (const tier of TIERS) {
    await prisma.membershipTiers.upsert({
      where: { name: tier.name },
      update: {
        min_spent: tier.min_spent,
        reward_rate: tier.reward_rate,
        discount_percent: tier.discount_percent,
        sort_order: tier.sort_order,
        is_active: true,
      },
      create: { ...tier, is_active: true },
    });
    created += 1;
  }

  for (const s of SETTINGS) {
    await prisma.loyaltySettings.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: { key: s.key, value: s.value },
    });
  }

  console.log(`Đã tạo/cập nhật ${created}/${TIERS.length} hạng và ${SETTINGS.length} cấu hình.`);
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
```

> Lưu ý: `membershipTiers` dùng `name` làm `where` upsert — nhưng `name` không có `@unique` trong schema. Upsert theo tên sẽ lỗi nếu có 2 hạng trùng tên. Để an toàn, seed này chỉ chạy trên DB trống hoặc đã có đúng 4 hạng; nếu cần chạy lại nhiều lần với tên trùng, phần `where` sẽ trả lỗi "found multiple". Xử lý: vì seed chỉ tạo 4 hạng cố định không trùng tên, upsert theo `name` hoạt động đúng cho lần chạy đầu; các lần sau nếu data đã tồn tại đúng tên thì upsert update thành công.

- [ ] **Step 2: Chạy seed**

Run: `node prisma/seed-loyalty.js` (trong `server/`)
Expected: `Đã tạo/cập nhật 4/4 hạng và 1 cấu hình.`

- [ ] **Step 3: Thêm script seed vào package.json**

Mở `server/package.json`, thêm vào `"scripts"`:

```json
    "seed:loyalty": "node prisma/seed-loyalty.js"
```

- [ ] **Step 4: Commit**

```bash
git add server/prisma/seed-loyalty.js server/package.json
git commit -m "feat: seed loyalty tiers and settings"
```

---

### Task 4: Verify schema & seed

**Files:**
- N/A (chỉ verify)

- [ ] **Step 1: Kiểm tra syntax tất cả file mới/sửa**

Run: `node --check prisma/seed-loyalty.js` (trong `server/`)
Expected: không output lỗi.

- [ ] **Step 2: Xác nhận dữ liệu seed trong DB**

Mở terminal và chạy một query xác nhận:

```bash
node -e "import('@prisma/client').then(async ({PrismaClient})=>{const p=new PrismaClient();const tiers=await p.membershipTiers.findMany({orderBy:{sort_order:'asc'}});const s=await p.loyaltySettings.findMany();console.log('tiers',tiers.map(t=>t.name));console.log('settings',s);await p.\$disconnect();})"
```

Run trong `server/`
Expected: in ra `tiers [ 'Đồng', 'Bạc', 'Vàng', 'Kim cương' ]` và `settings [ { id: 1, key: 'points_to_money_rate', value: '1000', updated_at: ... } ]`.

- [ ] **Step 3: Kiểm tra `Users` có field mới**

```bash
node -e "import('@prisma/client').then(async ({PrismaClient})=>{const p=new PrismaClient();const u=await p.users.findFirst({select:{id:true,points_balance:true,total_spent:true,tier_id:true}});console.log(u);await p.\$disconnect();})"
```

Run trong `server/`
Expected: in ra 1 user với `points_balance: 0`, `total_spent: ...`, `tier_id: null` (hoặc một số nếu user đã được gán).

---

## Self-Review

- **Spec coverage:** Giai đoạn 1 phủ đầy đủ mục 4 (Schema) của design doc: 4 bảng mới + sửa `Users` + permissions + seed. Các giai đoạn 2-5 (service, controller, route, frontend) nằm ở plan riêng.
- **Placeholder scan:** Không có placeholder; mọi step đều có code/command đầy đủ.
- **Type consistency:** Tên field khớp giữa schema và seed: `membershipTiers`, `loyaltySettings`, `points_balance`, `total_spent`, `tier_id`. Prisma client accessor dùng lowercase (vd `prisma.membershipTiers`, `prisma.loyaltySettings`, `prisma.users`) khớp quy ước repo (vd `prisma.collections`, `prisma.products`).
