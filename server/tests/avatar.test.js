import assert from "node:assert/strict";
import { before, after, it } from "node:test";
import sharp from "sharp";
import { createApp } from "../src/app.js";
import { avatarService, prepareAvatar } from "../src/services/avatar-service.js";
import { authService } from "../src/services/auth-service.js";
import { avatarsStorage, avatarMaxBytes } from "../src/storage/avatars-storage.js";
import { db, closeDb } from "../src/db/client.js";
import { env } from "../src/config/env.js";
import { cookieName } from "../src/middleware/current-user.js";

const originalSupabase = { ...env.supabase };
const userId = "11111111-1111-4111-8111-111111111111";
const user = { id: userId, username: "hunter", displayName: "hunter" };
let server, base, sample;
const originals = { findUser: authService.findUser, connect: db.connect, upload: avatarsStorage.upload, remove: avatarsStorage.remove };
before(async () => {
  env.supabase.url = "https://storage.example.test";
  env.supabase.serviceRoleKey = "test-only-key";
  sample = await sharp({ create: { width: 80, height: 40, channels: 3, background: "#6046ff" } }).png().toBuffer();
  authService.findUser = async token => token === "valid" ? user : undefined;
  server = createApp().listen(0, "127.0.0.1");
  await new Promise((resolve, reject) => { server.once("listening", resolve); server.once("error", reject); });
  base = `http://127.0.0.1:${server.address().port}/api/users/me/avatar`;
});
after(async () => {
  Object.assign(env.supabase, originalSupabase);
  authService.findUser = originals.findUser; db.connect = originals.connect;
  avatarsStorage.upload = originals.upload; avatarsStorage.remove = originals.remove;
  if (server) await new Promise(resolve => server.close(resolve));
  await closeDb();
});
function upload(body, { token = "valid", origin = env.clientOrigin, type = "image/png" } = {}) {
  return fetch(base, { method: "PUT", headers: { Origin: origin, "Content-Type": type, Cookie: `${cookieName}=${token}` }, body });
}
it("decodes and crops actual image data to a 512px WebP without metadata", async () => {
  const image = await prepareAvatar(sample);
  const metadata = await sharp(image).metadata();
  assert.equal(metadata.format, "webp"); assert.equal(metadata.width, 512); assert.equal(metadata.height, 512);
  assert.equal(metadata.exif, undefined);
});
it("rejects empty, oversized, forged, corrupt, and oversized-dimension images", async () => {
  for (const bytes of [Buffer.alloc(0), Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>'), Buffer.from([255,216,255,0])]) {
    await assert.rejects(prepareAvatar(bytes), { statusCode: 400 });
  }
  await assert.rejects(prepareAvatar(Buffer.alloc(avatarMaxBytes + 1)), { statusCode: 413 });
  const huge = await sharp({ create: { width: 5001, height: 5000, channels: 3, background: "white" } }).png().toBuffer();
  await assert.rejects(prepareAvatar(huge), { statusCode: 400 });
});
it("enforces authentication, same-origin access, size limits, and local image bytes", async () => {
  assert.equal((await upload(sample, { token: "bad" })).status, 401);
  assert.equal((await upload(sample, { origin: "https://evil.example" })).status, 403);
  assert.equal((await upload(sample, { type: "image/svg+xml" })).status, 403);
  assert.equal((await upload(JSON.stringify({ avatarUrl: "https://example.com/x.png" }), { type: "application/json" })).status, 400);
  assert.equal((await upload(Buffer.alloc(avatarMaxBytes + 1))).status, 413);
  assert.equal((await upload(Buffer.from("not an image"))).status, 400);
});
it("stores the image against the authenticated user and removes only their previous image", async () => {
  const oldPath = `${userId}/22222222-2222-4222-8222-222222222222.webp`;
  const previousUrl = avatarsStorage.publicUrl(oldPath);
  const removed = [];
  let uploadedPath, savedUrl;
  avatarsStorage.upload = async (path, bytes) => { uploadedPath = path; assert.equal((await sharp(bytes).metadata()).format, "webp"); return avatarsStorage.publicUrl(path); };
  avatarsStorage.remove = async path => { removed.push(path); };
  db.connect = async () => ({
    async query(sql, values) {
      if (sql.startsWith("select")) { assert.equal(values[0], userId); return { rows: [{ avatar_url: previousUrl }] }; }
      if (sql.startsWith("update")) { assert.equal(values[1], userId); savedUrl = values[0]; return { rows: [{ id: userId, username: "hunter", display_name: "hunter", avatar_url: savedUrl }] }; }
      return { rows: [] };
    }, release() {},
  });
  const response = await upload(sample);
  assert.equal(response.status, 200);
  assert.ok(uploadedPath.startsWith(`${userId}/`));
  assert.equal((await response.json()).data.avatarUrl, savedUrl);
  assert.deepEqual(removed, [oldPath]);
  assert.equal(avatarsStorage.ownedPath(avatarsStorage.publicUrl(`another-user/${oldPath}`), userId), null);
});
it("removes the new upload if the database update fails", async () => {
  let uploaded, removed;
  avatarsStorage.upload = async path => { uploaded = path; return avatarsStorage.publicUrl(path); };
  avatarsStorage.remove = async path => { removed = path; };
  db.connect = async () => { throw new Error("database unavailable"); };
  await assert.rejects(avatarService.update(userId, sample), /database unavailable/);
  assert.equal(removed, uploaded);
});
