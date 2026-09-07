import React from "react";
import { Link } from "react-router-dom";
import { games } from "../data/games";

const filterGroups = [
  {
    title: "Platform",
    options: [
      { label: "PC (Steam/Epic)", selected: true },
      { label: "PlayStation 5" },
      { label: "Xbox Series X/S" },
      { label: "Crossplay Enabled" },
    ],
  },
  {
    title: "Session Type",
    options: [
      { label: "Achievement Hunting" },
      { label: "Co-op Campaign", selected: true },
      { label: "Competitive Grind" },
      { label: "Casual / Social" },
    ],
  },
  {
    title: "Availability",
    options: [
      { label: "Active Now" },
      { label: "Starting in 1 hour" },
      { label: "Scheduled this weekend" },
      { label: "Flexible Time" },
    ],
  },
];

export default function HomeBrowse() {
  return (
    <div className="home-browse">
      <section className="hero-banner">
        <h1>Stop searching forums. Find your perfect team now.</h1>
        <p>
          Connect with dedicated gamers for co-op campaigns, niche achievement
          hunts, or competitive queues.
        </p>
      </section>

      <div className="browse-layout">
        <aside className="filters-panel" aria-label="Filters">
          <h3>Filters</h3>
          {filterGroups.map((group) => (
            <section className="filter-group" key={group.title}>
              <h4>{group.title}</h4>
              <div className="filter-options">
                {group.options.map((option) => (
                  <label className="filter-option" key={option.label}>
                    <input
                      type="checkbox"
                      defaultChecked={Boolean(option.selected)}
                      aria-label={option.label}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </section>
          ))}
        </aside>

        <section className="games-section">
          <h2>Trending Games</h2>
          <div className="game-grid">
            {games.map((game) => (
              <Link
                key={game.id}
                to={`/games/${game.id}`}
                className="game-card"
                aria-label={`Browse ${game.title} sessions`}
              >
                <div
                  className="game-cover"
                  aria-label={`${game.title} artwork placeholder`}
                />
                <div className="game-meta">
                  <h3>{game.title}</h3>
                  <p>{game.active} active</p>
                  <div className="game-card-footer">
                    <span className="session-count">
                      <span className="status-dot" aria-hidden="true" />
                      {game.sessions} sessions
                    </span>
                    <span className="browse-button">
                      Browse
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
