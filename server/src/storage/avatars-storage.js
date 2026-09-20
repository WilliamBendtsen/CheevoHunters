import { env } from "../config/env.js";
import { createHttpError } from "../errors/http-error.js";

export const avatarBucket = "profile-avatars";
export const avatarMaxBytes = 5 * 1024 * 1024;
export const avatarMimeTypes = ["image/jpeg", "image/png", "image/webp"];

function storageBase() {
  if (!env.supabase.url || !env.supabase.serviceRoleKey) {
    throw createHttpError(503, "Profile uploads are not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY on the backend.");
  }
  return `${env.supabase.url.replace(/\/$/, "")}/storage/v1`;
}

export async function storageRequest(path, options = {}) {
  let response;
  try {
    response = await fetch(`${storageBase()}${path}`, {
      ...options,
      headers: {
        apikey: env.supabase.serviceRoleKey,
        Authorization: `Bearer ${env.supabase.serviceRoleKey}`,
        ...options.headers,
      },
      signal: AbortSignal.timeout(20000),
    });
  } catch (error) {
    if (error.statusCode) throw error;
    throw createHttpError(502, "Could not reach profile picture storage. Please try again.");
  }
  return response;
}

export const avatarsStorage = {
  publicUrl(path) { return `${storageBase()}/object/public/${avatarBucket}/${path}`; },
  async upload(path, image) {
    const response = await storageRequest(`/object/${avatarBucket}/${path}`, {
      method: "POST", headers: { "Content-Type": "image/webp", "Cache-Control": "max-age=31536000" }, body: image,
    });
    if (!response.ok) throw createHttpError(502, "Could not store your profile picture. Please try again or check the profile-avatars bucket setup.");
    return this.publicUrl(path);
  },
  async remove(path) {
    const response = await storageRequest(`/object/${avatarBucket}`, {
      method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prefixes: [path] }),
    });
    if (!response.ok) throw createHttpError(502, "Could not remove the previous profile picture.");
  },
  ownedPath(url, userId) {
    const prefix = this.publicUrl(`${userId}/`);
    if (!url?.startsWith(prefix)) return null;
    const filename = url.slice(prefix.length);
    return /^[a-f0-9-]{36}\.webp$/.test(filename) ? `${userId}/${filename}` : null;
  },
};
