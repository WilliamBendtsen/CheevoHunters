import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import pg from "pg";

loadEnvFile();

if (!process.env.DATABASE_URL) {
  console.error("Missing required env value: DATABASE_URL");
  process.exit(1);
}

const sqlFile = process.argv[2];

if (!sqlFile) {
  console.error("Usage: node server/scripts/run-sql-file.js <path-to-sql-file>");
  process.exit(1);
}

const sqlPath = resolve(process.cwd(), sqlFile);

if (!existsSync(sqlPath)) {
  console.error(`SQL file does not exist: ${sqlFile}`);
  process.exit(1);
}

const sql = readFileSync(sqlPath, "utf8");
const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

try {
  await client.connect();
  await client.query(sql);
  console.log(`Ran SQL file: ${sqlFile}`);
} catch (error) {
  console.error(`Failed running SQL file: ${sqlFile}`);
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}

function loadEnvFile(filePath = ".env") {
  const resolvedPath = resolve(process.cwd(), filePath);

  if (!existsSync(resolvedPath)) {
    return;
  }

  const lines = readFileSync(resolvedPath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = normalizeEnvValue(trimmed.slice(separatorIndex + 1).trim());

    if (key && process.env[key] == null) {
      process.env[key] = value;
    }
  }
}

function normalizeEnvValue(value) {
  const isQuoted =
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"));

  return isQuoted ? value.slice(1, -1) : value;
}
