import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getGame } from "../api/client";

const tabs = ["All Types", "Achievements", "Co-op Campaigns"];

const getCoverStyle = (coverUrl) =>
  coverUrl ? { backgroundImage: `url(${coverUrl})` } : undefined;

const getBackdropStyle = (coverUrl) =>
  coverUrl
    ? {
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.72), rgba(0, 0, 0, 0.84)), url(${coverUrl})`,
      }
    : undefined;

export default function GameDetail() {
  const { id } = useParams();
  const [game, setGame] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let ignore = false;

    getGame(id)
      .then((data) => {
        if (!ignore) {
          setGame(data);
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
  }, [id]);

  if (status === "loading") {
    return <p className="api-state">Loading game...</p>;
  }

  if (status === "error" || !game) {
    return <p className="api-state">Could not load this game.</p>;
  }

  return (
    <div className="game-detail-page">
      <section className="game-hero">
        <div
          className={`game-hero-backdrop ${game.coverUrl ? "has-cover" : ""}`}
          aria-hidden="true"
          style={getBackdropStyle(game.coverUrl)}
        />
        <div
          className={`game-poster ${game.coverUrl ? "has-cover" : ""}`}
          aria-label={`${game.title} cover artwork`}
          style={getCoverStyle(game.coverUrl)}
        />
        <div className="game-hero-meta">
          <div className="game-title-row">
            <h1>{game.title}</h1>
            <span className="active-pill">Active</span>
          </div>
          <div className="game-stat-row">
            <span>
              Platforms: <strong>{game.platforms}</strong>
            </span>
            <span>
              Active Sessions: <strong>{game.sessions}</strong>
            </span>
            <span>
              Followers: <strong>{game.followers}</strong>
            </span>
          </div>
          <div className="game-actions">
            <Link className="primary-action" to="/create">
              Create Session
            </Link>
            <button className="secondary-action" type="button">
              Following
            </button>
          </div>
        </div>
      </section>

      <section className="matchmaking-section">
        <div className="section-heading-row">
          <h2>Active Matchmaking Sessions</h2>
          <div className="segmented-tabs" aria-label="Session type">
            {tabs.map((tab, index) => (
              <button
                className={index === 0 ? "active" : ""}
                key={tab}
                type="button"
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="session-list">
          {game.detailSessions.map((session) => (
            <article className="session-row" key={`${session.host}-${session.title}`}>
              <div className="session-summary">
                <div className="session-kicker">
                  <span className={`session-tag ${session.tone}`}>
                    {session.type}
                  </span>
                  <span className="platform-chip">{session.platform}</span>
                  <span className="session-time">{session.time}</span>
                </div>
                <h3>{session.title}</h3>
                <div className="session-host">
                  <span className="host-avatar" aria-hidden="true">
                    {session.host.slice(0, 1)}
                  </span>
                  <span>
                    Host: <strong>{session.host}</strong>
                  </span>
                </div>
              </div>
              <div className="session-cta">
                <div className="players-count">
                  <strong>{session.players}</strong>
                  <span>Players</span>
                </div>
                <Link className="join-button" to={`/session/${session.id}`}>
                  Request to Join
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
