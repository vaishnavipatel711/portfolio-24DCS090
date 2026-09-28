# Vaishnavi | Student Portfolio (ITUE301 Practicals 1-6)

One portfolio web app that contains all six practicals.

| Practical | Where it lives |
|---|---|
| 1. Components + props | `src/components/` (Header, About, Skills, Footer), data passed as props from `App.jsx` |
| 2. State + routing | React Router v6 in `main.jsx` / `App.jsx`; `NavBar.jsx`; `pages/Contact.jsx`; dark mode + 404 |
| 3. API integration | `pages/Projects.jsx` (GitHub API, loading, error, retry, search, star count) |
| 4. Express REST API | `server/` (routes, logger, JSON check, ID check, 404, global error handler) |
| 5. MongoDB + Mongoose | `server/models/Task.js` (validation, defaults, priority enum, trim) |
| 6. Full stack | `src/api.js` + `pages/Tasks.jsx` (CRUD, toasts, delete confirmation) |

## Routes (frontend)

| Path | Page |
|---|---|
| `/` | Home (About + Skills) |
| `/projects` | Hardcoded projects + live GitHub repositories |
| `/tasks` | Task manager (talks to the backend) |
| `/contact` | Controlled form with live character count |
| `*` | 404 Not Found |

## API used

- GitHub REST API: `https://api.github.com/users/vaishnavipatel711/repos` (no key needed).
- Own backend: `http://localhost:5000/tasks` (GET, POST, PUT /:id, DELETE /:id, GET /:id).

## Run locally

You need Node 18+ and a MongoDB (local install or Atlas).

**Backend** (terminal 1)

```
cd server
npm install
copy .env.example .env      # then edit MONGO_URI if needed
npm run dev
```

**Frontend** (terminal 2, project root)

```
npm install
npm run dev
```

Open http://localhost:5173. If the backend URL differs, copy `.env.example` to `.env` and set `VITE_API_URL`.
