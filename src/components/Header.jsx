import UserAvatar from "./UserAvatar";
import { searchUsers } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

export default function Header() {
  const { user, status, logout } = useAuth();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchStatus, setSearchStatus] = useState("idle");
  const [searchResults, setSearchResults] = useState([]);
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    if (!user) {
      setSearchQuery("");
      setSearchFocused(false);
    }
  }, [user]);

  useEffect(() => {
    const query = searchQuery.trim();

    if (!user || query.length < 2) {
      setSearchResults([]);
      setSearchStatus("idle");
      return undefined;
    }

    const controller = new AbortController();
    const debounce = window.setTimeout(() => {
      setSearchStatus("searching");
      searchUsers(query, { signal: controller.signal })
        .then((results) => {
          setSearchResults(results);
          setSearchStatus("ready");
        })
        .catch((requestError) => {
          if (requestError.name !== "AbortError") {
            setSearchResults([]);
            setSearchStatus("error");
          }
        });
    }, 220);

    return () => {
      window.clearTimeout(debounce);
      controller.abort();
    };
  }, [searchQuery, user?.id]);

  async function handleLogout() {
    setBusy(true); setError("");
    try { await logout(); } catch { setError("Could not log out. Try again."); }
    finally { setBusy(false); }
  }

  const showSearchPanel = searchFocused && searchQuery.trim().length > 0;

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
        <div className="site-search-wrap">
          <label className="site-search">
            <span className="search-icon" aria-hidden="true" />
            <input
              type="search"
              placeholder={user ? "Search users..." : "Log in to search users"}
              value={searchQuery}
              disabled={!user}
              onChange={(event) => setSearchQuery(event.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => window.setTimeout(() => setSearchFocused(false), 120)}
            />
          </label>
          {user && showSearchPanel && (
            <div className="search-popover" role="status">
              {searchQuery.trim().length < 2 && (
                <p className="search-message">Type at least 2 characters.</p>
              )}
              {searchQuery.trim().length >= 2 && searchStatus === "searching" && (
                <p className="search-message">Searching users...</p>
              )}
              {searchQuery.trim().length >= 2 && searchStatus === "error" && (
                <p className="search-message">Could not search users.</p>
              )}
              {searchQuery.trim().length >= 2 && searchStatus === "ready" && searchResults.length === 0 && (
                <p className="search-message">No users found.</p>
              )}
              {searchResults.length > 0 && (
                <div className="search-results" aria-label="User search results">
                  {searchResults.map((result) => (
                    <div className="search-result" key={result.id}>
                      <UserAvatar user={result} className="search-result-avatar" />
                      <span>
                        <strong>{result.displayName}</strong>
                        <small>@{result.username}</small>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <button className="icon-button" type="button" aria-label="Notifications">
          <span aria-hidden="true">!</span>
        </button>
        {user ? <>
          <NavLink to="/dashboard" className="profile-link" aria-label="Open profile">
            <UserAvatar user={user} />
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
