import { avatarBucket, avatarMaxBytes, storageRequest } from "../src/storage/avatars-storage.js";

// A dedicated public bucket for profile images; uploads go through authenticated Express routes.
const config = { id: avatarBucket, name: avatarBucket, public: true, file_size_limit: avatarMaxBytes, allowed_mime_types: ["image/webp"] };
try {
  const existing = await storageRequest(`/bucket/${avatarBucket}`);
  let response;
  if (existing.ok) {
    response = await storageRequest(`/bucket/${avatarBucket}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(config) });
  } else {
    const error = await existing.json().catch(() => ({}));
    if (existing.status !== 404 && error.code !== "NoSuchBucket" && error.message !== "Bucket not found") {
      throw new Error(`Could not inspect storage bucket (HTTP ${existing.status}). Check the Supabase URL and service role key.`);
    }
    response = await storageRequest("/bucket", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(config) });
  }
  if (!response.ok) throw new Error(`Could not configure profile storage (HTTP ${response.status}).`);
  const verified = await storageRequest(`/bucket/${avatarBucket}`);
  if (!verified.ok) throw new Error("Could not verify profile storage.");
  const bucket = await verified.json();
  if (!bucket.public || Number(bucket.file_size_limit) !== avatarMaxBytes || !bucket.allowed_mime_types?.includes("image/webp")) throw new Error("Profile storage configuration did not match.");
  console.log(`Verified ${avatarBucket}: public profile images, WebP only, 5 MB limit.`);
} catch (error) { console.error(error.message); process.exitCode = 1; }
