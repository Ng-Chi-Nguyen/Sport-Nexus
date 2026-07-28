import test from "node:test";
import assert from "node:assert/strict";
import {
  buildDashboardGroupParams,
  buildDashboardRangeParams,
} from "../src/utils/dashboard.utils.js";

test("buildDashboardGroupParams returns a cloned query string", () => {
  const current = new URLSearchParams("from=2026-07-01&to=2026-07-31&group_by=day");
  const next = buildDashboardGroupParams(current, "week");

  assert.equal(current.get("group_by"), "day");
  assert.equal(next.get("group_by"), "week");
  assert.equal(next.get("from"), "2026-07-01");
  assert.equal(next.get("to"), "2026-07-31");
});

test("buildDashboardRangeParams keeps group_by while changing range", () => {
  const current = new URLSearchParams("from=2026-07-01&to=2026-07-31&group_by=month");
  const next = buildDashboardRangeParams(current, "2026-06-01", "2026-06-30");

  assert.equal(current.get("from"), "2026-07-01");
  assert.equal(next.get("from"), "2026-06-01");
  assert.equal(next.get("to"), "2026-06-30");
  assert.equal(next.get("group_by"), "month");
});
