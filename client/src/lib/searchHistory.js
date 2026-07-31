const STORAGE_KEY = "sportnexus_search_history";
const MAX_ITEMS = 10;

const read = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((t) => typeof t === "string" && t.trim()) : [];
  } catch {
    return [];
  }
};

const write = (terms) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(terms.slice(0, MAX_ITEMS)));
  } catch {
    // storage unavailable (private mode / quota)
  }
};

export const getSearchHistory = () => read();

export const addToSearchHistory = (term) => {
  const q = (term || "").trim();
  if (!q) return;
  write([q, ...read().filter((t) => t !== q)]);
};

export const removeFromSearchHistory = (term) => {
  write(read().filter((t) => t !== term));
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
