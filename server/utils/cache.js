
const NodeCache = require('node-cache');

const enabled = process.env.CACHE_ENABLED !== 'false';
const parsedTtl = Number.parseInt(process.env.CACHE_TTL, 10);
const ttl = Number.isInteger(parsedTtl) && parsedTtl > 0 ? parsedTtl : 60; // seconds

const store = new NodeCache({ stdTTL: ttl, checkperiod: 120, useClones: false });

const counters = {
  all: { hits: 0, misses: 0 }, // GET /tasks
  one: { hits: 0, misses: 0 }, // GET /tasks/:id
};
const prefix = (userId) => `tasks:${userId}:`;
const allKey = (userId) => `${prefix(userId)}all`;

const oneKey = (userId, taskId) => `${prefix(userId)}one:${String(taskId).toLowerCase()}`;
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