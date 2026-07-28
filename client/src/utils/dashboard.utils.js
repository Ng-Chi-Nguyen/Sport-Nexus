export function buildDashboardRangeParams(searchParams, nextFrom, nextTo) {
  const next = new URLSearchParams(searchParams?.toString() || "");

  if (nextFrom) next.set("from", nextFrom);
  else next.delete("from");

  if (nextTo) next.set("to", nextTo);
  else next.delete("to");

  return next;
}

export function buildDashboardGroupParams(searchParams, groupBy) {
  const next = new URLSearchParams(searchParams?.toString() || "");
  next.set("group_by", groupBy);
  return next;
}
