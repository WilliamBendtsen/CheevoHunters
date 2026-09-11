import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getSession } from "../api/client";

const getCoverStyle = (coverUrl) =>
  coverUrl ? { backgroundImage: `url(${coverUrl})` } : undefined;

export default function SessionDetail() {
  const { id } = useParams();
  const [session, setSession] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let ignore = false;

    getSession(id)
      .then((data) => {
        if (!ignore) {
          setSession(data);
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
    return <p className="api-state">Loading session...</p>;
  }

  if (status === "error" || !session) {
    return <p className="api-state">Could not load this session.</p>;
  }

  return (
    <div className="session-detail-page">
      <section className="session-banner">
        <div
          className={`session-game-cover ${
            session.gameCoverUrl ? "has-cover" : ""
          }`}
          aria-label={`${session.gameTitle} cover artwork`}
          style={getCoverStyle(session.gameCoverUrl)}
        />
        <div className="session-banner-copy">
          <div className="session-kicker">
            <span className={`session-tag ${session.tone}`}>{session.type}</span>
            <span className="platform-chip">{session.platform}</span>
          </div>
          <h1>{session.title}</h1>
          <div className="session-banner-meta">
            <span>
              Game: <strong>{session.gameTitle}</strong>
            </span>
            <span>
              Scheduled: <strong>{session.time}</strong>
            </span>
          </div>
        </div>
        <button className="leave-session-button" type="button">
          Leave Session
        </button>
      </section>

      <section className="session-detail-grid">
        <div className="session-detail-main">
          <article className="session-info-card">
            <h2>Session Info</h2>
            <p>{session.description}</p>
            <div className="requirements-row">
              <span>Requirements:</span>
              <strong>{session.requirements}</strong>
            </div>
          </article>

          <article className="chat-card">
            <h2>Coordination Chat</h2>
            <div className="chat-list">
              {session.chat.map((message) => (
                <div
                  className="chat-message"
                  key={`${message.author}-${message.time}-${message.message}`}
                >
                  <span className="chat-avatar" aria-hidden="true">
                    {message.author.slice(0, 1)}
                  </span>
                  <div className="chat-copy">
                    <div>
                      <strong>{message.author}</strong>
                      <span>{message.time}</span>
                    </div>
                    <p>{message.message}</p>
                  </div>
                </div>
              ))}
            </div>
            <form className="chat-composer">
              <input
                aria-label="Message"
                placeholder="Type a message to coordinate..."
                type="text"
              />
              <button type="submit">Send</button>
            </form>
          </article>
        </div>

        <aside className="roster-card" aria-label="Player roster">
          <h2>Player Roster</h2>
          <div className="roster-list">
            {session.roster.map((player) => (
              <div className="roster-row" key={`${player.name}-${player.status}`}>
                <span
                  className={`roster-avatar ${player.open ? "open" : ""}`}
                  aria-hidden="true"
                >
                  {player.open ? "+" : player.name.slice(0, 1)}
                </span>
                <div>
                  <strong>{player.name}</strong>
                  <span className={player.joined ? "joined" : ""}>
                    {player.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <Link className="primary-action roster-action" to={`/games/${session.gameId}`}>
            Back to Game
          </Link>
        </aside>
      </section>
    </div>
  );
}
