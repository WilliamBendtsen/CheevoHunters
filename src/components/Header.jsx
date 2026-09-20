import { useAuth } from "../auth/AuthContext";
import React, { useState } from "react";
import { NavLink } from "react-router-dom";

export default function Header() {
  const { user, status, logout } = useAuth();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function handleLogout() {
    setBusy(true); setError("");
    try { await logout(); } catch { setError("Could not log out. Try again."); }
    finally { setBusy(false); }
  }
  return (
    <header className="site-header">
      <div className="header-left">
        <NavLink to="/" className="brand" aria-label="CheevoHunters home">
          <span className="brand-mark">CH</span>
          <span>CheevoHunters</span>
        </NavLink>

        <nav className="primary-nav" aria-label="Primary navigation">
          <NavLink to="/" end>
            Browse Games
          </NavLink>
          <NavLink to="/create">Create Session</NavLink>
          <NavLink to="/dashboard">Dashboard</NavLink>
        </nav>
      </div>

      <div className="header-right">
        <label className="site-search">
          <span className="search-icon" aria-hidden="true" />
          <input type="search" placeholder="Search games, tags, sessions..." />
        </label>
        <button className="icon-button" type="button" aria-label="Notifications">
          <span aria-hidden="true">!</span>
        </button>
        {user ? <>
          <NavLink to="/dashboard" className="profile-link" aria-label="Open profile">
            <span className="avatar">{user.username.slice(0, 2).toUpperCase()}</span>
            <span>{user.displayName}</span>
          </NavLink>
          <button className="secondary-action" type="button" disabled={busy} onClick={handleLogout}>{busy ? "Logging out..." : "Log out"}</button>
          {error && <span role="alert">{error}</span>}
        </> : status === "ready" ? <>
          <NavLink className="secondary-action" to="/login">Log in</NavLink>
          <NavLink className="primary-action" to="/signup">Sign up</NavLink>
        </> : <span>{status === "loading" ? "Loading account..." : "Account unavailable"}</span>}

      </div>
    </header>
  );
}
