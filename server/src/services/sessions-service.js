import { createHttpError } from "../errors/http-error.js";
import { gamesRepository } from "../repositories/games-repository.js";
import { sessionsRepository } from "../repositories/sessions-repository.js";

export const sessionsService = {
  listSessions(query = {}) {
    const gameId = query.gameId ? String(query.gameId) : undefined;
    const platform = query.platform?.toLowerCase();
    const type = query.type?.toLowerCase();

    return sessionsRepository.findAll().filter((session) => {
      const matchesGame = gameId ? String(session.gameId) === gameId : true;
      const matchesPlatform = platform
        ? session.platform.toLowerCase().includes(platform)
        : true;
      const matchesType = type ? session.tone === type : true;

      return matchesGame && matchesPlatform && matchesType;
    });
  },

  getSession(sessionId) {
    const session = sessionsRepository.findById(sessionId);

    if (!session) {
      throw createHttpError(404, `Session not found: ${sessionId}`);
    }

    return session;
  },

  createSession(payload) {
    const game = gamesRepository.findRecordById(payload.gameId);

    if (!game) {
      throw createHttpError(422, "Cannot create a session for an unknown game.", {
        gameId: "Select a valid game.",
      });
    }

    const maxPlayers = Number(payload.maxPlayers);
    const session = {
      id: createSessionId(payload.title),
      platform: payload.platform,
      time: payload.time ?? "Flexible Time",
      title: payload.title.trim(),
      host: payload.host?.trim() || "PixelPulse",
      gameId: game.id,
      description: payload.description.trim(),
      requirements: payload.requirements?.trim() || "No specific requirements.",
      sessionType: payload.sessionType,
      maxPlayers,
    };

    return sessionsRepository.create(session);
  },
};

function createSessionId(title) {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return `${slug || "session"}-${Date.now()}`;
}
