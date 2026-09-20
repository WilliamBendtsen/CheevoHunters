import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";

import { closeDb, db } from "../src/db/client.js";
import { env } from "../src/config/env.js";
import { createApp } from "../src/app.js";

let server;
let baseUrl;
let cookie;
let userId;
const username = `test_${Date.now()}`;
const password = "A long test password 123!";
const headers = () => ({ "Content-Type": "application/json", Origin: env.clientOrigin, Cookie: cookie });

before(async () => {
  if (!env.databaseUrl) return;
  const app = createApp();

  await new Promise((resolve) => {
    server = app.listen(0, "127.0.0.1", resolve);
  });

  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
  const response = await fetch(`${baseUrl}/api/auth/signup`, {
    method: "POST", headers: { "Content-Type": "application/json", Origin: env.clientOrigin },
    body: JSON.stringify({ username, email: `${username}@example.com`, password }),
  });
  assert.equal(response.status, 201);
  cookie = response.headers.get("set-cookie").split(";")[0];
  userId = (await response.json()).data.id;
});

after(async () => {
  if (!env.databaseUrl) return;
  await new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });

  await db.query("delete from sessions where title like 'Backend API test session%'");
  await db.query("delete from games where title like 'Backend API indexed game%'");
  if (userId) await db.query("delete from users where id = $1", [userId]);
  await closeDb();
});

describe("CheevoHunters API", { skip: !env.databaseUrl && "DATABASE_URL is required for database integration tests" }, () => {
  it("returns health metadata", async () => {
    const response = await fetch(`${baseUrl}/api/health`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.data.status, "ok");
    assert.equal(body.data.dataProvider, process.env.DATA_PROVIDER ?? "supabase");
  });

  it("returns the current Supabase-backed user", async () => {
    const response = await fetch(`${baseUrl}/api/users/me`, { headers: headers() });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.data.username, username);
  });

  it("returns Supabase-backed dashboard data", async () => {
    const response = await fetch(`${baseUrl}/api/users/me/dashboard`, { headers: headers() });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.data.stats.gamesFollowed, 0);
    assert.deepEqual(body.data.followingGames, []);
    assert.deepEqual(body.data.upcomingSessions, []);
  });

  it("rejects short IGDB search queries before proxying", async () => {
    const response = await fetch(`${baseUrl}/api/igdb/search?q=p`);
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(
      body.error.message,
      "Search query must be at least 2 characters.",
    );
  });

  it("lists games with serialized platform data", async () => {
    const response = await fetch(`${baseUrl}/api/games?search=helldivers`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.data.length, 1);
    assert.equal(body.data[0].title, "Helldivers 2");
    assert.equal(body.data[0].platforms, "PC, PS5");
    assert.match(body.data[0].coverUrl, /^https:\/\/images\.igdb\.com/);
  });

  it("indexes a selected IGDB game into the catalog", async () => {
    const igdbId = 900000 + Math.floor(Math.random() * 100000);
    const response = await fetch(`${baseUrl}/api/games/index`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        igdbId,
        title: `Backend API indexed game ${igdbId}`,
        slug: `backend-api-indexed-game-${igdbId}`,
        coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1234.jpg",
        platforms: ["PC (Microsoft Windows)", "PlayStation 5"],
      }),
    });
    const body = await response.json();

    assert.equal(response.status, 201);
    assert.equal(body.data.igdbId, igdbId);
    assert.equal(body.data.platforms, "PC, PS5");
    assert.match(body.data.coverUrl, /^https:\/\/images\.igdb\.com/);
  });

  it("returns sessions filtered by game", async () => {
    const response = await fetch(`${baseUrl}/api/sessions?gameId=1`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.ok(body.data.length > 0);
    assert.ok(body.data.every((session) => session.gameId === 1));
    assert.match(body.data[0].gameCoverUrl, /^https:\/\/images\.igdb\.com/);
  });

  it("creates a session using the current Supabase-backed user", async () => {
    const response = await fetch(`${baseUrl}/api/sessions`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        hostUserId: "00000000-0000-0000-0000-000000000000",
        host: "PixelPulse",
        gameId: "1",
        title: `Backend API test session ${Date.now()}`,
        platform: "pc-steam",
        sessionType: "achievement",
        maxPlayers: "4",
        description: "Verify the Supabase-backed repository path.",
      }),
    });
    const body = await response.json();

    assert.equal(response.status, 201);
    assert.match(body.data.title, /^Backend API test session/);
    assert.equal(body.data.host, username);
    assert.equal(body.data.players, "1 / 4");
  });

  it("rejects invalid session payloads", async () => {
    const response = await fetch(`${baseUrl}/api/sessions`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        gameId: "1",
        title: "",
        platform: "dreamcast",
        sessionType: "speedrun",
        maxPlayers: "99",
        description: "",
      }),
    });
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.error.message, "Session validation failed.");
    assert.equal(body.error.details.platform, "Choose a supported platform.");
    assert.equal(body.error.details.sessionType, "Choose a supported session type.");
  });
});

// These tests require a disposable database with the schema and demo seed applied.
