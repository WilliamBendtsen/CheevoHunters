import React from "react";
import { Link } from "react-router-dom";
import { games } from "../data/games";

export default function CreateSession() {
  function handleSubmit(event) {
    event.preventDefault();
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
            <select defaultValue="1">
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
              type="text"
            />
          </label>

          <label className="field field-small">
            <span>Platform</span>
            <span className="select-shell">
              <select defaultValue="pc-steam">
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
              <select defaultValue="achievement">
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
              <select defaultValue="4">
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
          <textarea defaultValue={'Looking for experienced players to tackle the "All Guns Blazing" achievement in the new DLC zone. Need to bring heavy weapon loadouts.'} />
        </label>

        <label className="field field-full">
          <span>Specific Requirements</span>
          <input
            defaultValue="Must have Discord & voice enabled. DLC installed."
            type="text"
          />
        </label>

        <div className="form-actions">
          <Link className="secondary-action" to="/">
            Cancel
          </Link>
          <button className="primary-action publish-action" type="submit">
            Publish Session
          </button>
        </div>
      </form>
    </div>
  );
}
