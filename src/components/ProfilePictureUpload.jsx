import { Camera, LoaderCircle } from "lucide-react";
import UserAvatar from "./UserAvatar";
import React, { useRef, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { uploadAvatar } from "../api/client";

export default function ProfilePictureUpload() {
  const { user, setUser } = useAuth();
  const input = useRef(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function chooseFile(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setMessage(""); setError("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Choose a JPG, PNG, or WebP image."); return;
    }
    if (file.size > 5 * 1024 * 1024) { setError("Choose an image no larger than 5 MB."); return; }
    setBusy(true);
    try {
      const updated = await uploadAvatar(file);
      // A completed upload must not sign someone back in after logout.
      setUser(current => current?.id === user.id ? updated : current);
      setMessage("Profile picture updated.");
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  return <div className="profile-picture-upload">
    <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" hidden disabled={busy} onChange={chooseFile} aria-label="Choose a profile picture" />
    <button className="profile-picture-button" type="button" disabled={busy} onClick={() => input.current?.click()} aria-label={busy ? "Uploading profile picture" : "Change picture"} title="Change picture" aria-describedby="profile-picture-help" aria-busy={busy}>
      <UserAvatar user={user} className="profile-avatar" />
      <span className="profile-picture-overlay" aria-hidden="true">
        {busy ? <LoaderCircle className="profile-picture-spinner" size={26} /> : <Camera size={26} />}
      </span>
    </button>
    <small className="profile-picture-hint" id="profile-picture-help">JPG, PNG, or WebP · Up to 5 MB</small>
    <span className="profile-picture-feedback" role="status" aria-live="polite">{busy ? "Uploading..." : message}</span>
    {error && <span className="profile-picture-error" role="alert">{error}</span>}
  </div>;
}
