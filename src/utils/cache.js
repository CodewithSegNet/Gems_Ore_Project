/**
 * Lightweight sessionStorage cache with TTL.
 * - Data is scoped to the browser tab (cleared on close).
 * - Each entry stores { data, ts } so we can enforce a TTL.
 * - All errors are silently swallowed (private / Safari incognito block storage).
 */

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in ms

/**
 * Read a cached value. Returns null if missing or expired.
 * @param {string} key
 * @returns {any|null}
 */
export const getCached = (key) => {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) {
      sessionStorage.removeItem(key);
      return null;
    }
    return data;
  } catch {
    return null;
  }
};

/**
 * Store a value in cache with current timestamp.
 * @param {string} key
 * @param {any} data
 */
export const setCache = (key, data) => {
  try {
    sessionStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
  } catch {
    // Quota exceeded or private mode — fail silently
  }
};

/**
 * Remove a specific cache entry.
 * @param {string} key
 */
export const clearCache = (key) => {
  try {
    sessionStorage.removeItem(key);
  } catch {}
};

/**
 * Remove all gem_* cache entries (e.g. after a cart checkout or auth change).
 */
export const clearAllProductCache = () => {
  try {
    Object.keys(sessionStorage)
      .filter((k) => k.startsWith("gem_"))
      .forEach((k) => sessionStorage.removeItem(k));
  } catch {}
};
