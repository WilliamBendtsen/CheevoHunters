import { useAuth } from "../auth/AuthContext";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboard } from "../api/client";

const getCoverStyle = (coverUrl) =>
  coverUrl ? { backgroundImage: `url(${coverUrl})` } : undefined;

export default function UserDashboard() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let ignore = false;

    getDashboard()
      .then((data) => {
        if (!ignore) {
          setDashboard(data);
          setStatus("ready");
        }
      })
      .catch(() => {
        if (!ignore) {
          setStatus("error");
        }
      });

    return () => {
      ignore = true;
    };
  }, [user.id]);

  if (status === "loading") {
    return <p className="api-state">Loading dashboard...</p>;
  }

  if (status === "error" || !dashboard) {
    return <p className="api-state">Could not load dashboard data.</p>;
  }

  const { followingGames, stats, upcomingSessions } = dashboard;

  return (
    <div className="dashboard-page">
      <section className="profile-summary">
        <div className="profile-avatar" aria-label={`${user.username} avatar`}>
          {user.username.slice(0, 2).toUpperCase()}
        </div>
        <div className="profile-meta">
          <h1>{user.displayName}</h1>
          <div className="profile-stats">
            <span>
              Sessions Joined: <strong>{stats.sessionsJoined}</strong>
            </span>
            <span>
              Sessions Created: <strong>{stats.sessionsCreated}</strong>
            </span>
            <span>
              Games Followed: <strong>{stats.gamesFollowed}</strong>
            </span>
          </div>
        </div>
        <button className="secondary-action edit-profile-button" type="button">
          Edit Profile
        </button>
      </section>

      <section className="dashboard-content">
        <div className="dashboard-main">
          <div className="dashboard-tabs">
            <button className="active" type="button">
              My Upcoming Sessions
            </button>
            <button type="button">Past History</button>
          </div>

          <div className="upcoming-list">
            {upcomingSessions.length === 0 && <p className="api-state">No sessions yet. <Link to="/create">Create your first session</Link>.</p>}
            {upcomingSessions.map((session) => (
              <article className="dashboard-session-card" key={session.title}>
                <span
                  className={`dashboard-session-cover ${
                    session.gameCoverUrl ? "has-cover" : ""
                  }`}
                  aria-label={`${session.game} cover artwork`}
                  style={getCoverStyle(session.gameCoverUrl)}
                />
                <div className="dashboard-session-copy">
                  <div className="session-kicker">
                    <span className={`session-tag ${session.tone}`}>
                      {session.type}
                    </span>
                    <span className="platform-chip">{session.platform}</span>
                    <span className="session-game-name">{session.game}</span>
                  </div>
                  <h2>{session.title}</h2>
                  <p>Starts: {session.starts}</p>
                </div>
                <Link className="detail-button" to={session.to}>
                  View Detail
                </Link>
              </article>
            ))}
          </div>
        </div>

        <aside className="following-panel" aria-label="Following games">
          <h2>Following Games</h2>
          <div className="following-list">
            {followingGames.length === 0 && <p>No followed games yet.</p>}
            {followingGames.map((game) => (
              <Link className="following-row" key={game.title} to={game.to}>
                <span
                  className={`following-cover ${game.coverUrl ? "has-cover" : ""}`}
                  aria-hidden="true"
                  style={getCoverStyle(game.coverUrl)}
                />
                <span>{game.title}</span>
                <span
                  className={`notification-status ${game.enabled ? "enabled" : ""}`}
                  aria-label={
                    game.enabled ? "Notifications enabled" : "Notifications muted"
                  }
                />
              </Link>
            ))}
          </div>
        </aside>
      </section>
    </div>
  );
}
