import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createSession, indexIgdbGame, searchIgdbGames } from "../api/client";

const getCoverStyle = (coverUrl) =>
  coverUrl ? { backgroundImage: `url(${coverUrl})` } : undefined;

const PLATFORM_PREVIEW_LIMIT = 3;

const platformDisplayRules = [
  { label: "PC", rank: 1, match: /windows|microsoft windows|\bpc\b/i },
  { label: "PS5", rank: 2, match: /playstation 5|\bps5\b/i },
  { label: "Xbox Series X/S", rank: 3, match: /xbox series/i },
  { label: "Nintendo Switch", rank: 4, match: /switch/i },
  { label: "PS4", rank: 5, match: /playstation 4|\bps4\b/i },
  { label: "Xbox One", rank: 6, match: /xbox one/i },
  { label: "Mac", rank: 7, match: /mac/i },
  { label: "Linux", rank: 8, match: /linux/i },
  { label: "iOS", rank: 9, match: /\bios\b|iphone|ipad/i },
  { label: "Android", rank: 10, match: /android/i },
  { label: "PS3", rank: 20, match: /playstation 3|\bps3\b/i },
  { label: "Xbox 360", rank: 21, match: /xbox 360/i },
  { label: "Wii U", rank: 30, match: /wii u/i },
  { label: "Nintendo 3DS", rank: 31, match: /3ds/i },
  { label: "Stadia", hidden: true, rank: 90, match: /stadia/i },
  { label: "Amazon Luna", hidden: true, rank: 91, match: /luna/i },
];

export default function CreateSession() {
  const navigate = useNavigate();
  const gameInputRef = useRef(null);
  const [submitStatus, setSubmitStatus] = useState("idle");
  const [gameQuery, setGameQuery] = useState("");
  const [selectedGame, setSelectedGame] = useState(null);
  const [igdbGames, setIgdbGames] = useState([]);
  const [searchStatus, setSearchStatus] = useState("idle");
  const [gamePickerOpen, setGamePickerOpen] = useState(false);
  const [highlightedGameId, setHighlightedGameId] = useState(null);
  const [gameError, setGameError] = useState("");

  const gameResults = useMemo(() => normalizeIgdbResults(igdbGames), [igdbGames]);

  useEffect(() => {
    const query = gameQuery.trim();

    if (
      query.length < 2 ||
      (selectedGame && selectedGame.title.toLowerCase() === query.toLowerCase())
    ) {
      setIgdbGames([]);
      setSearchStatus("idle");
      return undefined;
    }

    let ignore = false;
    setSearchStatus("searching");

    const timeoutId = window.setTimeout(() => {
      searchIgdbGames(query)
        .then((results) => {
          if (!ignore) {
            setIgdbGames(results);
            setSearchStatus("ready");
          }
        })
        .catch(() => {
          if (!ignore) {
            setIgdbGames([]);
            setSearchStatus("error");
          }
        });
    }, 300);

    return () => {
      ignore = true;
      window.clearTimeout(timeoutId);
    };
  }, [gameQuery, selectedGame]);

  useEffect(() => {
    if (gamePickerOpen) {
      setHighlightedGameId(gameResults[0]?.id ?? null);
    }
  }, [gamePickerOpen, gameResults]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitStatus("submitting");
    setGameError("");

    const formData = new FormData(event.currentTarget);

    try {
      const gameId = await resolveSelectedGameId();

      if (!gameId) {
        setGameError("Choose a game from the list before publishing.");
        setSubmitStatus("idle");
        gameInputRef.current?.focus();
        return;
      }

      const session = await createSession({
        gameId,
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

  async function resolveSelectedGameId() {
    if (!selectedGame) {
      return "";
    }

    if (selectedGame.source !== "igdb") {
      return selectedGame.id;
    }

    const indexedGame = await indexIgdbGame({
      igdbId: selectedGame.igdbId,
      title: selectedGame.title,
      slug: selectedGame.slug,
      coverUrl: selectedGame.coverUrl,
      platforms: selectedGame.platforms,
    });

    setSelectedGame(indexedGame);
    return indexedGame.id;
  }

  function handleGameQueryChange(event) {
    setGameQuery(event.target.value);
    setSelectedGame(null);
    setGameError("");
    setGamePickerOpen(true);
  }

  function handleGameInputKeyDown(event) {
    const currentIndex = gameResults.findIndex((game) => game.id === highlightedGameId);

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setGamePickerOpen(true);
      setHighlightedGameId(
        gameResults[Math.min(currentIndex + 1, gameResults.length - 1)]?.id ??
          gameResults[0]?.id ??
          null,
      );
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedGameId(
        gameResults[Math.max(currentIndex - 1, 0)]?.id ?? gameResults[0]?.id ?? null,
      );
    }

    if (event.key === "Enter" && gamePickerOpen && highlightedGameId) {
      event.preventDefault();
      const game = gameResults.find((result) => result.id === highlightedGameId);

      if (game) {
        selectGame(game);
      }
    }

    if (event.key === "Escape") {
      setGamePickerOpen(false);
    }
  }

  function selectGame(game) {
    setSelectedGame(game);
    setGameQuery(game.title);
    setGameError("");
    setGamePickerOpen(false);
  }

  return (
    <div className="create-session-page">
      <form className="create-session-card" onSubmit={handleSubmit}>
        <div className="create-session-intro">
          <h1>Create Matchmaking Session</h1>
          <p>Set up details to let matching players find and join you.</p>
        </div>

        <div className="form-divider" />

        <div className="field field-full game-picker-field">
          <span id="game-picker-label">Select Game</span>
          <input name="gameId" type="hidden" value={selectedGame?.id ?? ""} />
          <div
            className={`game-combobox ${gamePickerOpen ? "is-open" : ""}`}
            role="combobox"
            aria-controls="game-picker-results"
            aria-expanded={gamePickerOpen}
            aria-haspopup="listbox"
            aria-labelledby="game-picker-label"
          >
            <span className="field-icon" aria-hidden="true">
              CH
            </span>
            <input
              ref={gameInputRef}
              aria-activedescendant={
                highlightedGameId ? `game-option-${highlightedGameId}` : undefined
              }
              aria-autocomplete="list"
              autoComplete="off"
              onBlur={() => window.setTimeout(() => setGamePickerOpen(false), 120)}
              onChange={handleGameQueryChange}
              onFocus={() => setGamePickerOpen(true)}
              onKeyDown={handleGameInputKeyDown}
              placeholder="Search games..."
              type="search"
              value={gameQuery}
            />
            <button
              aria-label={gamePickerOpen ? "Close game list" : "Open game list"}
              className="game-picker-toggle"
              onClick={() => setGamePickerOpen((isOpen) => !isOpen)}
              type="button"
            />
          </div>
          {gamePickerOpen && (
            <div className="game-picker-results" id="game-picker-results" role="listbox">
              {gameResults.map((game) => (
                <button
                  aria-selected={selectedGame?.id === game.id}
                  className={`game-picker-option ${
                    highlightedGameId === game.id ? "is-highlighted" : ""
                  }`}
                  id={`game-option-${game.id}`}
                  key={`${game.source}-${game.id}`}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setHighlightedGameId(game.id)}
                  onClick={() => selectGame(game)}
                  role="option"
                  type="button"
                >
                  <span
                    className={`game-picker-cover ${game.coverUrl ? "has-cover" : ""}`}
                    style={getCoverStyle(game.coverUrl)}
                    aria-hidden="true"
                  />
                  <span className="game-picker-copy">
                    <strong>{game.title}</strong>
                    <span>{game.platformsLabel || "IGDB result"}</span>
                  </span>
                </button>
              ))}
              {searchStatus === "searching" && (
                <p className="game-picker-status">Searching IGDB...</p>
              )}
              {searchStatus === "error" && (
                <p className="game-picker-status">Could not search IGDB.</p>
              )}
              {gameQuery.trim().length > 0 && gameQuery.trim().length < 2 && (
                <p className="game-picker-status">Type at least 2 characters.</p>
              )}
              {gameResults.length === 0 &&
                searchStatus !== "searching" &&
                gameQuery.trim().length !== 1 && (
                  <p className="game-picker-status">
                    {gameQuery.trim().length >= 2
                      ? "No matching games found."
                      : "Start typing to search games."}
                  </p>
                )}
            </div>
          )}
          {selectedGame?.source === "igdb" && (
            <p className="game-picker-note">
              This game will be prepared for your session when you publish.
            </p>
          )}
          {gameError && <p className="field-error">{gameError}</p>}
        </div>

        <div className="form-row">
          <label className="field">
            <span>Session Title</span>
            <input
              name="title"
              placeholder="Summarize the session goal and party size"
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
            name="description"
            placeholder="Describe what you want to complete, how long it may take, and what kind of players should join"
          />
        </label>

        <label className="field field-full">
          <span>Specific Requirements</span>
          <input
            name="requirements"
            placeholder="Add voice chat, DLC, level, build, region, or experience requirements"
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

function normalizeIgdbResults(games) {
  return games.map((game) => ({
    ...game,
    id: `igdb-${game.igdbId}`,
    source: "igdb",
    platformsLabel: formatPlatformPreview(game.platforms),
  }));
}

function formatPlatformPreview(platforms) {
  if (!Array.isArray(platforms) || platforms.length === 0) {
    return "";
  }

  const sortedPlatforms = sortPlatformsByRelevance(platforms);
  const previewPool = sortedPlatforms.filter((platform) => !platform.hidden);

  if (previewPool.length === 0) {
    return "";
  }

  const visiblePlatforms = previewPool.slice(0, PLATFORM_PREVIEW_LIMIT);
  const hiddenCount = previewPool.length - visiblePlatforms.length;
  const label = visiblePlatforms.map((platform) => platform.label).join(", ");

  return hiddenCount > 0 ? `${label} +${hiddenCount} more` : label;
}

function sortPlatformsByRelevance(platforms) {
  const platformsByLabel = new Map();

  for (const platform of platforms) {
    const normalizedPlatform = normalizePlatform(platform);
    const existingPlatform = platformsByLabel.get(normalizedPlatform.label);

    if (!existingPlatform || normalizedPlatform.rank < existingPlatform.rank) {
      platformsByLabel.set(normalizedPlatform.label, normalizedPlatform);
    }
  }

  return Array.from(platformsByLabel.values()).sort(
    (a, b) => a.rank - b.rank || a.label.localeCompare(b.label),
  );
}

function normalizePlatform(platform) {
  const name = String(platform);
  const rule = platformDisplayRules.find((item) => item.match.test(name));

  if (rule) {
    return {
      label: rule.label,
      rank: rule.rank,
      hidden: Boolean(rule.hidden),
    };
  }

  return {
    label: name,
    rank: 50,
    hidden: false,
  };
}
