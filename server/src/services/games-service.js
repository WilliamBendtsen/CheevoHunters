import { createHttpError } from "../errors/http-error.js";
import { gamesRepository } from "../repositories/games-repository.js";

export const gamesService = {
  async listGames(query = {}) {
    const search = query.search?.toLowerCase();
    const platform = query.platform?.toLowerCase();

    const games = await gamesRepository.findAll();

    return games.filter((game) => {
      const matchesSearch = search
        ? game.title.toLowerCase().includes(search)
        : true;
      const matchesPlatform = platform
        ? game.platforms.toLowerCase().includes(platform)
        : true;

      return matchesSearch && matchesPlatform;
    });
  },

  async getGame(gameId) {
    const game = await gamesRepository.findById(gameId);

    if (!game) {
      throw createHttpError(404, `Game not found: ${gameId}`);
    }

    return game;
  },

  async indexIgdbGame(payload = {}) {
    const igdbId = Number(payload.igdbId);
    const title = typeof payload.title === "string" ? payload.title.trim() : "";

    if (!Number.isInteger(igdbId) || igdbId <= 0) {
      throw createHttpError(400, "IGDB game payload is invalid.", {
        igdbId: "Provide a valid IGDB id.",
      });
    }

    if (!title) {
      throw createHttpError(400, "IGDB game payload is invalid.", {
        title: "Provide a game title.",
      });
    }

    return gamesRepository.indexIgdbGame({
      igdbId,
      title,
      slug: typeof payload.slug === "string" ? payload.slug.trim() : "",
      coverUrl: typeof payload.coverUrl === "string" ? payload.coverUrl : null,
      platforms: Array.isArray(payload.platforms) ? payload.platforms : [],
    });
  },
};
