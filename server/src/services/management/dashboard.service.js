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
