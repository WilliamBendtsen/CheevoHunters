import { serializeSession } from "./session-serializer.js";

export function serializeGame(game) {
  return {
    id: game.legacyId ?? game.id,
    title: game.title,
    slug: game.slug,
    active: game.activePlayersLabel,
    sessions: game.sessionCount ?? 0,
    platforms: game.platforms.map((platform) => platform.name).join(", "),
    followers: formatFollowerCount(game.followerCount),
    coverUrl: game.coverUrl,
    detailSessions: game.detailSessions.map(serializeSession),
  };
}

function formatFollowerCount(value) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }

  return String(value);
}
