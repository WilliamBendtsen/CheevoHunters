import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { db } from "../db/client.js";
import { createHttpError } from "../errors/http-error.js";
import { publicUser } from "./auth-service.js";
import { avatarsStorage, avatarMaxBytes } from "../storage/avatars-storage.js";

export async function prepareAvatar(bytes) {
  if (!Buffer.isBuffer(bytes) || !bytes.length) throw createHttpError(400, "Choose a local image file.");
  if (bytes.length > avatarMaxBytes) throw createHttpError(413, "Choose an image smaller than 5 MB.");
  // Check raster signatures before invoking the decoder (SVG is never accepted).
  const jpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const png = bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  const webp = bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP";
  if (!jpeg && !png && !webp) throw createHttpError(400, "Choose a valid JPG, PNG, or WebP image.");
  try {
    return await sharp(bytes, { limitInputPixels: 25000000, failOn: "warning" })
      .rotate().resize(512, 512, { fit: "cover" }).webp({ quality: 85 }).toBuffer();
  } catch {
    throw createHttpError(400, "This image could not be read. Choose a JPG, PNG, or WebP image under 25 megapixels.");
  }
}

async function removeUnused(path) {
  if (!path) return;
  try { await avatarsStorage.remove(path); }
  catch { console.warn("An unused profile picture could not be removed from storage."); }
}

export const avatarService = {
  async update(userId, bytes) {
    const image = await prepareAvatar(bytes);
    const path = `${userId}/${randomUUID()}.webp`;
    const url = await avatarsStorage.upload(path, image);
    let client;
    let user;
    let previousUrl;
    try {
      client = await db.connect();
      await client.query("begin");
      const { rows } = await client.query("select avatar_url from users where id = $1 for update", [userId]);
      if (!rows[0]) throw createHttpError(401, "You must be signed in.");
      previousUrl = rows[0].avatar_url;
      const updated = await client.query(
        `update users set avatar_url = $1, updated_at = now() where id = $2
         returning id, username, display_name, email, avatar_url`, [url, userId],
      );
      user = publicUser(updated.rows[0]);
      await client.query("commit");
    } catch (error) {
      if (client) await client.query("rollback").catch(() => {});
      await removeUnused(path);
      throw error;
    } finally { client?.release(); }
    await removeUnused(avatarsStorage.ownedPath(previousUrl, userId));
    return user;
  },
};
