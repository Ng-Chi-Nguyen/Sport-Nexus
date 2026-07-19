import prisma from "../src/db/prisma.js";

const userIds = [69, 79, 65, 66, 67, 68, 70, 71, 72, 73, 74, 75, 76, 77, 78, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114];
const actionTypes = ["CREATE", "UPDATE", "DELETE", "STOCK_ADJUSTMENT"];
const entityTypes = ["Orders", "Products", "Users", "ProductVariants", "Coupons", "Brands", "Categories", "Suppliers"];
const statuses = ["SUCCESS", "FAILED"];
const ipAddresses = ["192.168.1.1", "192.168.1.100", "10.0.0.45", "172.16.0.88", "203.0.113.50", null];

const fieldMap = {
  Orders: ["status", "total_amount", "shipping_address", "payment_status"],
  Products: ["base_price", "is_active", "name", "description"],
  Users: ["full_name", "phone_number", "is_verified"],
  ProductVariants: ["stock", "price"],
  Coupons: ["discount_value", "max_discount", "usage_limit", "is_active"],
  Brands: ["name", "origin"],
  Categories: ["name", "is_active"],
  Suppliers: ["name", "contact_person", "phone"],
};

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate() {
  const now = Date.now();
  const daysAgo = randomInt(0, 60);
  const hoursAgo = randomInt(0, 23);
  const minsAgo = randomInt(0, 59);
  return new Date(now - daysAgo * 86400000 - hoursAgo * 3600000 - minsAgo * 60000);
}

function generateDetails(actionType, entityType) {
  const fields = fieldMap[entityType] || ["name", "value"];

  if (actionType === "CREATE") {
    return fields.slice(0, randomInt(1, 3)).map((f) => ({
      field: f,
      to: `${f}_value_${randomInt(1, 999)}`,
    }));
  }

  if (actionType === "DELETE") {
    const snapshot = {};
    fields.slice(0, randomInt(2, 4)).forEach((f) => {
      snapshot[f] = `${f}_old_${randomInt(1, 999)}`;
    });
    return [{ field: null, from: snapshot }];
  }

  if (actionType === "STOCK_ADJUSTMENT") {
    const qty = randomInt(-20, 50);
    return [{ field: "stock", from: randomInt(50, 200), to: randomInt(50, 200) + qty }];
  }

  // UPDATE
  return fields.slice(0, randomInt(1, 3)).map((f) => ({
    field: f,
    from: `${f}_old_${randomInt(1, 99)}`,
    to: `${f}_new_${randomInt(1, 99)}`,
  }));
}

async function main() {
  console.log("Seeding 100 system logs...");

  const logs = [];
  for (let i = 0; i < 100; i++) {
    const actionType = randomItem(actionTypes);
    const entityType = randomItem(entityTypes);
    const status = Math.random() < 0.15 ? "FAILED" : "SUCCESS"; // 15% failed

    logs.push({
      user_id: randomItem(userIds),
      action_type: actionType,
      entity_type: entityType,
      entity_id: randomInt(1, 200),
      status,
      details: status === "FAILED"
        ? [{ error: randomItem(["Validation failed", "Database constraint violation", "Insufficient permissions", "Duplicate entry"]) }]
        : generateDetails(actionType, entityType),
      ip_address: randomItem(ipAddresses),
      timestamp: randomDate(),
    });
  }

  // Insert by date (oldest first so newest is at top in listing)
  logs.sort((a, b) => a.timestamp - b.timestamp);

  // Use createMany (MySQL supports it)
  await prisma.SystemLogs.createMany({ data: logs });

  console.log(`Inserted ${logs.length} logs successfully.`);
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
