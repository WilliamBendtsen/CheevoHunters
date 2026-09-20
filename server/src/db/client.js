import pg from "pg";
import { createHttpError } from "../errors/http-error.js";

import { env } from "../config/env.js";

const pool = new pg.Pool({
  connectionString: env.databaseUrl,
  ssl: {
    rejectUnauthorized: false,
  },
});

function requireDatabaseUrl() {
  if (!env.databaseUrl || /your_.*connection_string/.test(env.databaseUrl)) {
    throw createHttpError(503, "Database is not configured. Set DATABASE_URL in the backend .env file and restart the server.");
  }
}

export const db = {
  async query(...args) {
    requireDatabaseUrl();
    return pool.query(...args);
  },
  async connect(...args) {
    requireDatabaseUrl();
    return pool.connect(...args);
  },
};

export async function closeDb() {
  await pool.end();
}
