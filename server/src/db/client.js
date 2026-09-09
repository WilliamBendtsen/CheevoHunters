import pg from "pg";

import { env } from "../config/env.js";

export const db = new pg.Pool({
  connectionString: env.databaseUrl,
  ssl: {
    rejectUnauthorized: false,
  },
});

export async function closeDb() {
  await db.end();
}
