const STORAGE_KEY = "sportnexus_recent_views";
const MAX_ITEMS = 12;

const read = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((id) => Number(id))
      .filter((id) => Number.isInteger(id))
      .slice(0, MAX_ITEMS);
  } catch {
    return [];
  }
};

const write = (ids) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids.slice(0, MAX_ITEMS)));
  } catch {
    // storage unavailable (private mode / quota)
  }
};

export const getRecentViewIds = () => read();

export const addToViewHistory = (id) => {
  const n = Number(id);
  if (!Number.isInteger(n) || n <= 0) return;
  write([n, ...read().filter((x) => x !== n)]);
};
