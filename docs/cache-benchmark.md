# Practical 9: caching response-time comparison

- Date: 2026-10-12
- Server: http://localhost:5000
- Tasks in the benchmark user's list: 200 (response size about 56.1 KB)
- Cache TTL: 60 seconds
- Readings per case: 5
- Node.js: v24.20.0

How the readings were taken:

- **Uncached:** the cache was cleared before every request, so each one is a cache MISS and reads from MongoDB (`X-Cache: MISS`).
- **Cached:** the cache was filled once, then every request is a cache HIT served from memory (`X-Cache: HIT`).
- Time is measured by the client from sending the request until the whole response has been received.

### GET /tasks (all tasks)

| Reading | Uncached (ms) | Cached (ms) |
|---|---|---|
| 1 | 140.2 | 15.6 |
| 2 | 113.0 | 13.2 |
| 3 | 142.1 | 5.7 |
| 4 | 131.2 | 13.6 |
| 5 | 179.5 | 17.4 |
| **Average** | **141.2** | **13.1** |
| Min | 113.0 | 5.7 |
| Max | 179.5 | 17.4 |

Cached responses were about **10.7x** faster on average.

### GET /tasks/:id (single task)

| Reading | Uncached (ms) | Cached (ms) |
|---|---|---|
| 1 | 300.9 | 17.5 |
| 2 | 63.4 | 38.4 |
| 3 | 65.7 | 4.5 |
| 4 | 40.4 | 33.5 |
| 5 | 36.1 | 12.3 |
| **Average** | **101.3** | **21.3** |
| Min | 36.1 | 4.5 |
| Max | 300.9 | 38.4 |

Cached responses were about **4.8x** faster on average.
