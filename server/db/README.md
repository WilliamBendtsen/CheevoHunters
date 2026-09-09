# Database Plan

The backend now reads from Supabase/Postgres. The earlier local JavaScript mock data was migrated into the database and removed from the backend runtime.

## Supabase Mode

For a fresh Supabase project, run:

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

If `DATABASE_URL` fails to connect, copy the connection string from Supabase's database connection settings again. The pooled connection string is often the easiest option for local development because it avoids direct database networking issues.

Helpful scripts:

```bash
npm run db:schema
npm run db:seed
```

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
