import { loadEnvFile } from "./load-env-file.js";

loadEnvFile();

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const env = {
  port: toNumber(process.env.PORT, 3001),
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
  dataProvider: process.env.DATA_PROVIDER ?? "mock",
  supabase: {
    url: process.env.SUPABASE_URL ?? "",
    anonKey: process.env.SUPABASE_ANON_KEY ?? "",
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  },
  igdb: {
    apiBaseUrl: process.env.IGDB_API_BASE_URL ?? "https://api.igdb.com/v4",
    twitchClientId: process.env.TWITCH_CLIENT_ID ?? "",
    twitchClientSecret: process.env.TWITCH_CLIENT_SECRET ?? "",
  },
};
