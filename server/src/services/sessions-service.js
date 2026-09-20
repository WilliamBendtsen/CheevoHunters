import { createHttpError } from "../errors/http-error.js";
import { gamesRepository } from "../repositories/games-repository.js";
import { sessionsRepository } from "../repositories/sessions-repository.js";

export const sessionsService = {
  async listSessions(query = {}) {
    const gameId = query.gameId ? String(query.gameId) : undefined;
    const platform = query.platform?.toLowerCase();
    const type = query.type?.toLowerCase();

    const sessions = await sessionsRepository.findAll();

    return sessions.filter((session) => {
      const matchesGame = gameId ? String(session.gameId) === gameId : true;
      const matchesPlatform = platform
        ? session.platform.toLowerCase().includes(platform)
        : true;
      const matchesType = type ? session.tone === type : true;

      return matchesGame && matchesPlatform && matchesType;
    });
  },

  async getSession(sessionId) {
    const session = await sessionsRepository.findById(sessionId);

    if (!session) {
      throw createHttpError(404, `Session not found: ${sessionId}`);
    }

    return session;
  },

  async createSession(payload) {
    const game = await gamesRepository.findRecordById(payload.gameId);

    if (!game) {
      throw createHttpError(422, "Cannot create a session for an unknown game.", {
        gameId: "Select a valid game.",
      });
    }

    const maxPlayers = Number(payload.maxPlayers);
    const session = {
      platform: payload.platform,
      time: payload.time ?? "Flexible Time",
      title: payload.title.trim(),
      hostUserId: payload.hostUserId,
      gameId: game.id,
      description: payload.description.trim(),
      requirements: payload.requirements?.trim() || "No specific requirements.",
      sessionType: payload.sessionType,
      maxPlayers,
    };

    return sessionsRepository.create(session);
  },
};
