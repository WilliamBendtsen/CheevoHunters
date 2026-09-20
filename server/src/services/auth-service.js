import { randomBytes, scrypt, timingSafeEqual, createHash } from "node:crypto";
import { promisify } from "node:util";
import { db } from "../db/client.js";
import { createHttpError } from "../errors/http-error.js";

const deriveKey = promisify(scrypt);
const scryptOptions = { N: 131072, r: 8, p: 1, maxmem: 160 * 1024 * 1024 };
const dummyHash = `scrypt$${"0".repeat(32)}$${"0".repeat(128)}`;
export const sessionDuration = 7 * 24 * 60 * 60 * 1000;
export const hashToken = (token) => createHash("sha256").update(token).digest("hex");
export const publicUser = (row) => ({
  id: row.id, username: row.username, displayName: row.display_name,
  email: row.email, avatarUrl: row.avatar_url ?? null,
});

export async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const key = await deriveKey(password, salt, 64, scryptOptions);
  return `scrypt$${salt}$${key.toString("hex")}`;
}

export async function verifyPassword(password, stored = dummyHash) {
  const [, salt, encoded] = stored.split("$");
  const key = await deriveKey(password, salt, 64, scryptOptions);
  const expected = Buffer.from(encoded, "hex");
  return key.length === expected.length && timingSafeEqual(key, expected);
}

export function validateSignup(body = {}) {
  const username = typeof body.username === "string" ? body.username.trim().toLowerCase() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!/^[a-z0-9_]{3,24}$/.test(username)) {
    throw createHttpError(400, "Username must be 3–24 letters, numbers, or underscores.");
  }
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createHttpError(400, "Enter a valid email address.");
  }
  if (typeof body.password !== "string" || body.password.length < 8 || body.password.length > 128) {
    throw createHttpError(400, "Password must be 8–128 characters.");
  }
  return { username, email, password: body.password };
}

export const authService = {
  async signup(body) {
    const { username, email, password } = validateSignup(body);
    const passwordHash = await hashPassword(password);
    try {
      const { rows } = await db.query(
        `insert into users (username, display_name, email, password_hash)
         values ($1, $1, $2, $3) returning id, username, display_name, email, avatar_url`,
        [username, email, passwordHash],
      );
      return publicUser(rows[0]);
    } catch (error) {
      if (error.code === "23505") throw createHttpError(409, "Username or email is already in use.");
      throw error;
    }
  },
  async login(body = {}) {
    const identifier = typeof body.identifier === "string" ? body.identifier.trim().toLowerCase() : "";
    if (!identifier || identifier.length > 254 || typeof body.password !== "string" || !body.password.length || body.password.length > 128) {
      throw createHttpError(400, "Enter your email or username and password.");
    }
    const { rows } = await db.query(
      "select * from users where lower(username) = $1 or lower(email) = $1 limit 1", [identifier],
    );
    const user = rows[0];
    const matches = await verifyPassword(body.password, user?.password_hash ?? dummyHash);
    if (!user?.password_hash || !matches) throw createHttpError(401, "Incorrect email, username, or password.");
    return publicUser(user);
  },
  async createSession(userId, previousToken) {
    const token = randomBytes(32).toString("hex");
    await db.query("delete from auth_sessions where expires_at <= now() or token_hash = $1", [hashToken(previousToken ?? "")]);
    await db.query("insert into auth_sessions (token_hash, user_id, expires_at) values ($1, $2, $3)",
      [hashToken(token), userId, new Date(Date.now() + sessionDuration)]);
    return token;
  },
  async findUser(token) {
    if (!token || !/^[a-f0-9]{64}$/.test(token)) return undefined;
    const { rows } = await db.query(
      `select u.id, u.username, u.display_name, u.email, u.avatar_url from auth_sessions s join users u on u.id = s.user_id
       where s.token_hash = $1 and s.expires_at > now()`, [hashToken(token)],
    );
    return rows[0] ? publicUser(rows[0]) : undefined;
  },
  async logout(token) {
    if (token) await db.query("delete from auth_sessions where token_hash = $1", [hashToken(token)]);
  },
};
