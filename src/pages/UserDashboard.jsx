import React from "react";
import { Link } from "react-router-dom";

const upcomingSessions = [
  {
    type: "Achievement Hunt",
    tone: "achievement",
    platform: "PC",
    game: "Portal 2",
    title: "Portal 2 co-op 'Professor Portal' achievement run",
    starts: "Tomorrow, 8:00 PM EST",
    to: "/session/portal-professor",
  },
  {
    type: "Co-op Session",
    tone: "coop",
    platform: "Crossplay",
    game: "Monster Hunter Wilds",
    title: "Monster Hunter Wilds campaign co-op",
    starts: "Saturday, 12:00 PM EST",
    to: "/session/mhw-campaign",
  },
];

const followingGames = [
  { title: "Helldivers 2", to: "/games/1", enabled: true },
  { title: "Lethal Company", to: "/games/2", enabled: false },
  { title: "Monster Hunter Wilds", to: "/games/6", enabled: true },
];

export default function UserDashboard() {
  return (
    <div className="dashboard-page">
      <section className="profile-summary">
        <div className="profile-avatar" aria-label="PixelPulse avatar">
          PP
        </div>
        <div className="profile-meta">
          <h1>PixelPulse</h1>
          <div className="profile-stats">
            <span>
              Sessions Joined: <strong>24</strong>
            </span>
            <span>
              Sessions Created: <strong>8</strong>
            </span>
            <span>
              Games Followed: <strong>5</strong>
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
            {upcomingSessions.map((session) => (
              <article className="dashboard-session-card" key={session.title}>
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
            {followingGames.map((game) => (
              <Link className="following-row" key={game.title} to={game.to}>
                <span className="following-cover" aria-hidden="true" />
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
