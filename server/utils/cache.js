// Practical 9: shared in-memory cache module (node-cache).
//
// Why a wrapper instead of using node-cache directly in the controllers?
//  - one place decides the cache KEYS, so reads and invalidation can never disagree
//  - one place counts hits and misses (supplementary: debug endpoint)
//  - one switch (CACHE_ENABLED=false) turns caching off for the "uncached" readings
const NodeCache = require('node-cache');

// ---- Settings (from server/.env, with safe defaults) ----
const enabled = process.env.CACHE_ENABLED !== 'false';
const parsedTtl = Number.parseInt(process.env.CACHE_TTL, 10);
const ttl = Number.isInteger(parsedTtl) && parsedTtl > 0 ? parsedTtl : 60; // seconds

// useClones:false -> store/return the SAME object instead of deep-copying it every time.
// That is faster, and safe because we only cache plain query results and never mutate them.
const store = new NodeCache({ stdTTL: ttl, checkperiod: 120, useClones: false });

// Hit / miss counters, kept separately for the two kinds of cached response.
const counters = {
  all: { hits: 0, misses: 0 }, // GET /tasks
  one: { hits: 0, misses: 0 }, // GET /tasks/:id
};

// ---- Keys ----
// The lab uses ONE global key ('all_tasks'). That is only correct when every user
// shares the same data. Our tasks belong to individual users (Practical 7), so a
// global key would show user A's tasks to user B. Each key therefore includes the user id.
const prefix = (userId) => `tasks:${userId}:`;
const allKey = (userId) => `${prefix(userId)}all`;
// Lowercased so "ABC..." and "abc..." (same ObjectId) can never become two cache
// entries, which would let one of them go stale after an update.
const oneKey = (userId, taskId) => `${prefix(userId)}one:${String(taskId).toLowerCase()}`;

// ---- Operations ----

// Returns the cached value, or undefined on a miss (or when caching is disabled).
function get(key, type) {
  if (!enabled) return undefined;
  const value = store.get(key);
  if (value === undefined) counters[type].misses += 1;
  else counters[type].hits += 1;
  return value;
}

function set(key, value) {
  if (enabled) store.set(key, value);
}

// Remove specific keys after a successful write.
function del(...keys) {
  store.del(keys);
}

// Remove every cached entry that belongs to one user. Returns how many were removed.
function flushUser(userId) {
  const mine = store.keys().filter((k) => k.startsWith(prefix(userId)));
  store.del(mine);
  return mine.length;
}

function stats() {
  const hits = counters.all.hits + counters.one.hits;
  const misses = counters.all.misses + counters.one.misses;
  const total = hits + misses;
  return {
    enabled,
    ttlSeconds: ttl,
    hits,
    misses,
    hitRate: total === 0 ? null : Number((hits / total).toFixed(3)),
    cachedKeys: store.keys().length,
    byType: {
      allTasks: { ...counters.all },
      singleTask: { ...counters.one },
    },
  };
}

module.exports = { enabled, allKey, oneKey, get, set, del, flushUser, stats };