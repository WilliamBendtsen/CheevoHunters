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
- `server/src/data`: temporary mock data until a database is added.
- `server/src/middleware`: shared Express middleware.
- `server/src/validators`: request payload validation.
- `server/db`: Supabase/Postgres schema and seed files for the future database.

Useful API endpoints:

- `GET /api/health`
- `GET /api/games`
- `GET /api/games/:gameId`
- `GET /api/sessions`
- `GET /api/sessions/:sessionId`
- `POST /api/sessions`
- `GET /api/users/me`

Database status:

- The backend currently uses `DATA_PROVIDER=mock`.
- No Supabase secrets are required for the mock data.
- The future Supabase/Postgres schema is in `server/db/schema.sql`.
- Demo seed data for Supabase/Postgres is in `server/db/seed.sql`.
