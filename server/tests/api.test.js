import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";

import { closeDb, db } from "../src/db/client.js";
import { createApp } from "../src/app.js";

let server;
let baseUrl;

before(async () => {
  const app = createApp();

  await new Promise((resolve) => {
    server = app.listen(0, "127.0.0.1", resolve);
  });

  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

after(async () => {
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
  await closeDb();
});

describe("CheevoHunters API", () => {
  it("returns health metadata", async () => {
    const response = await fetch(`${baseUrl}/api/health`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.data.status, "ok");
    assert.equal(body.data.dataProvider, process.env.DATA_PROVIDER ?? "supabase");
  });

  it("returns the current Supabase-backed user", async () => {
    const response = await fetch(`${baseUrl}/api/users/me`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.data.username, "pixelpulse");
  });

  it("returns Supabase-backed dashboard data", async () => {
    const response = await fetch(`${baseUrl}/api/users/me/dashboard`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.ok(body.data.stats.gamesFollowed > 0);
    assert.ok(body.data.followingGames.length > 0);
  });

  it("lists games with serialized platform data", async () => {
    const response = await fetch(`${baseUrl}/api/games?search=helldivers`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.data.length, 1);
    assert.equal(body.data[0].title, "Helldivers 2");
    assert.equal(body.data[0].platforms, "PC, PS5");
  });

  it("returns sessions filtered by game", async () => {
    const response = await fetch(`${baseUrl}/api/sessions?gameId=1`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.ok(body.data.length > 0);
    assert.ok(body.data.every((session) => session.gameId === 1));
  });

  it("creates a session using the current Supabase-backed user", async () => {
    const response = await fetch(`${baseUrl}/api/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
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
    assert.equal(body.data.host, "PixelPulse");
    assert.equal(body.data.players, "1 / 4");
  });

  it("rejects invalid session payloads", async () => {
    const response = await fetch(`${baseUrl}/api/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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
