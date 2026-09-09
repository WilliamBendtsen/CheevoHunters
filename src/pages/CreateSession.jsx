import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createSession, getGames } from "../api/client";

export default function CreateSession() {
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [status, setStatus] = useState("loading");
  const [submitStatus, setSubmitStatus] = useState("idle");

  useEffect(() => {
    let ignore = false;

    getGames()
      .then((data) => {
        if (!ignore) {
          setGames(data);
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
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitStatus("submitting");

    const formData = new FormData(event.currentTarget);

    try {
      const session = await createSession({
        gameId: formData.get("gameId"),
        title: formData.get("title"),
        platform: formData.get("platform"),
        sessionType: formData.get("sessionType"),
        maxPlayers: formData.get("maxPlayers"),
        description: formData.get("description"),
        requirements: formData.get("requirements"),
      });

      navigate(`/session/${session.id}`);
    } catch {
      setSubmitStatus("error");
    }
  }

  if (status === "loading") {
    return <p className="api-state">Loading games...</p>;
  }

  if (status === "error") {
    return <p className="api-state">Could not load games for the form.</p>;
  }

  return (
    <div className="create-session-page">
      <form className="create-session-card" onSubmit={handleSubmit}>
        <div className="create-session-intro">
          <h1>Create Matchmaking Session</h1>
          <p>Set up details to let matching players find and join you.</p>
        </div>

        <div className="form-divider" />

        <label className="field field-full">
          <span>Select Game</span>
          <span className="select-shell game-select-shell">
            <span className="field-icon" aria-hidden="true">
              CH
            </span>
            <select defaultValue={games[0]?.id} name="gameId">
              {games.map((game) => (
                <option key={game.id} value={game.id}>
                  {game.title}
                </option>
              ))}
            </select>
          </span>
        </label>

        <div className="form-row">
          <label className="field">
            <span>Session Title</span>
            <input
              defaultValue="Achievement Hunt: All Guns Blazing (Need 2)"
              name="title"
              type="text"
            />
          </label>

          <label className="field field-small">
            <span>Platform</span>
            <span className="select-shell">
              <select defaultValue="pc-steam" name="platform">
                <option value="pc-steam">PC (Steam)</option>
                <option value="pc-epic">PC (Epic)</option>
                <option value="ps5">PlayStation 5</option>
                <option value="xbox">Xbox Series X/S</option>
                <option value="crossplay">Crossplay</option>
              </select>
            </span>
          </label>
        </div>

        <div className="form-row">
          <label className="field">
            <span>Session Type</span>
            <span className="select-shell">
              <select defaultValue="achievement" name="sessionType">
                <option value="achievement">Achievement Hunting</option>
                <option value="coop">Co-op Campaign</option>
                <option value="competitive">Competitive Grind</option>
                <option value="casual">Casual / Social</option>
              </select>
            </span>
          </label>

          <label className="field field-small">
            <span>Max Players</span>
            <span className="select-shell">
              <select defaultValue="4" name="maxPlayers">
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
              </select>
            </span>
          </label>
        </div>

        <label className="field field-full">
          <span>Description & Goals</span>
          <textarea
            defaultValue={'Looking for experienced players to tackle the "All Guns Blazing" achievement in the new DLC zone. Need to bring heavy weapon loadouts.'}
            name="description"
          />
        </label>

        <label className="field field-full">
          <span>Specific Requirements</span>
          <input
            defaultValue="Must have Discord & voice enabled. DLC installed."
            name="requirements"
            type="text"
          />
        </label>

        <div className="form-actions">
          <Link className="secondary-action" to="/">
            Cancel
          </Link>
          <button
            className="primary-action publish-action"
            disabled={submitStatus === "submitting"}
            type="submit"
          >
            {submitStatus === "submitting" ? "Publishing..." : "Publish Session"}
          </button>
        </div>
        {submitStatus === "error" && (
          <p className="api-state">Could not publish the session.</p>
        )}
      </form>
    </div>
  );
}
