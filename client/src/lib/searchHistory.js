const STORAGE_KEY = "sportnexus_search_history";
const MAX_ITEMS = 10;

const read = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => {
        if (typeof item === "string") return { term: item.trim(), ts: 0 };
        if (item && typeof item.term === "string") {
          return { term: item.term.trim(), ts: Number(item.ts) || 0 };
        }
        return null;
      })
      .filter((item) => item && item.term)
      .slice(0, MAX_ITEMS);
  } catch {
    return [];
  }
};

const write = (items) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)));
  } catch {
    // storage unavailable (private mode / quota)
  }
};

export const getSearchHistory = () => read();

export const addToSearchHistory = (term) => {
  const q = (term || "").trim();
  if (!q) return;
  write([{ term: q, ts: Date.now() }, ...read().filter((item) => item.term !== q)]);
};

export const removeFromSearchHistory = (term) => {
  write(read().filter((item) => item.term !== term));
};

export const clearSearchHistory = () => {
  write([]);
};

const LAST_TERM_KEY = "sportnexus_last_search_term";
const LAST_TERM_TTL = 30 * 60 * 1000;

export const recordLastSearchTerm = (term) => {
  const q = (term || "").trim();
  if (!q) return;
  try {
    sessionStorage.setItem(
      LAST_TERM_KEY,
      JSON.stringify({ term: q, ts: Date.now() }),
    );
  } catch {
    // storage unavailable
  }
};

export const getLastSearchTerm = () => {
  try {
    const raw = sessionStorage.getItem(LAST_TERM_KEY);
    if (!raw) return null;
    const { term, ts } = JSON.parse(raw);
    if (!term || Date.now() - ts > LAST_TERM_TTL) return null;
    return term;
  } catch {
    return null;
  }
};

export const clearLastSearchTerm = () => {
  try {
    sessionStorage.removeItem(LAST_TERM_KEY);
  } catch {
    // storage unavailable
  }
};
