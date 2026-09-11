# Edge Functions

## `igdb-search`

Calls IGDB through Twitch client credentials and returns normalized game search results.

Required Supabase Edge Function secrets:

```bash
TWITCH_CLIENT_ID=...
TWITCH_CLIENT_SECRET=...
IGDB_API_BASE_URL=https://api.igdb.com/v4
```

Set them in the Supabase Dashboard under Edge Function secrets, or with the Supabase CLI:

```bash
supabase secrets set TWITCH_CLIENT_ID=...
supabase secrets set TWITCH_CLIENT_SECRET=...
supabase secrets set IGDB_API_BASE_URL=https://api.igdb.com/v4
```

Deploy:

```bash
supabase functions deploy igdb-search
```

Invoke after deployment:

```bash
curl -X POST 'https://mldjxifcpcqcimrritvl.supabase.co/functions/v1/igdb-search' \
  -H 'Content-Type: application/json' \
  -d '{"query":"Portal 2"}'
```
