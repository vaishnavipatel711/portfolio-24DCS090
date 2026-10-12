# Vaishnavi | Student Portfolio (ITUE301 Practicals 1-9)

One portfolio web app that contains all nine practicals.

| Practical | Where it lives |
|---|---|
| 1. Components + props | `src/components/` (Header, About, Skills, Footer), data passed as props from `App.jsx` |
| 2. State + routing | React Router v6 in `main.jsx` / `App.jsx`; `NavBar.jsx`; `pages/Contact.jsx`; dark mode + 404 |
| 3. API integration | `pages/Projects.jsx` (GitHub API, loading, error, retry, search, star count) |
| 4. Express REST API | `server/` (routes, logger, JSON check, ID check, 404, global error handler) |
| 5. MongoDB + Mongoose | `server/models/Task.js` (validation, defaults, priority enum, trim) |
| 6. Full stack | `src/api.js` + `pages/Tasks.jsx` (CRUD, toasts, delete confirmation) |
| 7. Authentication | `server/middleware/auth.js`, `validate.js`, `controllers/authController.js`, `models/User.js`; frontend `pages/Login.jsx`, `Register.jsx`, `components/ProtectedRoute.jsx` |
| 8. Code splitting | `React.lazy` + `Suspense` in `src/App.jsx` and `src/pages/Projects.jsx` (pages download only when first visited) |
| 9. Caching | `server/utils/cache.js` (node-cache), `server/controllers/taskController.js` (cache check + invalidation), `server/routes/debug.js`, `server/scripts/benchmark.js` |

## Routes (frontend)

| Path | Page |
|---|---|
| `/` | Home (About + Skills) |
| `/projects` | Hardcoded projects + live GitHub repositories |
| `/tasks` | Task manager (login required) |
| `/contact` | Controlled form with live character count |
| `/login`, `/register` | Authentication |
| `*` | 404 Not Found |

## Backend API

| Method and path | Auth | Purpose |
|---|---|---|
| `POST /auth/register` | public | Create a user (password hashed with bcrypt) |
| `POST /auth/login` | public | Verify password, return a JWT (expires in 1 hour) |
| `GET /auth/me` | token | Return the logged-in user's details |
| `GET /tasks`, `GET /tasks/:id` | token | Read your own tasks |
| `POST /tasks` | token | Create a task (validated) |
| `PUT /tasks/:id`, `DELETE /tasks/:id` | token | Update / delete your own task |
| `GET /debug/cache` | token | Cache hit/miss counters and settings (not mounted when `NODE_ENV=production`) |
| `DELETE /debug/cache` | token | Clear your own cached entries, so the next read is a guaranteed MISS |

Protected requests need the header `Authorization: Bearer <token>`.
`GET /tasks` and `GET /tasks/:id` reply with an `X-Cache` header: `HIT` (served from memory), `MISS` (read from MongoDB, then cached) or `BYPASS` (caching switched off).

## Caching (Practical 9)

The backend caches read responses in memory with `node-cache` (`server/utils/cache.js`).

- **Cached:** `GET /tasks` (list) and, separately, `GET /tasks/:id` (single task). A 404 is never cached.
- **Key per user:** keys look like `tasks:<userId>:all` and `tasks:<userId>:one:<taskId>`. The lab uses one global key, but tasks belong to individual users here, so a global key would show one user's tasks to another user.
- **Invalidation:** after a successful write only, `POST` clears the list key, and `PUT` / `DELETE` clear the list key and that task's own key. Failed or invalid writes change nothing, so they clear nothing.
- **TTL:** 60 seconds by default, as a safety net. Invalidation keeps the data correct; the TTL only limits how long an entry can live.
- **Settings in `server/.env`:** `CACHE_TTL` (seconds) and `CACHE_ENABLED` (`false` turns caching off for the uncached readings). Restart the server after changing them.
- **Known limitations:** the cache lives in one process's memory, so it is lost on restart and would not be shared (or invalidated) across several server instances. A read that starts just before a write can, in rare cases, store slightly old data until the TTL ends.

### Measuring the difference

1. Start the backend (`npm run dev` in `server/`).
2. In a second terminal: `cd server`, then `npm run benchmark`.

The script uses its own benchmark user (`cache-benchmark@example.com`), creates sample tasks if needed, takes 5 uncached and 5 cached readings for both endpoints, and saves the tables to [`docs/cache-benchmark.md`](docs/cache-benchmark.md). The numbers in that file come from your own run. `READINGS` and `SAMPLE_TASKS` environment variables change the sample size.

Manual check in Postman: send `GET /tasks` three times with your token and read the `Time` value and the `X-Cache` header each time (first `MISS`, then `HIT`). Set `CACHE_ENABLED=false`, restart, and repeat for the uncached readings. `GET /debug/cache` shows the hit and miss counters.

## Other API used

GitHub REST API: `https://api.github.com/users/vaishnavipatel711/repos` (no key needed).

## Run locally

You need Node 18+ and a MongoDB (local install or Atlas).

**Backend** (terminal 1)

```
cd server
npm install
copy .env.example .env
```

Edit `server/.env`: set `MONGO_URI`, and set `JWT_SECRET` to a long random string. Never put real values in `.env.example`, because that file is committed. Generate a secret with:

```
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Then start it:

```
npm run dev
```

**Frontend** (terminal 2, project root)

```
npm install
npm run dev
```

Open http://localhost:5173, register an account, log in, and use the Tasks page.
If the backend URL differs, copy `.env.example` to `.env` and set `VITE_API_URL`.

`.env` files are git-ignored; `JWT_SECRET` and the database password are never committed.