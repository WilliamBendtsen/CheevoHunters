import assert from "node:assert/strict";
import { after, before, it } from "node:test";
import { createApp } from "../src/app.js";
import { authService, hashPassword, verifyPassword, validateSignup, hashToken } from "../src/services/auth-service.js";
import { db, closeDb } from "../src/db/client.js";
import { env } from "../src/config/env.js";
import { authRateLimit } from "../src/routes/auth-routes.js";
import { sessionsService } from "../src/services/sessions-service.js";

let server, baseUrl;
const users = [];
const sessions = new Map();
const originalQuery = db.query;
const originalCreate = sessionsService.createSession;

// Exercise HTTP + password hashing + session lifecycle without external credentials.
// SQL behavior is separately covered by api.test.js against a real database.
before(async () => {
  db.query = async (sql, values) => {
    if (sql.startsWith("insert into users")) {
      if (users.some(u => u.username === values[0] || u.email === values[1])) throw Object.assign(new Error(), { code: "23505" });
      const user = { id: String(users.length + 1), username: values[0], display_name: values[0], email: values[1], password_hash: values[2] };
      users.push(user); return { rows: [user] };
    }
    if (sql.startsWith("select * from users")) return { rows: users.filter(u => u.username === values[0] || u.email === values[0]) };
    if (sql.startsWith("insert into auth_sessions")) { sessions.set(values[0], { userId: values[1], expires: values[2] }); return { rows: [] }; }
    if (sql.startsWith("delete from auth_sessions")) {
      sessions.delete(values[0]);
      for (const [key, value] of sessions) if (value.expires <= new Date()) sessions.delete(key);
      return { rows: [] };
    }
    if (sql.includes("from auth_sessions s join users")) {
      const session = sessions.get(values[0]);
      return { rows: session && session.expires > new Date() ? users.filter(u => u.id === session.userId) : [] };
    }
    throw new Error(`Unexpected SQL: ${sql}`);
  };
  sessionsService.createSession = async (payload) => ({ hostUserId: payload.hostUserId });
  server = createApp().listen(0, "127.0.0.1");
  await new Promise((resolve, reject) => { server.once("listening", resolve); server.once("error", reject); });
  baseUrl = `http://127.0.0.1:${server.address().port}/api`;
});
after(async () => {
  db.query = originalQuery; sessionsService.createSession = originalCreate;
  if (server) await new Promise(resolve => server.close(resolve));
  await closeDb();
});
function post(path, body, cookie, origin = env.clientOrigin) {
  return fetch(baseUrl + path, { method: "POST", headers: { "Content-Type": "application/json", Origin: origin, ...(cookie ? { Cookie: cookie } : {}) }, body: JSON.stringify(body) });
}
const cookieOf = response => response.headers.get("set-cookie").split(";")[0];
const signup = { username: "Hunter", email: "HUNTER@example.com", password: "hunter12" };

it("validates signup fields without normalizing the password", () => {
  assert.deepEqual(validateSignup(signup), { ...signup, username: "hunter", email: "hunter@example.com" });
  for (const change of [{ username: "a@b" }, { email: "bad" }, { password: "1234567" }, { password: "x".repeat(129) }]) {
    assert.throws(() => validateSignup({ ...signup, ...change }), { statusCode: 400 });
  }
});
it("salts password hashes and rejects incorrect passwords", async () => {
  const a = await hashPassword(signup.password), b = await hashPassword(signup.password);
  assert.notEqual(a, b); assert.ok(!a.includes(signup.password));
  assert.equal(await verifyPassword(signup.password, a), true);
  assert.equal(await verifyPassword("incorrect", a), false);
});
it("keeps personal data and mutations behind authentication", async () => {
  for (const path of ["/users/me", "/users/me/dashboard"]) assert.equal((await fetch(baseUrl + path)).status, 401);
  for (const path of ["/sessions", "/games/index", "/sessions/example/messages"]) assert.equal((await post(path, {})).status, 401);
  assert.equal((await fetch(baseUrl + "/users/me", { headers: { Cookie: "cheevo_session=malformed" } })).status, 401);
});
it("rejects cross-origin and non-JSON auth requests", async () => {
  assert.equal((await post("/auth/signup", signup, null, "https://evil.example")).status, 403);
  assert.equal((await fetch(baseUrl + "/auth/logout", { method: "POST", headers: { Origin: env.clientOrigin, "Content-Type": "text/plain" }, body: "{}" })).status, 403);
});
it("signs up, logs in by either identity, rotates sessions, and revokes logout", async () => {
  const response = await post("/auth/signup", signup);
  assert.equal(response.status, 201);
  const user = (await response.json()).data;
  assert.equal(user.username, "hunter"); assert.equal(user.email, "hunter@example.com");
  assert.equal(user.password_hash, undefined);
  assert.match(response.headers.get("set-cookie"), /HttpOnly/);
  assert.match(response.headers.get("set-cookie"), /SameSite=Lax/);
  assert.equal(response.headers.get("cache-control"), "no-store");
  const original = cookieOf(response);
  assert.ok(sessions.has(hashToken(original.split("=")[1])));
  const me = await fetch(baseUrl + "/users/me", { headers: { Cookie: original } });
  assert.equal((await me.json()).data.id, user.id);
  const duplicate = await post("/auth/signup", { ...signup, username: "HUNTER" });
  assert.equal(duplicate.status, 409);
  for (const identifier of ["hunter", "unknown"]) {
    const invalid = await post("/auth/login", { identifier, password: "wrong" });
    assert.equal(invalid.status, 401);
    assert.equal((await invalid.json()).error.message, "Incorrect email, username, or password.");
  }
  const emailLogin = await post("/auth/login", { identifier: " HUNTER@EXAMPLE.COM ", password: signup.password }, original);
  assert.equal(emailLogin.status, 200);
  assert.equal((await fetch(baseUrl + "/users/me", { headers: { Cookie: original } })).status, 401);
  const usernameLogin = await post("/auth/login", { identifier: "HUNTER", password: signup.password }, cookieOf(emailLogin));
  assert.equal(usernameLogin.status, 200);
  const cookie = cookieOf(usernameLogin);
  const created = await post("/sessions", { gameId: "1", title: "Party", platform: "pc-steam", sessionType: "achievement", maxPlayers: "4", description: "A session", hostUserId: "someone-else" }, cookie);
  assert.equal(created.status, 201);
  assert.equal((await created.json()).data.hostUserId, user.id);
  assert.equal((await post("/auth/logout", {}, cookie)).status, 200);
  assert.equal((await fetch(baseUrl + "/users/me", { headers: { Cookie: cookie } })).status, 401);
  const token = await authService.createSession(user.id);
  sessions.get(hashToken(token)).expires = new Date(0);
  assert.equal(await authService.findUser(token), undefined);
});
it("limits repeated authentication attempts", () => {
  const middleware = authRateLimit();
  let error, retry;
  for (let i = 0; i < 11; i++) middleware({ ip: "test" }, { set: (key, value) => { retry = value; } }, value => { error = value; });
  assert.equal(error.statusCode, 429); assert.ok(Number(retry) > 0);
});
