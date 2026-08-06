import prisma from '../../db/prisma.js';

const ORDER_STATUSES = ['Processing', 'Shipping', 'Delivered', 'Cancelled', 'Refunded'];
const PAYMENT_METHODS = ['COD', 'BANK_TRANSFER', 'MOMO', 'VNPAY', 'CREDIT_CARD'];

const money = (value) => Number(Number(value || 0).toFixed(2));
const percent = (part, total) => (total ? Number(((part / total) * 100).toFixed(2)) : 0);

const parseDate = (value, endOfDay = false) => {
  if (!value) return null;
  const suffix = endOfDay ? 'T23:59:59.999Z' : 'T00:00:00.000Z';
  const date = new Date(`${value}${suffix}`);
  return Number.isNaN(date.getTime()) ? null : date;
};

const startOfDayUtc = (date) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));
const endOfDayUtc = (date) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999));

const buildFallbackRange = (days = 30) => {
  const today = new Date();
  const end = endOfDayUtc(today);
  const start = startOfDayUtc(new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate() - (days - 1))));

  return { from: start, to: end };
};

const normalizeRange = ({ from, to } = {}, fallback = buildFallbackRange()) => {
  const parsedFrom = parseDate(from, false);
  const parsedTo = parseDate(to, true);
  const end = parsedTo || fallback.to;
  const start = parsedFrom || startOfDayUtc(new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate() - 29)));

  return {
    from: start,
    to: end,
    fromLabel: start.toISOString().slice(0, 10),
    toLabel: end.toISOString().slice(0, 10),
  };
};

const toPeriodStart = (date, groupBy) => {
  const current = new Date(date);
  if (groupBy === 'week') {
    const day = current.getUTCDay();
    const diff = (day + 6) % 7;
    current.setUTCDate(current.getUTCDate() - diff);
    return startOfDayUtc(current);
  }
  if (groupBy === 'month') {
    return new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth(), 1, 0, 0, 0, 0));
  }
  return startOfDayUtc(current);
};

const addPeriod = (date, groupBy) => {
  const current = new Date(date);
  if (groupBy === 'week') {
    current.setUTCDate(current.getUTCDate() + 7);
    return current;
  }
  if (groupBy === 'month') {
    current.setUTCMonth(current.getUTCMonth() + 1);
    return new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth(), 1, 0, 0, 0, 0));
  }
  current.setUTCDate(current.getUTCDate() + 1);
  return current;
};

const getPeriodLabel = (date, groupBy) => toPeriodStart(date, groupBy).toISOString().slice(0, 10);

const buildPeriodLabels = (from, to, groupBy) => {
  const labels = [];
  let cursor = toPeriodStart(from, groupBy);
  const end = toPeriodStart(to, groupBy);

  while (cursor <= end) {
    labels.push(cursor.toISOString().slice(0, 10));
    cursor = addPeriod(cursor, groupBy);
  }

  return labels;
};

const createZeroMap = (keys) => keys.reduce((acc, key) => {
  acc[key] = 0;
  return acc;
}, {});

const selectOrderFields = {
  total_amount: true,
  final_amount: true,
  status: true,
  payment_method: true,
  created_at: true,
  payment_status: true,
};

export const createBusinessDashboardService = ({ db = prisma } = {}) => ({
  async getProductOverview(query = {}) {
    const range = normalizeRange({ from: query.from, to: query.to });
    const groupBy = ['day', 'week', 'month'].includes(String(query.group_by || 'day'))
      ? String(query.group_by || 'day')
      : 'day';

    const hasDateFilter = Boolean(query.from || query.to);
    const productWhere = hasDateFilter ? { created_at: { gte: range.from, lte: range.to } } : {};
    const [products, orderItems, reviews, images, variants, newProducts] = await Promise.all([
      db.Products.findMany({ select: { id: true, name: true, is_active: true, base_price: true, created_at: true, category_id: true, supplier_id: true, brand_id: true } }),
      db.OrderItems.findMany({ select: { quantity: true, price_at_purchase: true, product_variant: { select: { product_id: true } } } }),
      db.Reviews.findMany({ select: { rating: true, product_id: true } }),
      db.ProductImages.findMany({ select: { product_id: true } }),
      db.ProductVariants.findMany({ select: { product_id: true } }),
      db.Products.findMany({ where: productWhere, select: { created_at: true }, orderBy: { created_at: 'asc' } }),
    ]);

    const activeProducts = products.filter((p) => p.is_active).length;
    const inactiveProducts = products.length - activeProducts;

    const productsWithImages = new Set(images.map((i) => i.product_id));
    const productsWithVariants = new Set(variants.map((v) => v.product_id));
    const noImageProducts = products.filter((p) => !productsWithImages.has(p.id)).length;
    const noVariantProducts = products.filter((p) => !productsWithVariants.has(p.id)).length;

    const productRevenues = {};
    const productSold = {};
    for (const item of orderItems) {
      const pid = item.product_variant.product_id;
      const rev = Number(item.price_at_purchase) * item.quantity;
      productRevenues[pid] = money((productRevenues[pid] || 0) + rev);
      productSold[pid] = (productSold[pid] || 0) + item.quantity;
    }

    const productReviews = {};
    for (const r of reviews) {
      if (!productReviews[r.product_id]) productReviews[r.product_id] = [];
      productReviews[r.product_id].push(r.rating);
    }

    const productDetails = (id) => products.find((p) => p.id === id);

    const sellingList = Object.entries(productSold)
      .map(([pid, qty]) => ({ productId: Number(pid), name: productDetails(Number(pid))?.name || '', totalSold: qty, revenue: productRevenues[Number(pid)] || 0 }));
    const revenueList = Object.entries(productRevenues)
      .map(([pid, rev]) => ({ productId: Number(pid), name: productDetails(Number(pid))?.name || '', revenue: rev, totalSold: productSold[Number(pid)] || 0 }));

    const allProductsForWorst = products.map((p) => ({
      productId: p.id, name: p.name, totalSold: productSold[p.id] || 0, revenue: productRevenues[p.id] || 0,
    }));

    const topSelling = [...sellingList].sort((a, b) => b.totalSold - a.totalSold).slice(0, 15);
    const topRevenue = [...revenueList].sort((a, b) => b.revenue - a.revenue).slice(0, 15);
    const worstSelling = [...allProductsForWorst].sort((a, b) => a.totalSold - b.totalSold).slice(0, 15);
    const lowestRevenue = [...allProductsForWorst].sort((a, b) => a.revenue - b.revenue).slice(0, 15);

    const reviewedProducts = Object.entries(productReviews)
      .map(([pid, ratings]) => ({
        productId: Number(pid),
        name: productDetails(Number(pid))?.name || '',
        reviewCount: ratings.length,
        avgRating: Number((ratings.reduce((s, r) => s + r, 0) / ratings.length).toFixed(2)),
      }));

    const sortedByReviewCount = [...reviewedProducts].sort((a, b) => b.reviewCount - a.reviewCount);
    const mostReviewed = sortedByReviewCount.slice(0, 30);
    const leastReviewed = [...sortedByReviewCount].reverse().slice(0, 15);

    const sortedByRating = [...reviewedProducts].filter((p) => p.reviewCount >= 1).sort((a, b) => b.avgRating - a.avgRating);
    const highestRated = sortedByRating.slice(0, 15);
    const lowestRated = [...sortedByRating].reverse().slice(0, 15);
    const ratingExtremes = {
      highest: sortedByRating[0] || null,
      lowest: sortedByRating.length > 0 ? sortedByRating[sortedByRating.length - 1] : null,
    };

    const categories = {};
    const brands = {};
    const suppliers = {};
    const catSold = {};
    const brandSold = {};
    const supSold = {};
    for (const p of products) {
      categories[p.category_id] = (categories[p.category_id] || 0) + 1;
      brands[p.brand_id] = (brands[p.brand_id] || 0) + 1;
      suppliers[p.supplier_id] = (suppliers[p.supplier_id] || 0) + 1;
      const sold = productSold[p.id] || 0;
      catSold[p.category_id] = (catSold[p.category_id] || 0) + sold;
      brandSold[p.brand_id] = (brandSold[p.brand_id] || 0) + sold;
      supSold[p.supplier_id] = (supSold[p.supplier_id] || 0) + sold;
    }

    const [catNames, brandNames, supNames] = await Promise.all([
      db.Categories.findMany({ select: { id: true, name: true } }),
      db.Brands.findMany({ select: { id: true, name: true } }),
      db.Suppliers.findMany({ select: { id: true, name: true } }),
    ]);

    const byCategory = catNames.map((c) => ({ name: c.name, count: categories[c.id] || 0, soldCount: catSold[c.id] || 0 })).filter((c) => c.count > 0);
    const byBrand = brandNames.map((b) => ({ name: b.name, count: brands[b.id] || 0, soldCount: brandSold[b.id] || 0 })).filter((b) => b.count > 0);
    const bySupplier = supNames.map((s) => ({ name: s.name, count: suppliers[s.id] || 0, soldCount: supSold[s.id] || 0 })).filter((s) => s.count > 0);

    const trendFrom = hasDateFilter ? range.from : toPeriodStart(newProducts[0]?.created_at || range.from, groupBy);
    const trendTo = hasDateFilter ? range.to : toPeriodStart(newProducts[newProducts.length - 1]?.created_at || range.to, groupBy);
    const trendMap = new Map();
    for (const p of newProducts) {
      const period = getPeriodLabel(p.created_at, groupBy);
      trendMap.set(period, (trendMap.get(period) || 0) + 1);
    }
    const newProductTrend = buildPeriodLabels(trendFrom, trendTo, groupBy).map((period) => ({
      period,
      count: trendMap.get(period) || 0,
    }));

    return {
      summary: {
        totalProducts: products.length,
        activeProducts,
        inactiveProducts,
        noImageProducts,
        noVariantProducts,
      },
      newProductTrend,
      topSelling,
      topRevenue,
      worstSelling,
      lowestRevenue,
      mostReviewed,
      leastReviewed,
      highestRated,
      lowestRated,
      ratingExtremes,
      distribution: {
        categories: byCategory,
        brands: byBrand,
        suppliers: bySupplier,
      },
      meta: {
        from: range.fromLabel,
        to: range.toLabel,
        group_by: groupBy,
      },
    };
  },

  async getCouponOverview() {
    const coupons = await db.Coupons.findMany();

    const totalUsage = coupons.reduce((sum, c) => sum + c.usage_count, 0);

    return {
      summary: {
        totalCoupons: coupons.length,
        activeCoupons: coupons.filter((c) => c.is_active).length,
        inactiveCoupons: coupons.filter((c) => !c.is_active).length,
        totalUsage,
      },
      coupons: coupons.map((c) => ({
        id: c.id,
        code: c.code,
        discount_value: Number(c.discount_value),
        discount_type: c.discount_type,
        max_discount: c.max_discount ? Number(c.max_discount) : null,
        min_order_value: c.min_order_value ? Number(c.min_order_value) : null,
        usage_limit: c.usage_limit,
        usage_count: c.usage_count,
        remaining: c.usage_limit - c.usage_count,
        usageRate: percent(c.usage_count, c.usage_limit),
        is_active: c.is_active,
        start_date: c.start_date,
        end_date: c.end_date,
      })),
    };
  },

  async getOrderOverview(query = {}) {
    const range = normalizeRange({ from: query.from, to: query.to });
    const groupBy = ['day', 'week', 'month'].includes(String(query.group_by || 'day'))
      ? String(query.group_by || 'day')
      : 'day';

    const orders = await db.Orders.findMany({
      where: { created_at: { gte: range.from, lte: range.to } },
      select: {
        id: true, total_amount: true, final_amount: true, status: true,
        payment_method: true, payment_status: true, created_at: true,
        usersId: true, user_email: true, coupon_code: true, discount_amount: true,
      },
    });

    const recentOrders = await db.Orders.findMany({
      orderBy: { created_at: 'desc' },
      take: 20,
      select: {
        id: true, total_amount: true, final_amount: true, status: true,
        payment_method: true, payment_status: true, created_at: true,
        usersId: true, user_email: true,
      },
    });

    const [orderItems, products] = await Promise.all([
      db.OrderItems.findMany({
        where: { order: { created_at: { gte: range.from, lte: range.to } } },
        select: {
          quantity: true, price_at_purchase: true, order_id: true,
          product_variant: { select: { product_id: true } },
        },
      }),
      db.Products.findMany({ select: { id: true, name: true } }),
    ]);

    const productMap = {};
    for (const p of products) productMap[p.id] = p.name;

    const orderStatuses = {};
    const paymentMethods = {};
    const paymentStatuses = {};
    let totalDiscount = 0;
    let withCoupon = 0;
    let withoutCoupon = 0;
    for (const o of orders) {
      orderStatuses[o.status] = (orderStatuses[o.status] || 0) + 1;
      paymentMethods[o.payment_method] = (paymentMethods[o.payment_method] || 0) + 1;
      paymentStatuses[o.payment_status] = (paymentStatuses[o.payment_status] || 0) + 1;
      totalDiscount += Number(o.discount_amount || 0);
      if (o.coupon_code) withCoupon++;
      else withoutCoupon++;
    }

    const totalOrders = orders.length;
    const couponRate = percent(withCoupon, totalOrders);

    const newOrdersTrendMap = {};
    for (const o of orders) {
      const period = getPeriodLabel(o.created_at, groupBy);
      newOrdersTrendMap[period] = (newOrdersTrendMap[period] || 0) + 1;
    }
    const newOrdersTrend = buildPeriodLabels(range.from, range.to, groupBy).map((period) => ({
      period,
      count: newOrdersTrendMap[period] || 0,
    }));

    const productSalesMap = {};
    for (const item of orderItems) {
      const pid = item.product_variant.product_id;
      if (!productSalesMap[pid]) productSalesMap[pid] = { totalQuantity: 0, totalRevenue: 0 };
      productSalesMap[pid].totalQuantity += item.quantity;
      productSalesMap[pid].totalRevenue += Number(item.price_at_purchase) * item.quantity;
    }
    const orderProductsSummary = Object.entries(productSalesMap)
      .map(([pid, stats]) => ({
        productId: Number(pid),
        productName: productMap[Number(pid)] || '',
        totalQuantity: stats.totalQuantity,
        totalRevenue: money(stats.totalRevenue),
      }))
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 20);

    const deliveryTrendMap = {};
    for (const o of orders) {
      const period = getPeriodLabel(o.created_at, groupBy);
      if (!deliveryTrendMap[period]) deliveryTrendMap[period] = { total: 0, delivered: 0 };
      deliveryTrendMap[period].total++;
      if (o.status === 'Delivered') deliveryTrendMap[period].delivered++;
    }
    const deliverySuccessTrend = buildPeriodLabels(range.from, range.to, groupBy).map((period) => {
      const d = deliveryTrendMap[period] || { total: 0, delivered: 0 };
      return {
        period,
        total: d.total,
        delivered: d.delivered,
        successRate: percent(d.delivered, d.total),
      };
    });

    return {
      summary: {
        totalOrders,
        processing: orderStatuses['Processing'] || 0,
        shipping: orderStatuses['Shipping'] || 0,
        delivered: orderStatuses['Delivered'] || 0,
        cancelled: orderStatuses['Cancelled'] || 0,
        refunded: orderStatuses['Refunded'] || 0,
      },
      ordersByStatus: Object.entries(orderStatuses).map(([status, count]) => ({ status, count })),
      paymentMethods: Object.entries(paymentMethods).map(([method, count]) => ({ method, count })),
      paymentStatuses: Object.entries(paymentStatuses).map(([st, count]) => ({ status: st, count })),
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        total: money(o.total_amount),
        finalAmount: money(o.final_amount),
        status: o.status,
        paymentMethod: o.payment_method,
        paymentStatus: o.payment_status,
        userEmail: o.user_email,
        createdAt: o.created_at,
      })),
      couponStats: {
        totalOrders,
        withCoupon,
        withoutCoupon,
        couponRate,
        totalDiscount: money(totalDiscount),
      },
      newOrdersTrend,
      orderProductsSummary,
      deliverySuccessTrend,
      meta: { from: range.fromLabel, to: range.toLabel, group_by: groupBy },
    };
  },

  async getInventoryOverview(query = {}) {
    const range = normalizeRange({ from: query.from, to: query.to });
    const groupBy = ['day', 'week', 'month'].includes(String(query.group_by || 'day'))
      ? String(query.group_by || 'day')
      : 'day';

    const [stockAgg, recentMovements, movementTypeCounts, rangeMovements] = await Promise.all([
      db.ProductVariants.aggregate({
        _sum: { stock: true },
        _avg: { price: true },
        _count: { id: true },
      }),
      db.StockMovements.findMany({ orderBy: { created_at: 'desc' }, take: 50, select: { id: true, variant_id: true, type: true, quantity_change: true, reason: true, created_at: true } }),
      db.StockMovements.groupBy({ by: ['type'], _count: { id: true } }),
      db.StockMovements.findMany({
        where: { created_at: { gte: range.from, lte: range.to } },
        select: { type: true, quantity_change: true, created_at: true },
      }),
    ]);

    const totalStock = stockAgg._sum.stock || 0;
    const totalVariants = stockAgg._count.id || 0;
    const avgPrice = stockAgg._avg.price || 0;
    const stockValue = money(Number(totalStock) * Number(avgPrice));

    const movementCountByType = {};
    for (const m of movementTypeCounts) {
      movementCountByType[m.type] = m._count.id;
    }

    const movementTrendMap = {};
    for (const m of rangeMovements) {
      const period = getPeriodLabel(m.created_at, groupBy);
      if (!movementTrendMap[period]) movementTrendMap[period] = { IN: 0, OUT: 0, ADJUSTMENT: 0 };
      movementTrendMap[period][m.type] += Math.abs(m.quantity_change);
    }
    const movementTrend = buildPeriodLabels(range.from, range.to, groupBy).map((period) => ({
      period,
      ...(movementTrendMap[period] || { IN: 0, OUT: 0, ADJUSTMENT: 0 }),
    }));

    return {
      summary: {
        totalStock,
        totalVariants,
        stockValue,
      },
      recentMovements: recentMovements.map((m) => ({ ...m, quantity_change: Number(m.quantity_change) })),
      movementCountByType,
      movementTrend,
      meta: { from: range.fromLabel, to: range.toLabel, group_by: groupBy },
    };
  },

  async getSupplierOverview() {
    const [suppliers, products, purchaseOrders] = await Promise.all([
      db.Suppliers.findMany({ select: { id: true, name: true, email: true, phone: true, contact_person: true, location_data: true } }),
      db.Products.findMany({ select: { id: true, name: true, supplier_id: true } }),
      db.PurchaseOrders.findMany({ select: { id: true, supplier_id: true, status: true, total_cost: true, order_date: true } }),
    ]);

    const productsBySupplier = {};
    for (const p of products) {
      if (!productsBySupplier[p.supplier_id]) productsBySupplier[p.supplier_id] = [];
      productsBySupplier[p.supplier_id].push(p.name);
    }
    const ordersBySupplier = {};
    for (const po of purchaseOrders) {
      if (!ordersBySupplier[po.supplier_id]) ordersBySupplier[po.supplier_id] = [];
      ordersBySupplier[po.supplier_id].push(po);
    }

    return {
      summary: {
        totalSuppliers: suppliers.length,
        totalPurchaseOrders: purchaseOrders.length,
        totalPurchaseCost: money(purchaseOrders.reduce((sum, po) => sum + Number(po.total_cost), 0)),
      },
      suppliers: suppliers.map((s) => ({
        ...s,
        productCount: (productsBySupplier[s.id] || []).length,
        productNames: productsBySupplier[s.id] || [],
        orderCount: (ordersBySupplier[s.id] || []).length,
        totalOrderCost: money((ordersBySupplier[s.id] || []).reduce((sum, po) => sum + Number(po.total_cost), 0)),
      })),
    };
  },

  async getReviewOverview() {
    const [reviews, products] = await Promise.all([
      db.Reviews.findMany({ select: { id: true, rating: true, is_hidden: true, user_id: true, product_id: true, created_at: true, comment: true } }),
      db.Products.findMany({ select: { id: true, name: true } }),
    ]);

    const productMap = {};
    for (const p of products) productMap[p.id] = p.name;

    const ratingDist = {};
    for (const r of reviews) {
      ratingDist[r.rating] = (ratingDist[r.rating] || 0) + 1;
    }
    const avgRating = reviews.length ? Number((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(2)) : 0;

    return {
      summary: {
        totalReviews: reviews.length,
        avgRating,
        visibleReviews: reviews.filter((r) => !r.is_hidden).length,
        hiddenReviews: reviews.filter((r) => r.is_hidden).length,
      },
      ratingDistribution: Object.entries(ratingDist).map(([rating, count]) => ({ rating: Number(rating), count })),
      recentReviews: [...reviews].sort((a, b) => b.created_at - a.created_at).slice(0, 20).map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        is_hidden: r.is_hidden,
        user_id: r.user_id,
        product_id: r.product_id,
        productName: productMap[r.product_id] || '',
        created_at: r.created_at,
      })),
    };
  },

  async getSystemOverview() {
    const [logs, users] = await Promise.all([
      db.SystemLogs.findMany({
        orderBy: { timestamp: 'desc' }, take: 50,
        select: { id: true, user_id: true, action_type: true, entity_type: true, entity_id: true, details: true, timestamp: true },
      }),
      db.Users.findMany({ select: { id: true, full_name: true, email: true } }),
    ]);

    const userMap = {};
    for (const u of users) userMap[u.id] = { full_name: u.full_name, email: u.email };

    const actionCounts = {};
    for (const log of logs) {
      if (log.action_type) actionCounts[log.action_type] = (actionCounts[log.action_type] || 0) + 1;
    }

    return {
      summary: {
        totalLogs: logs.length,
        uniqueUsers: new Set(logs.filter((l) => l.user_id).map((l) => l.user_id)).size,
      },
      actionTypes: Object.entries(actionCounts).map(([type, count]) => ({ type, count })),
      recentLogs: logs.map((l) => ({
        id: l.id,
        user_id: l.user_id,
        userName: userMap[l.user_id]?.full_name || 'N/A',
        userEmail: userMap[l.user_id]?.email || '',
        action_type: l.action_type,
        entity_type: l.entity_type,
        entity_id: l.entity_id,
        details: l.details,
        created_at: l.timestamp,
      })),
    };
  },

  async getCustomerOverview(query = {}) {
    const range = normalizeRange({ from: query.from, to: query.to });
    const groupBy = ['day', 'week', 'month'].includes(String(query.group_by || 'day'))
      ? String(query.group_by || 'day')
      : 'day';

    const [
      totalUsers,
      verifiedUsers,
      unverifiedUsers,
      activeUsers,
      blockedUsers,
      ordersWithUsers,
      rangeUsers,
    ] = await Promise.all([
      db.Users.count(),
      db.Users.count({ where: { is_verified: true } }),
      db.Users.count({ where: { is_verified: false } }),
      db.Users.count({ where: { status: true } }),
      db.Users.count({ where: { status: false } }),
      db.Orders.groupBy({
        by: ['usersId'],
        _sum: { final_amount: true },
        _count: { id: true },
        where: {
          usersId: { not: null },
          created_at: { gte: range.from, lte: range.to },
        },
      }),
      db.Users.findMany({
        where: { created_at: { gte: range.from, lte: range.to } },
        select: { created_at: true },
      }),
    ]);

    const usersWithOrders = ordersWithUsers.length;
    const repeatBuyers = ordersWithUsers.filter((o) => o._count.id > 1).length;
    const repeatPurchaseRate = percent(repeatBuyers, usersWithOrders);
    const topCustomerCandidates = ordersWithUsers
      .map((o) => ({
        userId: o.usersId,
        totalSpent: money(o._sum.final_amount),
        orderCount: o._count.id,
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);

    const topCustomerIds = topCustomerCandidates.map((c) => c.userId);
    let userDetailMap = {};
    if (topCustomerIds.length > 0) {
      const userDetails = await db.Users.findMany({
        where: { id: { in: topCustomerIds } },
        select: { id: true, full_name: true, email: true },
      });
      for (const u of userDetails) userDetailMap[u.id] = u;
    }
    const topCustomers = topCustomerCandidates.map((c) => ({
      ...c,
      fullName: userDetailMap[c.userId]?.full_name || 'N/A',
      email: userDetailMap[c.userId]?.email || '',
    }));

    const trendMap = new Map();
    for (const user of rangeUsers) {
      const period = getPeriodLabel(user.created_at, groupBy);
      trendMap.set(period, (trendMap.get(period) || 0) + 1);
    }
    const newUserTrend = buildPeriodLabels(range.from, range.to, groupBy).map((period) => ({
      period,
      count: trendMap.get(period) || 0,
    }));

    return {
      summary: {
        totalUsers,
        verifiedUsers,
        unverifiedUsers,
        activeUsers,
        blockedUsers,
        usersWithOrders,
        repeatBuyers,
        oneTimeBuyers: usersWithOrders - repeatBuyers,
        repeatPurchaseRate,
      },
      newUserTrend,
      topCustomers,
      meta: {
        from: range.fromLabel,
        to: range.toLabel,
        group_by: groupBy,
      },
    };
  },

  async getBusinessOverview(query = {}) {
    const baseRange = normalizeRange({ from: query.from, to: query.to });
    const revenueRange = normalizeRange({
      from: query.revenue_from || query.from,
      to: query.revenue_to || query.to,
    }, baseRange);
    const trendRange = normalizeRange({
      from: query.trend_from || query.from,
      to: query.trend_to || query.to,
    }, baseRange);
    const paymentRange = normalizeRange({
      from: query.payment_from || query.from,
      to: query.payment_to || query.to,
    }, baseRange);
    const groupBy = ['day', 'week', 'month'].includes(String(query.group_by || 'day'))
      ? String(query.group_by || 'day')
      : 'day';

    const [baseOrders, trendOrders, paymentOrders] = await Promise.all([
      db.Orders.findMany({
        where: { created_at: { gte: baseRange.from, lte: baseRange.to } },
        select: selectOrderFields,
      }),
      db.Orders.findMany({
        where: { created_at: { gte: trendRange.from, lte: trendRange.to } },
        select: selectOrderFields,
      }),
      db.Orders.findMany({
        where: { created_at: { gte: paymentRange.from, lte: paymentRange.to } },
        select: selectOrderFields,
      }),
    ]);

    const totalOrders = baseOrders.length;
    const totalRevenue = money(baseOrders.reduce((sum, order) => sum + Number(order.final_amount || 0), 0));
    const delivered = baseOrders.filter((order) => order.status === 'Delivered').length;
    const cancelled = baseOrders.filter((order) => order.status === 'Cancelled').length;
    const refunded = baseOrders.filter((order) => order.status === 'Refunded').length;

    const ordersByStatus = createZeroMap(ORDER_STATUSES);
    for (const order of baseOrders) {
      if (Object.prototype.hasOwnProperty.call(ordersByStatus, order.status)) {
        ordersByStatus[order.status] += 1;
      }
    }

    const revenueByPaymentMethod = createZeroMap(PAYMENT_METHODS);
    for (const order of paymentOrders) {
      if (Object.prototype.hasOwnProperty.call(revenueByPaymentMethod, order.payment_method)) {
        revenueByPaymentMethod[order.payment_method] += Number(order.final_amount || 0);
      }
    }
    for (const key of PAYMENT_METHODS) {
      revenueByPaymentMethod[key] = money(revenueByPaymentMethod[key]);
    }

    const trendMap = new Map();
    for (const order of trendOrders) {
      const period = getPeriodLabel(order.created_at, groupBy);
      trendMap.set(period, money((trendMap.get(period) || 0) + Number(order.final_amount || 0)));
    }

    const revenueTrend = buildPeriodLabels(trendRange.from, trendRange.to, groupBy).map((period) => ({
      period,
      revenue: trendMap.get(period) || 0,
    }));

    return {
      summary: {
        totalRevenue,
        totalOrders,
        averageOrderValue: money(totalOrders ? totalRevenue / totalOrders : 0),
        successRate: percent(delivered, totalOrders),
        cancelRate: percent(cancelled, totalOrders),
        refundRate: percent(refunded, totalOrders),
      },
      ordersByStatus,
      revenueTrend,
      revenueByPaymentMethod,
      meta: {
        from: baseRange.fromLabel,
        to: baseRange.toLabel,
        revenue_from: revenueRange.fromLabel,
        revenue_to: revenueRange.toLabel,
        trend_from: trendRange.fromLabel,
        trend_to: trendRange.toLabel,
        payment_from: paymentRange.fromLabel,
        payment_to: paymentRange.toLabel,
        group_by: groupBy,
      },
    };
  },
});

const businessDashboardService = createBusinessDashboardService();

export default businessDashboardService;
