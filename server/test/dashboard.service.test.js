import test from 'node:test';
import assert from 'node:assert/strict';
import { createBusinessDashboardService } from '../src/services/management/dashboard.service.js';

const toUTC = (value) => new Date(`${value}T00:00:00.000Z`);

const buildService = (orders) => {
  const db = {
    Orders: {
      findMany: async ({ where } = {}) => {
        const createdAt = where?.created_at || {};
        return orders.filter((order) => {
          const time = order.created_at.getTime();
          if (createdAt.gte && time < createdAt.gte.getTime()) return false;
          if (createdAt.lte && time > createdAt.lte.getTime()) return false;
          return true;
        });
      },
    },
  };

  return createBusinessDashboardService({ db });
};

test('getBusinessOverview aggregates business metrics from orders', async () => {
  const service = buildService([
    { total_amount: 100, final_amount: 90, status: 'Processing', payment_method: 'COD', created_at: toUTC('2026-07-01') },
    { total_amount: 200, final_amount: 180, status: 'Shipping', payment_method: 'MOMO', created_at: toUTC('2026-07-01') },
    { total_amount: 50, final_amount: 50, status: 'Delivered', payment_method: 'BANK_TRANSFER', created_at: toUTC('2026-07-02') },
    { total_amount: 70, final_amount: 60, status: 'Cancelled', payment_method: 'VNPAY', created_at: toUTC('2026-07-03') },
    { total_amount: 80, final_amount: 70, status: 'Refunded', payment_method: 'COD', created_at: toUTC('2026-07-03') },
  ]);

  const result = await service.getBusinessOverview({ from: '2026-07-01', to: '2026-07-03', group_by: 'day' });

  assert.equal(result.summary.totalRevenue, 450);
  assert.equal(result.summary.totalOrders, 5);
  assert.equal(result.summary.averageOrderValue, 90);
  assert.equal(result.summary.successRate, 20);
  assert.equal(result.summary.cancelRate, 20);
  assert.equal(result.summary.refundRate, 20);
  assert.deepEqual(result.ordersByStatus, {
    Processing: 1,
    Shipping: 1,
    Delivered: 1,
    Cancelled: 1,
    Refunded: 1,
  });
  assert.deepEqual(result.revenueByPaymentMethod, {
    COD: 160,
    BANK_TRANSFER: 50,
    MOMO: 180,
    VNPAY: 60,
    CREDIT_CARD: 0,
  });
  assert.deepEqual(result.revenueTrend, [
    { period: '2026-07-01', revenue: 270 },
    { period: '2026-07-02', revenue: 50 },
    { period: '2026-07-03', revenue: 130 },
  ]);
  assert.equal(result.meta.from, '2026-07-01');
  assert.equal(result.meta.to, '2026-07-03');
});

test('getBusinessOverview fills missing days in revenueTrend with zero revenue', async () => {
  const service = buildService([
    { total_amount: 100, final_amount: 90, status: 'Delivered', payment_method: 'COD', created_at: toUTC('2026-07-21') },
    { total_amount: 200, final_amount: 180, status: 'Delivered', payment_method: 'MOMO', created_at: toUTC('2026-07-22') },
  ]);

  const result = await service.getBusinessOverview({
    from: '2026-07-21',
    to: '2026-07-24',
    trend_from: '2026-07-21',
    trend_to: '2026-07-24',
    group_by: 'day',
  });

  assert.deepEqual(result.revenueTrend, [
    { period: '2026-07-21', revenue: 90 },
    { period: '2026-07-22', revenue: 180 },
    { period: '2026-07-23', revenue: 0 },
    { period: '2026-07-24', revenue: 0 },
  ]);
});

test('getBusinessOverview supports a separate trend date range', async () => {
  const service = buildService([
    { total_amount: 100, final_amount: 90, status: 'Processing', payment_method: 'COD', created_at: toUTC('2026-07-01') },
    { total_amount: 200, final_amount: 180, status: 'Shipping', payment_method: 'MOMO', created_at: toUTC('2026-07-02') },
    { total_amount: 50, final_amount: 50, status: 'Delivered', payment_method: 'BANK_TRANSFER', created_at: toUTC('2026-07-03') },
  ]);

  const result = await service.getBusinessOverview({
    from: '2026-07-01',
    to: '2026-07-03',
    trend_from: '2026-07-03',
    trend_to: '2026-07-03',
    group_by: 'day',
  });

  assert.equal(result.summary.totalOrders, 3);
  assert.equal(result.summary.totalRevenue, 320);
  assert.deepEqual(result.revenueTrend, [{ period: '2026-07-03', revenue: 50 }]);
});
