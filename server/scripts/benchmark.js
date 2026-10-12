// Practical 9: measure API response time WITH and WITHOUT the cache.
//
// Run the backend first (npm run dev), then in another terminal:
//   cd server
//   npm run benchmark
//
// What it does:
//   1. logs in as a dedicated benchmark user (creates it on the first run), so your
//      own tasks are never touched
//   2. makes sure that user has enough sample tasks, so the database query takes
//      long enough to measure
//   3. UNCACHED readings: clears the cache, then times GET /tasks (always a MISS)
//   4. CACHED readings: warms the cache once, then times GET /tasks (always a HIT)
//   5. repeats 3-4 for the single-task endpoint GET /tasks/:id
//   6. prints the tables and saves them to docs/cache-benchmark.md for your lab file
//
// Optional settings (environment variables):
//   API_URL=http://localhost:5000   SAMPLE_TASKS=200   READINGS=5
const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

const API_URL = process.env.API_URL || 'http://localhost:5000';
const SAMPLE_TASKS = Number(process.env.SAMPLE_TASKS) || 200;
const READINGS = Math.max(3, Number(process.env.READINGS) || 5); // the lab asks for at least 3
const EMAIL = 'cache-benchmark@example.com';
const PASSWORD = 'Benchmark123';
const OUT_FILE = path.join(__dirname, '..', '..', 'docs', 'cache-benchmark.md');

// One request. The timer stops only after the whole body has been downloaded,
// so the number is what a real client would experience.
async function api(method, urlPath, { body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const start = performance.now();
  const res = await fetch(`${API_URL}${urlPath}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  const ms = performance.now() - start;

  let data = null;
  try {
    data = JSON.parse(text);
  } catch {
    // not JSON; leave data as null
  }
  return { status: res.status, cache: res.headers.get('x-cache'), data, ms, bytes: text.length };
}

const fmt = (n) => n.toFixed(1);
const avg = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;

async function login() {
  const reg = await api('POST', '/auth/register', { body: { email: EMAIL, password: PASSWORD } });
  if (reg.status !== 201 && reg.status !== 409) {
    throw new Error(`Register failed (${reg.status}): ${JSON.stringify(reg.data)}`);
  }
  const res = await api('POST', '/auth/login', { body: { email: EMAIL, password: PASSWORD } });
  if (res.status !== 200) throw new Error(`Login failed (${res.status}): ${JSON.stringify(res.data)}`);
  return res.data.token;
}

async function ensureSampleTasks(token) {
  const existing = await api('GET', '/tasks', { token });
  const missing = SAMPLE_TASKS - existing.data.length;
  if (missing <= 0) return existing.data;

  console.log(`Creating ${missing} sample tasks (one-time setup)...`);
  const description = 'Sample task created by the Practical 9 benchmark to give the database real data to read.';
  const startNumber = existing.data.length;
  for (let i = 0; i < missing; i += 10) {
    const batch = [];
    for (let j = i; j < Math.min(i + 10, missing); j += 1) {
      batch.push(
        api('POST', '/tasks', {
          token,
          body: { title: `Benchmark task ${startNumber + j + 1}`, description, priority: 'medium' },
        }),
      );
    }
    const results = await Promise.all(batch);
    const bad = results.find((r) => r.status !== 201);
    if (bad) throw new Error(`Could not create sample task (${bad.status}): ${JSON.stringify(bad.data)}`);
  }
  return (await api('GET', '/tasks', { token })).data;
}

// Take READINGS timings of `urlPath`. If `clearFirst` is true the cache is cleared before
// every reading (uncached). Otherwise the cache is warmed once and every reading is a HIT.
async function measure(urlPath, token, cached) {
  const expected = cached ? 'HIT' : 'MISS';
  const readings = [];

  if (cached) {
    await api('DELETE', '/debug/cache', { token });
    await api('GET', urlPath, { token }); // warm-up (a MISS that fills the cache), not recorded
  }

  for (let i = 0; i < READINGS; i += 1) {
    if (!cached) await api('DELETE', '/debug/cache', { token }); // force a database read every time
    const r = await api('GET', urlPath, { token });
    if (r.status !== 200) throw new Error(`GET ${urlPath} returned ${r.status}`);
    if (r.cache === 'BYPASS') {
      throw new Error('Caching is switched off on the server (CACHE_ENABLED=false). Turn it on and restart the server.');
    }
    if (r.cache !== expected) {
      throw new Error(`Expected X-Cache: ${expected} for ${urlPath} but got ${r.cache}`);
    }
    readings.push(r.ms);
  }
  return readings;
}

function table(title, uncached, cached) {
  const lines = [`### ${title}`, '', '| Reading | Uncached (ms) | Cached (ms) |', '|---|---|---|'];
  for (let i = 0; i < READINGS; i += 1) lines.push(`| ${i + 1} | ${fmt(uncached[i])} | ${fmt(cached[i])} |`);
  lines.push(`| **Average** | **${fmt(avg(uncached))}** | **${fmt(avg(cached))}** |`);
  lines.push(`| Min | ${fmt(Math.min(...uncached))} | ${fmt(Math.min(...cached))} |`);
  lines.push(`| Max | ${fmt(Math.max(...uncached))} | ${fmt(Math.max(...cached))} |`);
  lines.push('');
  lines.push(`Cached responses were about **${fmt(avg(uncached) / avg(cached))}x** faster on average.`);
  lines.push('');
  return lines.join('\n');
}

async function main() {
  console.log(`Benchmarking ${API_URL} ...`);
  const token = await login();

  const probe = await api('GET', '/debug/cache', { token });
  if (probe.status !== 200) {
    throw new Error(
      `GET /debug/cache returned ${probe.status}. Is the server running the Practical 9 code, and is NODE_ENV not "production"?`,
    );
  }
  const settings = probe.data;

  // Warm up the connection and server so the first reading is not unfairly slow.
  await api('GET', '/auth/me', { token });

  const tasks = await ensureSampleTasks(token);
  const oneId = tasks[0]._id;
  const listBytes = (await api('GET', '/tasks', { token })).bytes;

  console.log(`Measuring GET /tasks (${tasks.length} tasks, ${READINGS} readings each)...`);
  const listUncached = await measure('/tasks', token, false);
  const listCached = await measure('/tasks', token, true);

  console.log('Measuring GET /tasks/:id ...');
  const oneUncached = await measure(`/tasks/${oneId}`, token, false);
  const oneCached = await measure(`/tasks/${oneId}`, token, true);

  const report = [
    '# Practical 9: caching response-time comparison',
    '',
    `- Date: ${new Date().toISOString().slice(0, 10)}`,
    `- Server: ${API_URL}`,
    `- Tasks in the benchmark user's list: ${tasks.length} (response size about ${(listBytes / 1024).toFixed(1)} KB)`,
    `- Cache TTL: ${settings.ttlSeconds} seconds`,
    `- Readings per case: ${READINGS}`,
    `- Node.js: ${process.version}`,
    '',
    'How the readings were taken:',
    '',
    '- **Uncached:** the cache was cleared before every request, so each one is a cache MISS and reads from MongoDB (`X-Cache: MISS`).',
    '- **Cached:** the cache was filled once, then every request is a cache HIT served from memory (`X-Cache: HIT`).',
    '- Time is measured by the client from sending the request until the whole response has been received.',
    '',
    table('GET /tasks (all tasks)', listUncached, listCached),
    table('GET /tasks/:id (single task)', oneUncached, oneCached),
  ].join('\n');

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, report);

  console.log(`\n${report}`);
  console.log(`Saved to ${path.relative(process.cwd(), OUT_FILE) || OUT_FILE}`);
}

main().catch((err) => {
  console.error(`\nBenchmark failed: ${err.message}`);
  if (err.cause?.code === 'ECONNREFUSED' || /fetch failed/.test(err.message)) {
    console.error(`Could not reach ${API_URL}. Start the backend first with "npm run dev".`);
  }
  process.exit(1);
});