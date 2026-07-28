import test from 'node:test';
import assert from 'node:assert/strict';
import { createDashboardController } from '../src/controllers/management/dashboard.controller.js';

test('getBusinessOverview returns success payload and forwards query to service', async () => {
  let forwardedQuery = null;
  const controller = createDashboardController({
    dashboardService: {
      getBusinessOverview: async (query) => {
        forwardedQuery = query;
        return { summary: { totalRevenue: 100 } };
      },
    },
  });

  let statusCode = 0;
  let payload = null;
  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(body) {
      payload = body;
      return body;
    },
  };

  await controller.getBusinessOverview({ query: { from: '2026-07-01', to: '2026-07-03' } }, res);

  assert.deepEqual(forwardedQuery, { from: '2026-07-01', to: '2026-07-03' });
  assert.equal(statusCode, 200);
  assert.equal(payload.success, true);
  assert.equal(payload.message, 'L\u1ea5y th\u1ed1ng k\u00ea t\u1ed5ng quan kinh doanh th\u00e0nh c\u00f4ng.');
  assert.equal(payload.data.summary.totalRevenue, 100);
});
