# Database Plan

The backend currently runs with `DATA_PROVIDER=mock`. The mock store is shaped to match the planned Supabase/Postgres tables, so repositories can later switch data sources without changing controllers or route handlers.

## Current Mode

No Supabase variables are needed for mock data.

The mock data lives in:

- `server/src/data/mock-data.js`: original demo content.
- `server/src/data/mock-store.js`: relational-style mock state used by repositories.

## Future Supabase Mode

When moving to Supabase, create a Supabase project and run:

1. `server/db/schema.sql`
2. `server/db/seed.sql`

Then add these values to `.env`:

```bash
DATA_PROVIDER=supabase
DATABASE_URL=your_direct_postgres_connection_string
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

`DATABASE_URL` is useful for direct Postgres tools, migrations, or Prisma later. The Supabase URL and anon key are useful for normal API access. Use the service role key only on the backend for privileged operations such as admin seed scripts, and never expose it to the browser.

## Recommended First Real Tables

- `users`
- `games`
- `platforms`
- `game_platforms`
- `sessions`
- `session_members`
- `chat_messages`
- `game_follows`

These tables are enough for browsing games, creating sessions, joining sessions, viewing rosters, and showing coordination chat.
