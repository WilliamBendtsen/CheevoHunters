import React, { useState } from "react";

export default function UserAvatar({ user, className = "avatar" }) {
  const [failedUrl, setFailedUrl] = useState(null);
  return <span className={`${className} user-avatar`} aria-label={`${user.username} profile picture`}>
    {user.avatarUrl && failedUrl !== user.avatarUrl
      ? <img src={user.avatarUrl} alt="" onError={() => setFailedUrl(user.avatarUrl)} />
      : user.username.slice(0, 2).toUpperCase()}
  </span>;
}
