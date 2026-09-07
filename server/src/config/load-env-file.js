import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

export function loadEnvFile(filePath = ".env") {
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
