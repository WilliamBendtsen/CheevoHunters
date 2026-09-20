# CheevoHunters UI (minimal scaffold)

This workspace contains a minimal Vite + React frontend with React Router and a simple Express backend.

Quick start:

1. Install dependencies

```bash
cd "$(pwd)"
npm install
```

2. Start both the client and server in development

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001/api/games

Backend structure:

- `server/index.js`: process entrypoint.
- `server/src/app.js`: Express app composition and global middleware.
- `server/src/config`: environment-backed configuration.
- `server/src/routes`: API route modules.
- `server/src/controllers`: HTTP request and response handlers.
- `server/src/services`: application logic.
- `server/src/repositories`: data access boundary.
- `server/src/middleware`: shared Express middleware.
- `server/src/validators`: request payload validation.
- `server/db`: Supabase/Postgres schema and seed files.

Useful API endpoints:

- `GET /api/health`
- `GET /api/games`
- `GET /api/games/:gameId`
- `GET /api/sessions`
- `GET /api/sessions/:sessionId`
- `POST /api/sessions`
- `GET /api/users/me`
- `GET /api/igdb/search?q=portal`

Database status:

- The backend reads from Supabase/Postgres.
- Supabase/Postgres environment values are required in `.env`.
- The Supabase/Postgres schema is in `server/db/schema.sql`.
- Demo seed data for Supabase/Postgres is in `server/db/seed.sql`.
- Run `npm run igdb:sync-covers` to fill missing `igdb_id` and `cover_url` values from IGDB.

IGDB/Twitch:

- `supabase/functions/igdb-search` is an Edge Function that calls IGDB through Twitch client credentials.
- The frontend should call `GET /api/igdb/search?q=...`; the Express backend proxies that request to the Edge Function.
- Set `TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET`, and `IGDB_API_BASE_URL` as Supabase Edge Function secrets before deploying.
- The local `.env` values are only for local backend/scripts; deployed Edge Functions need their own Supabase secrets.

## Accounts

Signup at `/signup` uses a username, email, and password. Login at `/login`
accepts either email or username (case-insensitive). Usernames are 3–24 letters,
numbers, or underscores; passwords are 8–128 characters. Signup logs in immediately.
Email addresses are not verified, and password recovery is not included in this basic flow.

Apply the updated schema with `npm run db:schema` before starting the backend.
It adds password hashes, case-insensitive uniqueness, and `auth_sessions` without
assigning passwords to demo accounts. Existing case-insensitive duplicate usernames
or emails must be resolved before applying the unique indexes.

Authentication uses the existing Express/Postgres backend, not Supabase Auth.
Passwords use salted scrypt; sessions use random tokens whose hashes are stored in
Postgres. The HttpOnly, SameSite=Lax cookie expires after seven days. Logout revokes
it server-side. Session creation, game indexing, and personal dashboards require login.
Twitch remains the IGDB application integration only.

For deployment, set `NODE_ENV=production`, use HTTPS, and set `CLIENT_ORIGIN` to
exactly the frontend origin (no trailing slash). Frontend and API must be on the
same site (e.g. `app.example.com` and `api.example.com`) for SameSite cookies.
All mutation requests must include this Origin and `Content-Type: application/json`.
The API sets credentialed CORS and private account responses are not cached.
The database role used by Express must have access to `users` and `auth_sessions`;
these tables deny direct access by Supabase `anon` and `authenticated` roles.

Auth attempts are limited to 10 per IP per 15 minutes in this single-process server.
Behind a proxy the default limit applies to the proxy IP; configure a trusted proxy
and shared rate-limit storage before running multiple server instances.

Run `npm run build` and `npm run test:server`. Database integration tests are skipped
when `DATABASE_URL` is absent; run them against a disposable database with schema and
seed data applied. Auth security tests run without a database.

## Copying configuration from another computer

Place your existing `.env` file in the project root, next to `package.json`.
It is ignored by Git. Keep the real `DATABASE_URL` and other service credentials
from that file. For local development on this computer, use:

```dotenv
PORT=3001
CLIENT_ORIGIN=http://localhost:5173
VITE_API_BASE_URL=http://localhost:3001/api
```

After copying, run `npm run db:schema` to apply the account tables and columns,
then run `npm run dev`. Existing databases do not need to be seeded again.
Both development commands watch `.env` and restart the backend when it changes.
If development was already running before these script changes, stop and restart
it once to activate the new watcher. Refresh the browser after configuration loads.
